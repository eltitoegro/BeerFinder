export async function getOrCreateEstabelecimento(nome) {
  // Intenta buscar el establecimiento
  const { data: existente, error: errorBusca } = await window.supabaseClient
    .from('estabelecimentos')
    .select('id')
    .eq('nome', nome);

  // Si hay un error real (no solo que no se encontró), lo lanza
  if (errorBusca) {
    throw errorBusca;
  }

  // Si el establecimiento existe, devuelve su ID
  if (existente && existente.length > 0) {
    return existente[0].id;
  } else {
    // Si no existe, lo crea
    const { data: novo, error: errorInsert } = await window.supabaseClient
      .from('estabelecimentos')
      .insert([{ nome }])
      .select('id')
      .single(); // Aquí sí esperamos un único resultado

    if (errorInsert) {
      throw errorInsert;
    }
    return novo.id;
  }
}