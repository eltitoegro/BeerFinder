// Supabase Connection - BeerFinder
// Francisco - Praia do Rosa, SC

const SupabaseConfig = {
    // Configuração do Supabase (colocar as credenciais reais aqui)
    url: 'YOUR_SUPABASE_URL',
    key: 'YOUR_SUPABASE_ANON_KEY',
    
    // Simulação de dados para desenvolvimento
    mockData: {
        cervejas: [
            {
                id: 1,
                marca: 'Brahma',
                preco: 3.50,
                volume: 350,
                tipo_envase: 'lata',
                estabelecimento: 'Mercado do João',
                localizacao: 'Centro - Praia do Rosa',
                data_cadastro: '2024-01-15'
            },
            {
                id: 2,
                marca: 'Skol',
                preco: 3.20,
                volume: 350,
                tipo_envase: 'lata',
                estabelecimento: 'Padaria Central',
                localizacao: 'Rosa Sul',
                data_cadastro: '2024-01-15'
            },
            {
                id: 3,
                marca: 'Heineken',
                preco: 5.80,
                volume: 350,
                tipo_envase: 'lata',
                estabelecimento: 'Mercado do João',
                localizacao: 'Centro - Praia do Rosa',
                data_cadastro: '2024-01-14'
            },
            {
                id: 4,
                marca: 'Brahma',
                preco: 8.90,
                volume: 600,
                tipo_envase: 'garrafa_600ml',
                estabelecimento: 'Distribuidora Rosa',
                localizacao: 'Estrada Geral',
                data_cadastro: '2024-01-14'
            },
            {
                id: 5,
                marca: 'Skol',
                preco: 12.50,
                volume: 1000,
                tipo_envase: 'garrafa_1l',
                estabelecimento: 'Mercado do João',
                localizacao: 'Centro - Praia do Rosa',
                data_cadastro: '2024-01-13'
            }
        ],
        
        estabelecimentos: [
            {
                id: 1,
                nome: 'Mercado do João',
                tipo: 'mercado',
                contato: '(48) 99999-1111',
                horario: '7h às 22h - Seg a Dom',
                endereco: 'Rua Principal, 123 - Centro',
                observacoes: 'Delivery disponível'
            },
            {
                id: 2,
                nome: 'Padaria Central',
                tipo: 'padaria',
                contato: '(48) 99999-2222',
                horario: '6h às 18h - Seg a Sab',
                endereco: 'Av. das Baleias, 456 - Rosa Sul',
                observacoes: 'Café da manhã completo'
            }
        ]
    }
};

// Simulação da API do Supabase
const supabase = {
    // Simulação de SELECT
    from(table) {
        return {
            select(columns = '*') {
                return {
                    async then(resolve) {
                        const data = SupabaseConfig.mockData[table] || [];
                        resolve({ data, error: null });
                    },
                    
                    eq(column, value) {
                        return {
                            async then(resolve) {
                                const data = SupabaseConfig.mockData[table]?.filter(
                                    item => item[column] === value
                                ) || [];
                                resolve({ data, error: null });
                            }
                        };
                    },
                    
                    ilike(column, value) {
                        return {
                            async then(resolve) {
                                const data = SupabaseConfig.mockData[table]?.filter(
                                    item => item[column]?.toLowerCase().includes(value.toLowerCase())
                                ) || [];
                                resolve({ data, error: null });
                            }
                        };
                    },
                    
                    order(column, options = {}) {
                        return {
                            async then(resolve) {
                                const data = [...(SupabaseConfig.mockData[table] || [])];
                                data.sort((a, b) => {
                                    const aVal = a[column];
                                    const bVal = b[column];
                                    
                                    if (options.ascending === false) {
                                        return bVal > aVal ? 1 : -1;
                                    }
                                    return aVal > bVal ? 1 : -1;
                                });
                                resolve({ data, error: null });
                            }
                        };
                    }
                };
            }
        };
    },
    
    // Simulação de INSERT
    async insert(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular inserção com sucesso
                const newId = Math.max(...Object.values(SupabaseConfig.mockData).flat().map(item => item.id || 0)) + 1;
                const newData = { ...data, id: newId, data_cadastro: new Date().toISOString().split('T')[0] };
                
                // Adicionar aos dados mock (para fins de demonstração)
                if (data.marca) {
                    SupabaseConfig.mockData.cervejas.push(newData);
                } else if (data.nome) {
                    SupabaseConfig.mockData.estabelecimentos.push(newData);
                }
                
                resolve({ data: newData, error: null });
            }, 500); // Simular delay de rede
        });
    }
};

// Funções auxiliares para manipulação de dados
const DataHelper = {
    // Buscar cervejas com filtros
    async searchCervejas(filters = {}) {
        try {
            let query = supabase.from('cervejas').select('*');
            
            if (filters.marca) {
                query = query.ilike('marca', `%${filters.marca}%`);
            }
            
            if (filters.tipo_envase) {
                query = query.eq('tipo_envase', filters.tipo_envase);
            }
            
            // Ordenar por preço por litro (calculado)
            const { data, error } = await query;
            
            if (error) throw error;
            
            // Calcular preço por litro e ordenar
            const cervejasComPrecoLitro = data.map(cerveja => ({
                ...cerveja,
                preco_por_litro: BeerFinder.calculatePricePerLiter(cerveja.preco, cerveja.volume)
            }));
            
            cervejasComPrecoLitro.sort((a, b) => parseFloat(a.preco_por_litro) - parseFloat(b.preco_por_litro));
            
            return cervejasComPrecoLitro;
            
        } catch (error) {
            console.error('Erro ao buscar cervejas:', error);
            return [];
        }
    },
    
    // Salvar nova cerveja
    async saveCerveja(cerveja) {
        try {
            const { data, error } = await supabase.insert(cerveja);
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Erro ao salvar cerveja:', error);
            throw error;
        }
    },
    
    // Salvar estabelecimento
    async saveEstabelecimento(estabelecimento) {
        try {
            const { data, error } = await supabase.insert(estabelecimento);
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Erro ao salvar estabelecimento:', error);
            throw error;
        }
    },
    
    // Buscar estabelecimentos
    async getEstabelecimentos() {
        try {
            const { data, error } = await supabase.from('estabelecimentos').select('*');
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar estabelecimentos:', error);
            return [];
        }
    }
};

// Expor globalmente para uso nas outras páginas
window.supabase = supabase;
window.DataHelper = DataHelper;
