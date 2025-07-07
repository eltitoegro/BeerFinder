document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    async function getOrCreateEstabelecimento(nome) {
        // Fetch all establishments with the given name
        const { data: existentes, error: errorBusca } = await window.supabaseClient
            .from('estabelecimentos')
            .select('id')
            .eq('nome', nome);

        if (errorBusca) {
            // If there's a real error, throw it
            throw errorBusca;
        }

        // If one or more establishments exist, return the ID of the first one
        if (existentes && existentes.length > 0) {
            return existentes[0].id;
        } else {
            // If it doesn't exist, create it
            const { data: novo, error: errorInsert } = await window.supabaseClient
                .from('estabelecimentos')
                .insert([{ nome }])
                .select('id')
                .single(); // .single() is correct here as we expect one new row

            if (errorInsert) {
                throw errorInsert;
            }
            return novo.id;
        }
    }

    async function populateEstabelecimentosSelect() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');
            if (error) throw error;

            while (estabelecimentoSelect.options.length > 2) {
                estabelecimentoSelect.remove(2);
            }

            data.forEach(estab => {
                const option = document.createElement('option');
                option.value = estab.nome;
                option.textContent = estab.nome;
                estabelecimentoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos:', error);
        }
    }

    populateEstabelecimentosSelect();

    estabelecimentoSelect.addEventListener('change', () => {
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = '';
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let nomeEstabelecimento;
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value;
        }

        const marca = document.getElementById('marca').value.trim();
        const volume1 = parseInt(document.getElementById('volume1').value);
        const preco1 = parseFloat(document.getElementById('preco1').value);
        const volume2 = parseInt(document.getElementById('volume2').value);
        const preco2 = parseFloat(document.getElementById('preco2').value);

        if (!nomeEstabelecimento || !marca || isNaN(volume1) || isNaN(preco1) || isNaN(volume2) || isNaN(preco2)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        try {
            const estabelecimento_id = await getOrCreateEstabelecimento(nomeEstabelecimento);

            const cervejasParaInserir = [
                { marca, volume: volume1, preco: preco1, estabelecimento_id, tipo_envase: 'comparador' },
                { marca, volume: volume2, preco: preco2, estabelecimento_id, tipo_envase: 'comparador' }
            ];

            await window.supabaseClient.from('cervejas').insert(cervejasParaInserir);

            const precoPorLitro1 = (preco1 / volume1) * 1000;
            const precoPorLitro2 = (preco2 / volume2) * 1000;

            let melhorOpcao, piorOpcao, economia;
            if (precoPorLitro1 < precoPorLitro2) {
                melhorOpcao = { nome: marca, volume: volume1, precoPorLitro: precoPorLitro1 };
                piorOpcao = { precoPorLitro: precoPorLitro2 };
            } else {
                melhorOpcao = { nome: marca, volume: volume2, precoPorLitro: precoPorLitro2 };
                piorOpcao = { precoPorLitro: precoPorLitro1 };
            }
            economia = piorOpcao.precoPorLitro - melhorOpcao.precoPorLitro;
            const percentualEconomia = economia > 0 ? (economia / piorOpcao.precoPorLitro) * 100 : 0;

            let resultadoHTML;

            if (economia > 0) {
                resultadoHTML = `
                <div style="font-family: 'Roboto', sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); padding: 25px; text-align: center; color: #333;">
                    <div style="font-size: 3.5em; line-height: 1;">🎉</div>
                    <h2 style="font-family: 'Oswald', sans-serif; font-size: 2.2em; font-weight: 700; margin: 15px 0 10px; color: #28a745;">¡Victoria para tu bolsillo!</h2>
                    <p style="font-size: 1.2em; margin: 0 0 20px; color: #555;">
                        La <strong>${melhorOpcao.nome} de ${melhorOpcao.volume}ml</strong> es la ganadora indiscutible.
                    </p>
                    <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; margin: 20px 0;">
                        <span style="font-size: 1em; color: #6c757d; display: block; text-transform: uppercase; letter-spacing: 1px;">Precio por Litro</span>
                        <span style="font-size: 2.8em; font-weight: 700; color: #28a745; display: block; line-height: 1.2;">R$ ${melhorOpcao.precoPorLitro.toFixed(2)}</span>
                    </div>
                    <div style="background-color: #f0fff4; border-radius: 8px; padding: 15px; margin-top: 20px;">
                        <p style="font-size: 1.2em; margin: 0 0 10px 0; font-weight: 500;">
                            ¡Estás ahorrando un <strong>${percentualEconomia.toFixed(0)}%</strong>!
                        </p>
                        <p style="font-size: 1em; margin: 0; color: #555;">
                            Eso es <strong>R$ ${economia.toFixed(2)}</strong> menos por cada litro. ¡Salud por esa sabia decisión! 🍻
                        </p>
                    </div>
                </div>
                `;
            } else {
                resultadoHTML = `
                <div style="font-family: 'Roboto', sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); padding: 25px; text-align: center; color: #333;">
                    <div style="font-size: 3.5em; line-height: 1;">🤝</div>
                    <h2 style="font-family: 'Oswald', sans-serif; font-size: 2.2em; font-weight: 700; margin: 15px 0 10px; color: #495057;">¡Es un empate!</h2>
                    <p style="font-size: 1.2em; margin: 0 0 20px; color: #555;">
                        Ambas cervezas tienen el mismo precio por litro.
                    </p>
                    <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; margin: 20px 0;">
                        <span style="font-size: 1em; color: #6c757d; display: block; text-transform: uppercase; letter-spacing: 1px;">Precio por Litro</span>
                        <span style="font-size: 2.8em; font-weight: 700; color: #343a40; display: block; line-height: 1.2;">R$ ${melhorOpcao.precoPorLitro.toFixed(2)}</span>
                    </div>
                    <p style="font-size: 1.1em; margin-top: 20px; color: #555;">
                        Cualquier elección es una buena elección. ¡A disfrutar!
                    </p>
                </div>
                `;
            }

            resultadoDiv.innerHTML = resultadoHTML;

            resultadoDiv.classList.remove('hidden');
            form.reset();
            newEstabelecimentoNameInput.style.display = 'none';
            populateEstabelecimentosSelect();

        } catch (error) {
            console.error('Erro no processo de comparação:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        }
    });
});
