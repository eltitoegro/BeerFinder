import { getOrCreateEstabelecimento } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const estabelecimentoInput = document.getElementById('estabelecimento');
    const estabelecimentosList = document.getElementById('estabelecimentosList');

    // Function to fetch and populate establishments datalist
    async function populateEstabelecimentosDatalist() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');

            if (error) throw error;

            estabelecimentosList.innerHTML = ''; // Clear previous options
            data.forEach(estab => {
                const option = document.createElement('option');
                option.value = estab.nome;
                option.dataset.id = estab.id; // Store the ID for later use
                estabelecimentosList.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos para o datalist:', error);
        }
    }

    // Populate datalist on page load
    populateEstabelecimentosDatalist();

    document.getElementById('beerForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const marca = document.getElementById('marca').value;
        const preco = parseFloat(document.getElementById('preco').value);
        const volume = parseInt(document.getElementById('volume').value);
        const tipo_envase = document.getElementById('tipoEnvase').value;
        const nome = document.getElementById('estabelecimento').value;
        let estabelecimento_id = null;

        if (!nome || nome.trim() === '') {
            alert('O nome do estabelecimento é obrigatório.');
            return;
        }

        try {
            estabelecimento_id = await getOrCreateEstabelecimento(nome);
            populateEstabelecimentosDatalist(); // Update the datalist with the new establishment if created
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