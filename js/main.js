// BeerFinder - JS Principal
// Francisco - Praia do Rosa, SC

// Configuração global da aplicação
const BeerFinder = {
    version: '1.0.0',
    location: 'Praia do Rosa, SC',
    
    // Inicialização da app
    init() {
        this.setupGlobalEventListeners();
        this.detectPage();
        console.log(`BeerFinder ${this.version} - ${this.location}`);
    },
    
    // Detecta qual página está carregada
    detectPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        
        switch(page) {
            case 'index':
                this.initHomePage();
                break;
            case 'comparador':
                this.initComparadorPage();
                break;
            case 'cadastrar':
                this.initCadastrarPage();
                break;
            case 'estabelecimento':
                this.initEstabelecimentoPage();
                break;
        }
    },
    
    // Eventos globais
    setupGlobalEventListeners() {
        // Prevenir submit de formulários vazios
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const inputs = form.querySelectorAll('input[required], select[required]');
                let valid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        valid = false;
                        input.focus();
                    }
                });
                
                if (!valid) {
                    e.preventDefault();
                    this.showAlert('Preencha todos os campos obrigatórios', 'warning');
                }
            }
        });
        
        // Adicionar classe de loading em botões
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') && e.target.type === 'submit') {
                e.target.classList.add('loading');
                setTimeout(() => {
                    e.target.classList.remove('loading');
                }, 2000);
            }
        });
    },
    
    // Inicialização das páginas
    initHomePage() {
        // Manejar clics en los nuevos botones de navegación
        document.querySelectorAll('.primary-button, .secondary-button, .map-button').forEach(button => {
            button.addEventListener('click', () => {
                const targetPage = button.dataset.target;
                if (targetPage) {
                    window.location.href = targetPage;
                }
            });
        });

        // Cargar y exibir os contadores
        this.loadAndDisplayCounts();
    },

    async loadAndDisplayCounts() {
        try {
            // Contar cervejas
            const { count: cervejasCount, error: cervejasError } = await window.supabaseClient
                .from('cervejas')
                .select('id', { count: 'exact' });

            if (cervejasError) throw cervejasError;
            document.getElementById('totalCervejas').textContent = cervejasCount.toLocaleString('pt-BR');

            // Contar estabelecimentos
            const { count: estabelecimentosCount, error: estabelecimentosError } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id', { count: 'exact' });

            if (estabelecimentosError) throw estabelecimentosError;
            document.getElementById('totalEstabelecimentos').textContent = estabelecimentosCount.toLocaleString('pt-BR');

        } catch (error) {
            console.error('Erro ao carregar contadores:', error);
            // Opcional: exibir uma mensagem de erro na UI
        }
    },
    
    initComparadorPage() {
        // Será implementado em comparador.js
        console.log('Comparador page loaded');
    },
    
    initCadastrarPage() {
        // Será implementado em cadastrar.js
        console.log('Cadastrar page loaded');
    },
    
    initEstabelecimentoPage() {
        // Será implementado em estabelecimento.js
        console.log('Estabelecimento page loaded');
    },
    
    // Utilidades
    showAlert(message, type = 'info') {
        // Sistema simples de alertas
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    },
    
    // Formatação de preços
    formatPrice(price) {
        return parseFloat(price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    },
    
    // Cálculo de preço por litro
    calculatePricePerLiter(price, volume) {
        return (price / (volume / 1000)).toFixed(2);
    },
    
    // Geolocalização
    getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocalização não suportada');
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                error => {
                    reject('Erro ao obter localização');
                }
            );
        });
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    BeerFinder.init();
});

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
