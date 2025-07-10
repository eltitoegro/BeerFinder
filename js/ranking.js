document.addEventListener('DOMContentLoaded', () => {
    const beerSelect = document.getElementById('beerSelect');
    const volumeSelect = document.getElementById('volumeSelect');
    const searchRankingBtn = document.getElementById('searchRankingBtn');
    const rankingResultsDiv = document.getElementById('rankingResults');

    let allCervejas = []; // Para armazenar todas as cervejas e filtrar por marca/volume

    // Função para formatar preço
    const formatPrice = (value) => {
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    };

    // Função para calcular preço por litro
    const calculatePricePerLiter = (price, volume) => {
        return (price / (volume / 1000));
    };

    // Função para capitalizar a primeira letra
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Popula o select de cervejas
    async function populateBeerSelect() {
        try {
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select('marca, volume');

            if (error) throw error;
            allCervejas = data; // Armazena todas as cervejas

            const uniqueBeers = Array.from(new Set(data.map(item => item.marca))).sort();

            beerSelect.innerHTML = '<option value="">Selecione uma cerveja</option>';
            uniqueBeers.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca;
                option.textContent = marca;
                beerSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Erro ao carregar opções de cerveja:', error);
            rankingResultsDiv.innerHTML = '<p class="empty-state">Erro ao carregar cervejas. Tente novamente mais tarde.</p>';
        }
    }

    // Popula o select de volume baseado na cerveja selecionada
    function populateVolumeSelect(selectedMarca) {
        volumeSelect.innerHTML = '<option value="">Selecione o volume</option>';
        if (!selectedMarca) {
            volumeSelect.innerHTML = '<option value="">Selecione a cerveja primeiro</option>';
            return;
        }

        const volumesForMarca = new Set();
        allCervejas.filter(beer => beer.marca === selectedMarca)
                   .forEach(beer => volumesForMarca.add(beer.volume));

        const sortedVolumes = Array.from(volumesForMarca).sort((a, b) => a - b);

        sortedVolumes.forEach(volume => {
            const option = document.createElement('option');
            option.value = volume;
            option.textContent = `${volume}ml`;
            volumeSelect.appendChild(option);
        });
    }

    // Busca e exibe o ranking
    async function fetchAndDisplayRanking() {
        const selectedMarca = beerSelect.value;
        const selectedVolume = parseInt(volumeSelect.value);

        if (!selectedMarca || isNaN(selectedVolume)) {
            rankingResultsDiv.innerHTML = '<p class="empty-state">Por favor, selecione uma cerveja e um volume.</p>';
            return;
        }

        rankingResultsDiv.innerHTML = '<p class="empty-state">Carregando ranking...</p>';

        try {
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select(`
                    preco,
                    volume,
                    created_at,
                    estabelecimentos ( nome, tipo, latitude, longitude )
                `)
                .eq('marca', selectedMarca)
                .eq('volume', selectedVolume)
                .order('preco', { ascending: true });

            if (error) throw error;

            if (data.length === 0) {
                rankingResultsDiv.innerHTML = '<p class="empty-state">Não foram encontrados preços para esta cerveja e volume.</p>';
                return;
            }

            const bestPricesByEstablishment = new Map();

            data.forEach(item => {
                const estabelecimentoNome = item.estabelecimentos ? item.estabelecimentos.nome : 'Desconhecido';
                const precoPorLitro = calculatePricePerLiter(item.preco, item.volume);

                // Si el establecimiento no está en el mapa o si encontramos un precio mejor
                if (!bestPricesByEstablishment.has(estabelecimentoNome) || precoPorLitro < bestPricesByEstablishment.get(estabelecimentoNome).precoPorLitro) {
                    bestPricesByEstablishment.set(estabelecimentoNome, {
                        itemData: item,
                        precoPorLitro: precoPorLitro
                    });
                }
            });

            // Convertir el mapa a un array y ordenar por precio por litro
            const sortedEstablishments = Array.from(bestPricesByEstablishment.values()).sort((a, b) => a.precoPorLitro - b.precoPorLitro);

            // Tomar los 5 primeros establecimientos
            const top5Establishments = sortedEstablishments.slice(0, 5);

            if (top5Establishments.length === 0) {
                rankingResultsDiv.innerHTML = '<p class="empty-state">Não foram encontrados preços para esta cerveja e volume.</p>';
                return;
            }

            let rankingHTML = '';
            top5Establishments.forEach((entry, index) => {
                const item = entry.itemData;
                const estabelecimentoNome = item.estabelecimentos ? item.estabelecimentos.nome : 'Desconhecido';
                const date = new Date(item.created_at).toLocaleDateString('pt-BR');
                const precoPorLitro = entry.precoPorLitro; // Usar el precio por litro ya calculado y almacenado

                rankingHTML += `
                    <div class="ranking-item">
                        <div class="ranking-position">${index + 1}º</div>
                        <div class="ranking-details">
                            <div class="establishment-info">
                                ${item.estabelecimentos.tipo ? `<span class="establishment-type">${capitalizeFirstLetter(item.estabelecimentos.tipo)}</span> ` : ''}
                                <span class="establishment-name">${capitalizeFirstLetter(estabelecimentoNome)}</span>
                            </div>
                            <span class="ranking-price">${formatPrice(item.preco)}</span>
                            <span class="ranking-volume">(${item.volume}ml)</span>
                            <span class="ranking-price-liter">R$ ${precoPorLitro.toFixed(2)}/Litro</span>
                            <div class="establishment-location-link">
                                <a href="https://www.google.com/maps/search/?api=1&query=${item.estabelecimentos.latitude},${item.estabelecimentos.longitude}" target="_blank" class="location-link">📍 Clique aqui para saber onde fica</a>
                            </div>
                            <span class="ranking-date">Registrado em: ${date}</span>
                        </div>
                    </div>
                `;
            });
            rankingResultsDiv.innerHTML = rankingHTML;

        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            rankingResultsDiv.innerHTML = '<p class="empty-state">Erro ao carregar o ranking. Tente novamente mais tarde.</p>';
        }
    }

    // Event Listeners
    beerSelect.addEventListener('change', (event) => {
        populateVolumeSelect(event.target.value);
    });

    searchRankingBtn.addEventListener('click', fetchAndDisplayRanking);

    // Inicializa a população do select de cervejas
    populateBeerSelect();
});