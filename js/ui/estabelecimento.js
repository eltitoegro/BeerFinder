document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('estabelecimentoForm');
    const getLocationBtn = document.getElementById('getLocationBtnEstab');
    const geolocatedCoordinatesInput = document.getElementById('geolocatedCoordinates');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    let geolocatedLat = null;
    let geolocatedLon = null;

    getLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                geolocatedLat = position.coords.latitude;
                geolocatedLon = position.coords.longitude;
                geolocatedCoordinatesInput.value = `Lat: ${geolocatedLat}, Lon: ${geolocatedLon}`;
                // Clear manual inputs if geolocation is successful
                latitudeInput.value = '';
                longitudeInput.value = '';
            }, error => {
                console.error('Erro ao obter localização:', error);
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
                geolocatedLat = null;
                geolocatedLon = null;
                geolocatedCoordinatesInput.value = '';
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        let finalLatitude = null;
        let finalLongitude = null;

        if (geolocatedLat !== null && geolocatedLon !== null) {
            finalLatitude = geolocatedLat;
            finalLongitude = geolocatedLon;
        } else {
            const manualLatitude = parseFloat(latitudeInput.value);
            const manualLongitude = parseFloat(longitudeInput.value);
            if (!isNaN(manualLatitude) && !isNaN(manualLongitude)) {
                finalLatitude = manualLatitude;
                finalLongitude = manualLongitude;
            }
        }

        const novoEstabelecimento = {
            nome: document.getElementById('nome').value,
            latitude: finalLatitude,
            longitude: finalLongitude
        };

        const contatoValue = document.getElementById('contato').value;
        if (contatoValue) {
            novoEstabelecimento.contato = contatoValue;
        }

        const horarioFuncionamentoValue = document.getElementById('horarioFuncionamento').value;
        if (horarioFuncionamentoValue) {
            novoEstabelecimento.horario_funcionamento = horarioFuncionamentoValue;
        }

        const tipoEstabelecimentoValue = document.getElementById('tipoEstabelecimento').value;
        if (tipoEstabelecimentoValue) {
            novoEstabelecimento.tipo = tipoEstabelecimentoValue;
        }

        const observacoesValue = document.getElementById('observacoes').value;
        if (observacoesValue) {
            novoEstabelecimento.observacoes = observacoesValue;
        }

        const { data, error } = await window.supabaseClient
            .from('estabelecimentos')
            .insert([novoEstabelecimento])
            .select('*');

        if (error) {
            console.error('Erro ao cadastrar estabelecimento:', error);
            alert('Erro ao cadastrar. Verifique o console para mais detalhes.');
        } else {
            console.log('Estabelecimento cadastrado com sucesso:', data);
            alert('Estabelecimento cadastrado com sucesso!');
            form.reset();
            geolocatedCoordinatesInput.value = ''; // Clear geolocated display
            geolocatedLat = null;
            geolocatedLon = null;
        }
    });
});