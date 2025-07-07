document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    async function getOrCreateEstabelecimento(nome) {
        const { data: existente, error: errorBusca } = await window.supabaseClient
            .from('estabelecimentos')
            .select('id')
            .eq('nome', nome)
            .single();

        if (errorBusca && errorBusca.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw errorBusca;
        }

        if (existente) {
            return existente.id;
        } else {
            const { data: novo, error: errorInsert } = await window.supabaseClient
                .from('estabelecimentos')
                .insert([{ nome }])
                .select('id')
                .single();

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
                economia = piorOpcao.precoPorLitro - melhorOpcao.precoPorLitro;
            } else {
                melhorOpcao = { nome: marca, volume: volume2, precoPorLitro: precoPorLitro2 };
                piorOpcao = { precoPorLitro: precoPorLitro1 };
                economia = piorOpcao.precoPorLitro - melhorOpcao.precoPorLitro;
            }

            resultadoDiv.innerHTML = `
                <div class="winner-card">
                    <span class="winner-tag">Mais Barata</span>
                    <h2>A ${melhorOpcao.nome} de ${melhorOpcao.volume}ml é a melhor opção!</h2>
                    <p class="price-per-liter">Preço por litro: <strong>R$ ${melhorOpcao.precoPorLitro.toFixed(2)}</strong></p>
                    ${economia > 0 ? `<p class="savings">Você economiza R$ ${economia.toFixed(2)} por litro em comparação com a outra opção.</p>` : '<p class="savings">As duas opções têm o mesmo preço.</p>'}
                </div>
            `;

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
