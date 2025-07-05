document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('estabelecimentoForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const enderecoValue = document.getElementById('enderecoEstabelecimento').value;
        const novoEstabelecimento = {
            nome: document.getElementById('nome').value,
            // horario_funcionamento: document.getElementById('horarioFuncionamento').value, // Removed for now
            endereco: enderecoValue // Now includes the 'endereco' field
        };

        const contatoValue = document.getElementById('contato').value;
        if (contatoValue) {
            novoEstabelecimento.contato = contatoValue;
        }

        const { data, error } = await supabase
            .from('estabelecimentos')
            .insert([novoEstabelecimento])
            .select('*');

        if (error) {
            console.error('Erro ao cadastrar estabelecimento:', error);
            alert('Erro ao cadastrar. Verifique o console para mais detalhes.');
        } else {
            console.log('Estabelecimento cadastrado com sucesso:', data);
            alert('Estabelecimento cadastrado com sucesso!');
            document.getElementById('estabelecimentoForm').reset();
        }
    });

    document.getElementById('getLocationBtnEstab').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                document.getElementById('enderecoEstabelecimento').value = `Lat: ${lat}, Lon: ${lon}`;
                
            }, error => {
                console.error('Erro ao obter localização:', error);
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });
});