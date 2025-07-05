document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('beerForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const localizacaoValue = document.getElementById('localizacao').value;
        const novaCerveja = {
            marca: document.getElementById('marca').value,
            preco: parseFloat(document.getElementById('preco').value),
            volume: parseInt(document.getElementById('volume').value),
            tipo_envase: document.getElementById('tipoEnvase').value,
            estabelecimento: document.getElementById('estabelecimento').value,
            // data_cadastro will be added by Supabase trigger or default value
        };

        // If geolocation was used, add latitude and longitude
        if (localizacaoValue.startsWith('Lat:')) {
            const parts = localizacaoValue.match(/Lat: (.*), Lon: (.*)/);
            if (parts && parts.length === 3) {
                novaCerveja.latitude = parseFloat(parts[1]);
                novaCerveja.longitude = parseFloat(parts[2]);
            }
        } else if (localizacaoValue) {
            novaCerveja.localizacao = localizacaoValue;
        }

        const { data, error } = await window.supabaseClient
            .from('cervejas')
            .insert([novaCerveja])
            .select('*'); // Select all columns after insert

        if (error) {
            console.error('Erro ao cadastrar cerveja:', error);
            alert('Erro ao cadastrar. Verifique o console para mais detalhes.');
        } else {
            console.log('Cerveja cadastrada com sucesso:', data);
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
