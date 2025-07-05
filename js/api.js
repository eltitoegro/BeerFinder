// O script do Supabase CDN (carregado no HTML) torna o objeto `supabase` globalmente disponível.
// Usamos o método `createClient` dele para inicializar nossa conexão.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exemplo de uma função que busca dados (pode ser expandida)
async function getEstabelecimentos() {
    const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*');

    if (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
        return [];
    }

    return data;
}