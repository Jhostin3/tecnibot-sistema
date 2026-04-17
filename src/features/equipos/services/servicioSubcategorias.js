import { supabase } from '../../../lib/supabaseCliente'

export async function listarSubcategorias() {
  const { data, error } = await supabase
    .from('subcategorias')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar las subcategorías.')
  }

  return data
}
