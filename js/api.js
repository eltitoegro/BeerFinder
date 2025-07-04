// Este archivo inicializa el cliente Supabase y contiene funciones para interactuar con la DB.

// Asegúrate de que SUPABASE_URL y SUPABASE_ANON_KEY estén definidos en config.js
// y que el CDN de Supabase esté cargado en tu HTML (ej: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>)

const { createClient } = supabase; // Obtiene la función createClient del objeto global 'supabase'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hacemos el cliente Supabase y las funciones globalmente accesibles
// para que puedan ser usadas por otros scripts como comparador.js
window.supabaseClient = supabaseClient;

async function getCervejas() {
    const { data, error } = await supabaseClient
        .from('cervejas')
        .select('*');
    if (error) {
        console.error('Erro ao buscar cervejas:', error);
        return [];
    }
    return data;
}

async function addCerveja(cerveja) {
    const { data, error } = await supabaseClient
        .from('cervejas')
        .insert([cerveja]);
    if (error) {
        console.error('Erro ao cadastrar cerveja:', error);
        return null;
    }
    return data;
}

async function addEstabelecimento(estabelecimento) {
    const { data, error } = await supabaseClient
        .from('estabelecimentos')
        .insert([estabelecimento]);
    if (error) {
        console.error('Erro ao cadastrar estabelecimento:', error);
        return null;
    }
    return data;
}

// Exportamos las funciones para que puedan ser usadas en otros módulos si se usa un sistema de módulos
// Para este proyecto simple, hacerlas globales con window.nombreFuncion es suficiente.
// window.getCervejas = getCervejas;
// window.addCerveja = addCerveja;
// window.addEstabelecimento = addEstabelecimento;
