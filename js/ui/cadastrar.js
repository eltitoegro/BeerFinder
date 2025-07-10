import { getOrCreateEstabelecimento } from '../utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    // Função para buscar e popular o select de estabelecimentos
    async function populateEstabelecimentosSelect() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');

            if (error) throw error;

            // Ordena los establecimientos alfabéticamente por nombre
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            // Limpia las opciones existentes, excepto las dos primeras (placeholder y adicionar nuevo)
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

    // Popula o select ao carregar a página
    populateEstabelecimentosSelect();

    estabelecimentoSelect.addEventListener('change', () => {
        console.log('Valor seleccionado:', estabelecimentoSelect.value);
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = ''; // Limpa o input se não estiver adicionando um novo
        }
    });

    document.getElementById('beerForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const marca = document.getElementById('marca').value;
        const preco = parseFloat(document.getElementById('preco').value);
        const volume = parseInt(document.getElementById('volume').value);
        
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

        // Agora insere a cerveja usando o estabelecimento_id correto
        const { error: errorCerveja } = await window.supabaseClient
          .from('cervejas')
          .insert([{
            marca,
            preco,
            volume,
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
                let errorMessage = 'Não foi possível obter sua localização.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage += ' Por favor, verifique as permissões de localização do seu navegador e do seu dispositivo.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage += ' A informação de localização não está disponível.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage += ' A tentativa de obter a localização expirou.';
                }
                alert(errorMessage);
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });
});