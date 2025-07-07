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

            // Clear existing options except the first two
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
            alert('Não foi possível carregar a lista de estabelecimentos. Verifique a conexão e tente recarregar a página.');
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

            const { error: errorCerveja } = await window.supabaseClient
                .from('cervejas')
                .insert(cervejasParaInserir);

            if (errorCerveja) throw errorCerveja;

            const precoPorMl1 = preco1 / volume1;
            const precoPorMl2 = preco2 / volume2;

            let resultadoHTML = '';
            if (precoPorMl1 < precoPorMl2) {
                resultadoHTML = `<h2>A Opção 1 é a mais barata!</h2><p>Economia de R$ ${(precoPorMl2 - precoPorMl1).toFixed(4)} por ml.</p>`;
            } else if (precoPorMl2 < precoPorMl1) {
                resultadoHTML = `<h2>A Opção 2 é a mais barata!</h2><p>Economia de R$ ${(precoPorMl1 - precoPorMl2).toFixed(4)} por ml.</p>`;
            } else {
                resultadoHTML = `<h2>Ambas as opções têm o mesmo preço por ml.</h2>`;
            }

            resultadoDiv.innerHTML = resultadoHTML;
            resultadoDiv.classList.remove('hidden');
            alert('Comparação salva com sucesso!');

            // Reset form and update list
            form.reset();
            newEstabelecimentoNameInput.style.display = 'none';
            populateEstabelecimentosSelect();

        } catch (error) {
            console.error('Erro no processo de comparação:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        }
    });
});