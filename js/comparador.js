document.addEventListener('DOMContentLoaded', () => {
    // Garante que o cliente Supabase esteja disponível globalmente a partir de api.js
    if (typeof window.supabaseClient === 'undefined') {
        console.error('Supabase client não foi encontrado. Verifique se api.js está sendo carregado corretamente.');
        return;
    }

    const form = document.getElementById('compareForm');
    form.addEventListener('submit', handleCompare);
});

// Função para salvar UMA cerveja no Supabase
async function salvarCerveja(cerveja) {
    try {
        const { data, error } = await window.supabaseClient
            .from('cervejas')
            .insert([cerveja])
            .select('*');

        if (error) {
            // Se houver um erro de violação de chave única (duplicado), não tratamos como um erro fatal
            if (error.code === '23505') {
                console.log(`Dados para ${cerveja.marca} já existem, não foram inseridos novamente.`);
                return { data: null, error: 'duplicate' };
            }
            throw error; // Lança outros erros
        }

        console.log('Cerveja salva com sucesso:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao salvar cerveja:', error.message);
        return { data: null, error };
    }
}

async function handleCompare(event) {
    event.preventDefault();

    // 1. Coletar dados do formulário
    const estabelecimentoNome = document.getElementById('estabelecimento').value;

    // Buscar o ID do estabelecimento
    const { data: estabelecimentoData, error: estabelecimentoError } = await window.supabaseClient
        .from('estabelecimentos')
        .select('id')
        .eq('nome', estabelecimentoNome)
        .single();

    if (estabelecimentoError && estabelecimentoError.code !== 'PGRST116') {
        console.error('Erro ao buscar estabelecimento:', estabelecimentoError);
        alert('Erro ao buscar estabelecimento. Verifique o console para mais detalhes.');
        return;
    }

    let estabelecimentoId = null;
    if (estabelecimentoData) {
        estabelecimentoId = estabelecimentoData.id;
    } else {
        alert('Estabelecimento não encontrado. Por favor, cadastre o estabelecimento primeiro ou verifique o nome.');
        return;
    }

    const cerveja1 = {
        marca: document.getElementById('marca1').value,
        volumen_ml: parseInt(document.getElementById('ml1').value),
        preco: parseFloat(document.getElementById('preco1').value),
        estabelecimento: estabelecimentoId // Use o ID do estabelecimento
    };

    const cerveja2 = {
        marca: document.getElementById('marca2').value,
        volumen_ml: parseInt(document.getElementById('ml2').value),
        preco: parseFloat(document.getElementById('preco2').value),
        estabelecimento: estabelecimentoId // Use o ID do estabelecimento
    };

    // 2. Calcular preço por litro
    const precoLitro1 = (cerveja1.preco / cerveja1.volumen_ml) * 1000;
    const precoLitro2 = (cerveja2.preco / cerveja2.volumen_ml) * 1000;

    // 3. Determinar a melhor opção
    let melhorCerveja, piorCerveja, melhorPrecoLitro, piorPrecoLitro;

    if (precoLitro1 <= precoLitro2) {
        melhorCerveja = cerveja1;
        piorCerveja = cerveja2;
        melhorPrecoLitro = precoLitro1;
        piorPrecoLitro = precoLitro2;
    } else {
        melhorCerveja = cerveja2;
        piorCerveja = cerveja1;
        melhorPrecoLitro = precoLitro2;
        piorPrecoLitro = precoLitro1;
    }

    // 4. Exibir o resultado
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        <h2>A melhor opção é a ${melhorCerveja.marca}!</h2>
        <p>Comprando a de ${melhorCerveja.volumen_ml}ml, você economiza.</p>
        <div class="price-details">
            <div class="cerveja-a">
                <span>R$ ${melhorPrecoLitro.toFixed(2)}</span>
                <small>por litro na ${melhorCerveja.marca}</small>
            </div>
            <div class="cerveja-b">
                <span>R$ ${piorPrecoLitro.toFixed(2)}</span>
                <small>por litro na ${piorCerveja.marca}</small>
            </div>
        </div>
        <a href="ranking.html" class="btn btn-secondary" style="margin-top: 20px; width: 100%;">Ver Ranking da Cerveja Barata</a>
    `;
    resultadoDiv.classList.remove('hidden');

    // 5. Salvar os dados no Supabase (sem esperar a conclusão)
    salvarCerveja(cerveja1);
    salvarCerveja(cerveja2);

    // Rola a tela para mostrar o resultado
    resultadoDiv.scrollIntoView({ behavior: 'smooth' });
}