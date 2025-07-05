import { getOrCreateEstabelecimento } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    // Debugging: Check if elements are found on DOMContentLoaded
    console.log('DOMContentLoaded: form', form);
    console.log('DOMContentLoaded: resultadoDiv', resultadoDiv);
    console.log('DOMContentLoaded: estabelecimentoSelect', estabelecimentoSelect);
    console.log('DOMContentLoaded: newEstabelecimentoNameInput', newEstabelecimentoNameInput);
    console.log('DOMContentLoaded: marca', document.getElementById('marca'));
    console.log('DOMContentLoaded: volume1', document.getElementById('volume1'));
    console.log('DOMContentLoaded: preco1', document.getElementById('preco1'));
    console.log('DOMContentLoaded: volume2', document.getElementById('volume2'));
    console.log('DOMContentLoaded: preco2', document.getElementById('preco2'));

    async function populateEstabelecimentosSelect() {
        console.log('Debug: populateEstabelecimentosSelect called');
        if (!estabelecimentoSelect) {
            console.error('populateEstabelecimentosSelect: #estabelecimentoSelect is null. Cannot populate.');
            return;
        }
        try {
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');
            
            if (error) {
                console.error('Debug: Error fetching establishments:', error);
                throw error;
            }
            console.log('Debug: Establishments fetched:', data);

            // Clear existing options except the first two (placeholder and add new)
            while (estabelecimentoSelect.options.length > 2) {
                estabelecimentoSelect.remove(2);
            }

            data.forEach(estab => {
                const option = document.createElement('option');
                option.value = estab.nome;
                option.textContent = estab.nome;
                estabelecimentoSelect.appendChild(option);
            });
            console.log('Debug: Establishments select populated.');
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos:', error);
        }
    }

    populateEstabelecimentosSelect();

    estabelecimentoSelect.addEventListener('change', () => {
        if (!estabelecimentoSelect || !newEstabelecimentoNameInput) {
            console.error('Error: establishment select or new establishment input is null.');
            return;
        }
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = ''; // Clear the input if not adding new
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get elements inside the submit listener to ensure they are available
        const marcaInput = document.getElementById('marca');
        const volume1Input = document.getElementById('volume1');
        const preco1Input = document.getElementById('preco1');
        const volume2Input = document.getElementById('volume2');
        const preco2Input = document.getElementById('preco2');

        // More robust null checks
        if (!estabelecimentoSelect || !newEstabelecimentoNameInput || !marcaInput || !volume1Input || !preco1Input || !volume2Input || !preco2Input) {
            console.error('Error: One or more form elements are null. Cannot submit.');
            alert('Error interno: Faltan elementos del formulario. Por favor, recargue la página.');
            return;
        }

        const marca = marcaInput.value.trim();
        const volume1 = parseInt(volume1Input.value);
        const preco1 = parseFloat(preco1Input.value);
        const volume2 = parseInt(volume2Input.value);
        const preco2 = parseFloat(preco2Input.value);

        if (!marca || isNaN(volume1) || isNaN(preco1) || isNaN(volume2) || isNaN(preco2)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        let nomeEstabelecimento = '';
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value.trim();
        }

        if (!nomeEstabelecimento) {
            alert('O nome do estabelecimento é obrigatório.');
            return;
        }

        let estabelecimento_id = null;

        try {
            console.log('Debug: Calling getOrCreateEstabelecimento with:', nomeEstabelecimento);
            estabelecimento_id = await getOrCreateEstabelecimento(nomeEstabelecimento);
            console.log('Debug: Received estabelecimento_id:', estabelecimento_id);
            populateEstabelecimentosSelect(); // Update the select with the new establishment if created
        } catch (error) {
            console.error('Erro ao processar estabelecimento:', error);
            alert(`Ocorreu um erro: ${error.message}`);
            return;
        }

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

        } catch (error) {
            console.error('Erro no processo de comparação:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        }
    });
});