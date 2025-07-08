document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('estabelecimentoForm');
    const getLocationBtn = document.getElementById('getLocationBtnEstab');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    getLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                latitudeInput.value = position.coords.latitude;
                longitudeInput.value = position.coords.longitude;
            }, error => {
                console.error('Erro ao obter localização:', error);
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const novoEstabelecimento = {
            nome: document.getElementById('nome').value,
            latitude: parseFloat(latitudeInput.value) || null,
            longitude: parseFloat(longitudeInput.value) || null
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
        }
    });
});