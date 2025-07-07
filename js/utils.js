export async function getOrCreateEstabelecimento(nome) {
  // Tenta buscar o estabelecimento
  const { data: existente, error: errorBusca } = await window.supabaseClient
    .from('estabelecimentos')
    .select('id')
    .eq('nome', nome);

  // Se houver um erro real (não apenas que não foi encontrado), lança-o
  if (errorBusca) {
    throw errorBusca;
  }

  // Se o estabelecimento existir, retorna seu ID
  if (existente && existente.length > 0) {
    return existente[0].id;
  } else {
    // Se não existir, cria-o
    const { data: novo, error: errorInsert } = await window.supabaseClient
      .from('estabelecimentos')
      .insert([{ nome }])
      .select('id')
      .single(); // Aqui sim esperamos um único resultado

    if (errorInsert) {
      throw errorInsert;
    }
    return novo.id;
  }
}