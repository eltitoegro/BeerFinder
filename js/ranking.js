// import { supabase } from './api.js'; // Assuming api.js exports supabase client

document.addEventListener('DOMContentLoaded', () => {
    const beerSelect = document.getElementById('beerSelect');
    const searchBeerBtn = document.getElementById('searchBeerBtn');
    const rankingResultsDiv = document.getElementById('rankingResults');

    // Function to format price
    const formatPrice = (value) => {
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    };

    // Populate beer select options
    async function populateBeerSelect() {
        console.log('Debug: populateBeerSelect called.');
        try {
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select('marca, volume');

            if (error) {
                console.error('Debug: Error fetching cervejas for select population:', error);
                throw error;
            }
            console.log('Debug: Cervejas data fetched for select:', data);

            const uniqueBeers = new Set();
            data.forEach(beer => {
                uniqueBeers.add(`${beer.marca} ${beer.volume}ml`);
            });
            console.log('Debug: Unique beers generated:', uniqueBeers);

            // Clear existing options except the first one (placeholder)
            while (beerSelect.options.length > 1) {
                beerSelect.remove(1);
            }

            uniqueBeers.forEach(beer => {
                const option = document.createElement('option');
                option.value = beer;
                option.textContent = beer;
                beerSelect.appendChild(option);
            });
            console.log('Debug: Beer select populated.');
        } catch (error) {
            console.error('Erro ao carregar opções de cerveja:', error);
        }
    }

    // Fetch and display ranking for selected beer
    async function fetchAndDisplayRanking() {
        const searchTerm = beerSelect.value;
        if (!searchTerm) {
            rankingResultsDiv.innerHTML = '<p class="empty-state">Selecione uma cerveja para ver o ranking de preços.</p>';
            return;
        }

        rankingResultsDiv.innerHTML = '<p class="empty-state">Carregando ranking...</p>';

        const [marca, volumeStr] = searchTerm.split(' ');
        const volume = parseInt(volumeStr);

        if (!marca || isNaN(volume)) {
            rankingResultsDiv.innerHTML = '<p class="empty-state">Formato de busca inválido. Selecione uma opção válida.</p>';
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select(`
                    marca,
                    volume,
                    preco,
                    created_at,
                    estabelecimentos ( nome )
                `)
                .eq('marca', marca)
                .eq('volume', volume)
                .order('preco', { ascending: true });

            if (error) throw error;

            if (data.length === 0) {
                rankingResultsDiv.innerHTML = '<p class="empty-state">Não foram encontrados preços para esta cerveja.</p>';
                return;
            }

            rankingResultsDiv.innerHTML = '';
            data.forEach(item => {
                const estabelecimentoNome = item.estabelecimentos ? item.estabelecimentos.nome : 'Desconhecido';
                const date = new Date(item.created_at).toLocaleDateString();

                const rankingItem = `
                    <div class="ranking-item">
                        <strong>${item.marca} ${item.volume}ml</strong>
                        <span class="price">${formatPrice(item.preco)}</span>
                        <span class="location">${estabelecimentoNome}</span>
                        <span class="date">Registrado em: ${date}</span>
                    </div>
                `;
                rankingResultsDiv.innerHTML += rankingItem;
            });

        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            rankingResultsDiv.innerHTML = '<p class="empty-state">Erro ao carregar o ranking. Tente novamente mais tarde.</p>';
        }
    }

    // Event listener for search button click
    searchBeerBtn.addEventListener('click', fetchAndDisplayRanking);

    // Initial population of select options
    populateBeerSelect();
});