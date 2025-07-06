import { supabase } from './api.js'; // Assuming api.js exports supabase client

document.addEventListener('DOMContentLoaded', () => {
    const beerFilterInput = document.getElementById('beerFilter');
    const beerSuggestionsDatalist = document.getElementById('beerSuggestions');
    const rankingResultsDiv = document.getElementById('rankingResults');

    // Function to format price
    const formatPrice = (value) => {
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    };

    // Populate beer suggestions datalist
    async function populateBeerSuggestions() {
        try {
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select('marca, volume');

            if (error) throw error;

            const uniqueBeers = new Set();
            data.forEach(beer => {
                uniqueBeers.add(`${beer.marca} ${beer.volume}ml`);
            });

            beerSuggestionsDatalist.innerHTML = '';
            uniqueBeers.forEach(beer => {
                const option = document.createElement('option');
                option.value = beer;
                beerSuggestionsDatalist.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar sugestões de cerveja:', error);
        }
    }

    // Fetch and display ranking for selected beer
    async function fetchAndDisplayRanking(searchTerm) {
        rankingResultsDiv.innerHTML = '<p class="empty-state">Carregando ranking...</p>';

        const [marca, volumeStr] = searchTerm.split(' ');
        const volume = parseInt(volumeStr);

        if (!marca || isNaN(volume)) {
            rankingResultsDiv.innerHTML = '<p class="empty-state">Formato de busca inválido. Use "Marca VolumeML" (ex: Heineken 350ml).</p>';
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

    // Event listener for filter input
    beerFilterInput.addEventListener('change', (event) => {
        fetchAndDisplayRanking(event.target.value);
    });

    // Initial population of suggestions
    populateBeerSuggestions();
});