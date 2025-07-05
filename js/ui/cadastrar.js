import { getOrCreateEstabelecimento } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    // Function to fetch and populate establishments select
    async function populateEstabelecimentosSelect() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');

            if (error) throw error;

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
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos:', error);
        }
    }

    // Populate select on page load
    populateEstabelecimentosSelect();

    estabelecimentoSelect.addEventListener('change', () => {
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = ''; // Clear the input if not adding new
        }
    });

    document.getElementById('beerForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const marca = document.getElementById('marca').value;
        const preco = parseFloat(document.getElementById('preco').value);
        const volume = parseInt(document.getElementById('volume').value);
        const tipo_envase = document.getElementById('tipoEnvase').value;
        
        let nomeEstabelecimento = '';
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value.trim();
        }

        let estabelecimento_id = null;

        if (!nomeEstabelecimento || nomeEstabelecimento.trim() === '') {
            alert('O nome do estabelecimento é obrigatório.');
            return;
        }

        try {
            estabelecimento_id = await getOrCreateEstabelecimento(nomeEstabelecimento);
            populateEstabelecimentosSelect(); // Update the select with the new establishment if created
        } catch (error) {
            console.error('Erro ao processar estabelecimento:', error);
            alert('Erro ao processar estabelecimento: ' + error.message);
            return;
        }

        // Now insert the beer using the correct estabelecimento_id
        const { error: errorCerveja } = await window.supabaseClient
          .from('cervejas')
          .insert([{
            marca,
            preco,
            volume,
            tipo_envase,
            estabelecimento_id
          }]);

        if (errorCerveja) {
          console.error('Erro ao cadastrar cerveja:', errorCerveja);
          alert('Erro ao cadastrar cerveja: ' + errorCerveja.message);
        } else {
            alert('Cerveja cadastrada com sucesso!');
            document.getElementById('beerForm').reset();
        }
    });

    document.getElementById('getLocationBtn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                document.getElementById('localizacao').value = `Lat: ${lat}, Lon: ${lon}`;
                
            }, error => {
                console.error('Erro ao obter localização:', error);
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });
});