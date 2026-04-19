import { supabase } from '../../../lib/supabaseCliente'

export async function listarSubcategorias() {
  try {
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id, nombre')
      .order('nombre', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar las subcategorias.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar las subcategorias.')
  }
}
