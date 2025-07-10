document.addEventListener('DOMContentLoaded', async () => {
    const featuredDealsContainer = document.querySelector('.featured-deals .deal-items-container');

    if (!featuredDealsContainer) {
        console.error('Contenedor de ofertas destacadas no encontrado.');
        return;
    }

    let allBestDeals = []; // Almacenará todas las ofertas más baratas

    async function fetchAllBestDeals() {
        try {
            const { data: cervejas, error } = await window.supabaseClient
                .from('cervejas')
                .select(`
                    id,
                    marca,
                    volume,
                    preco,
                    estabelecimentos (
                        nome,
                        latitude,
                        longitude
                    )
                `);

            if (error) throw error;

            if (!cervejas || cervejas.length === 0) {
                featuredDealsContainer.innerHTML = '<p class="empty-state">No hay ofertas destacadas disponibles.</p>';
                return;
            }

            const bestDealsMap = {};

            cervejas.forEach(cerveja => {
                const key = `${cerveja.marca}-${cerveja.volume}`;
                if (!bestDealsMap[key] || cerveja.preco < bestDealsMap[key].preco) {
                    bestDealsMap[key] = cerveja;
                }
            });

            allBestDeals = Object.values(bestDealsMap);

        } catch (error) {
            console.error('Error al cargar ofertas destacadas:', error.message);
            featuredDealsContainer.innerHTML = '<p class="empty-state">Error al cargar ofertas destacadas.</p>';
        }
    }

    function displayRandomDeals() {
        if (allBestDeals.length < 2) {
            featuredDealsContainer.innerHTML = '<p class="empty-state">Se necesitan al menos 2 ofertas para mostrar.</p>';
            return;
        }

        // Seleccionar dos ofertas aleatorias y únicas
        let deal1Index = Math.floor(Math.random() * allBestDeals.length);
        let deal2Index = Math.floor(Math.random() * allBestDeals.length);

        // Asegurarse de que sean diferentes
        while (deal1Index === deal2Index) {
            deal2Index = Math.floor(Math.random() * allBestDeals.length);
        }

        const deal1 = allBestDeals[deal1Index];
        const deal2 = allBestDeals[deal2Index];

        let dealsHtml = '';

        [deal1, deal2].forEach(deal => {
            const estabelecimentoNome = deal.estabelecimentos ? deal.estabelecimentos.nome : 'Desconocido';
            dealsHtml += `
                <div class="deal-item">
                    <div class="deal-icon">🍺</div>
                    <div class="deal-info">
                        <div class="deal-name">${deal.marca} ${deal.volume}ml</div>
                        <div class="deal-price">R$ ${deal.preco.toFixed(2).replace('.', ',')}</div>
                        <div class="deal-location">${estabelecimentoNome}</div>
                    </div>
                </div>
            `;
        });

        featuredDealsContainer.innerHTML = dealsHtml;
    }

    // Cargar todas las ofertas al inicio y luego mostrar dos aleatorias
    await fetchAllBestDeals();
    displayRandomDeals();

    // Alternar las ofertas cada 8 horas (28,800,000 ms)
    setInterval(displayRandomDeals, 28800000);
});
