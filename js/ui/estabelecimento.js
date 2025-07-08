document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('estabelecimentoForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const latitudeValue = parseFloat(document.getElementById('latitude').value);
        const longitudeValue = parseFloat(document.getElementById('longitude').value);

        const novoEstabelecimento = {
            nome: document.getElementById('nome').value,
            latitude: isNaN(latitudeValue) ? null : latitudeValue,
            longitude: isNaN(longitudeValue) ? null : longitudeValue
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
            document.getElementById('estabelecimentoForm').reset();
        }
    });
});