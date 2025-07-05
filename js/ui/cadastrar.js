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

        // Try to find existing establishment by name
        const { data: existente, error: errorBusca } = await window.supabaseClient
          .from('estabelecimentos')
          .select('id')
          .eq('nome', nome)
          .single();

        if (errorBusca && errorBusca.code != 'PGRST116') { // PGRST116 means no rows found, which is not an error here
          console.error('Erro ao buscar estabelecimento:', errorBusca);
          alert('Erro ao buscar estabelecimento: ' + errorBusca.message);
          return;
        }

        if (existente) {
          estabelecimento_id = existente.id;
        } else {
          // Create new establishment if not found
          const { data: novo, error: errorInsert } = await window.supabaseClient
            .from('estabelecimentos')
            .insert([{ nome }])
            .select('id')
            .single();

          if (errorInsert) {
            console.error('Erro ao criar estabelecimento:', errorInsert);
            alert('Erro ao criar estabelecimento: ' + errorInsert.message);
            return;
          }
          estabelecimento_id = novo.id;
          populateEstabelecimentosDatalist(); // Update the datalist with the new establishment
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