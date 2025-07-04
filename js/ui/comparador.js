// Comparador de Cervejas - BeerFinder
// Francisco - Praia do Rosa, SC

const ComparadorUI = {
    // Elementos da interface
    searchInput: null,
    beerTable: null,
    beerTableBody: null,
    emptyState: null,
    
    // Dados carregados
    cervejasData: [],
    cervejasFiltered: [],
    
    // Inicialização
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadData();
    },
    
    setupElements() {
        this.searchInput = document.getElementById('searchInput');
        this.beerTable = document.getElementById('beerTable');
        this.beerTableBody = document.getElementById('beerTableBody');
        this.emptyState = document.getElementById('emptyState');
    },
    
    setupEventListeners() {
        // Busca em tempo real
        this.searchInput.addEventListener('input', (e) => {
            this.filterData(e.target.value);
        });
        
        // Limpar busca com ESC
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.filterData('');
            }
        });
        
        // Ordenação por colunas
        this.setupColumnSorting();
    },
    
    setupColumnSorting() {
        const headers = this.beerTable.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortByColumn(index);
            });
        });
    },
    
    // Carregar dados
    async loadData() {
        try {
            this.showLoading();
            
            // Buscar cervejas usando o DataHelper
            this.cervejasData = await DataHelper.searchCervejas();
            this.cervejasFiltered = [...this.cervejasData];
            
            this.renderTable();
            this.hideLoading();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar dados. Tente novamente.');
        }
    },
    
    // Filtrar dados
    filterData(searchTerm) {
        if (!searchTerm.trim()) {
            this.cervejasFiltered = [...this.cervejasData];
        } else {
            this.cervejasFiltered = this.cervejasData.filter(cerveja => 
                cerveja.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cerveja.tipo_envase.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cerveja.estabelecimento.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.renderTable();
    },
    
    // Ordenar por coluna
    sortByColumn(columnIndex) {
        const columnMappings = ['marca', 'preco', 'volume', 'preco_por_litro', 'estabelecimento'];
        const column = columnMappings[columnIndex];
        
        if (!column) return;
        
        // Alternar direção da ordenação
        const isAscending = this.currentSort?.column === column && this.currentSort?.direction === 'asc';
        const direction = isAscending ? 'desc' : 'asc';
        
        this.cervejasFiltered.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Converter para números quando apropriado
            if (column === 'preco' || column === 'volume' || column === 'preco_por_litro') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return bVal > aVal ? 1 : -1;
            }
        });
        
        this.currentSort = { column, direction };
        this.renderTable();
        this.updateColumnHeaders(columnIndex, direction);
    },
    
    // Atualizar cabeçalhos com indicador de ordenação
    updateColumnHeaders(activeIndex, direction) {
        const headers = this.beerTable.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.textContent = header.textContent.replace(/[↑↓]/g, '');
            
            if (index === activeIndex) {
                header.textContent += direction === 'asc' ? ' ↑' : ' ↓';
            }
        });
    },
    
    // Renderizar tabela
    renderTable() {
        if (this.cervejasFiltered.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        const rows = this.cervejasFiltered.map(cerveja => this.createTableRow(cerveja));
        this.beerTableBody.innerHTML = rows.join('');
    },
    
    // Criar linha da tabela
    createTableRow(cerveja) {
        const precoFormatado = BeerFinder.formatPrice(cerveja.preco);
        const precoPorLitroFormatado = BeerFinder.formatPrice(cerveja.preco_por_litro);
        
        // Determinar badge do preço
        const priceBadge = this.getPriceBadge(parseFloat(cerveja.preco_por_litro));
        
        return `
            <tr>
                <td>
                    <strong>${cerveja.marca}</strong>
                    <br>
                    <small style="color: #666;">${this.formatTipoEnvase(cerveja.tipo_envase)}</small>
                </td>
                <td>
                    <strong>${precoFormatado}</strong>
                </td>
                <td>${cerveja.volume}ml</td>
                <td>
                    <span class="price-badge ${priceBadge.class}">
                        ${precoPorLitroFormatado}
                    </span>
                </td>
                <td>
                    <strong>${cerveja.estabelecimento}</strong>
                    <br>
                    <small style="color: #666;">${cerveja.localizacao}</small>
                </td>
            </tr>
        `;
    },
    
    // Determinar badge de preço
    getPriceBadge(precoPorLitro) {
        if (precoPorLitro < 8) {
            return { class: 'price-best', text: 'Melhor' };
        } else if (precoPorLitro < 12) {
            return { class: 'price-regular', text: 'Normal' };
        } else {
            return { class: 'price-high', text: 'Caro' };
        }
    },
    
    // Formatar tipo de envase
    formatTipoEnvase(tipo) {
        const tipos = {
            'lata': 'Lata',
            'garrafa': 'Garrafa',
            'long_neck': 'Long Neck',
            'garrafa_600ml': 'Garrafa 600ml',
            'garrafa_1l': 'Garrafa 1L',
            'barril': 'Barril'
        };
        
        return tipos[tipo] || tipo;
    },
    
    // Estados da interface
    showLoading() {
        this.beerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div style="font-size: 1.2rem; color: #666;">
                        🔄 Carregando cervejas...
                    </div>
                </td>
            </tr>
        `;
    },
    
    hideLoading() {
        // Implementado no renderTable
    },
    
    showEmptyState() {
        this.beerTable.classList.add('hidden');
        this.emptyState.classList.remove('hidden');
    },
    
    hideEmptyState() {
        this.beerTable.classList.remove('hidden');
        this.emptyState.classList.add('hidden');
    },
    
    showError(message) {
        this.beerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div style="font-size: 1.2rem; color: #dc3545;">
                        ⚠️ ${message}
                    </div>
                </td>
            </tr>
        `;
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    ComparadorUI.init();
});
