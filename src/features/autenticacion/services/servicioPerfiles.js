import { supabase } from '../../../lib/supabaseCliente'

export async function obtenerPerfilPorId(idUsuario) {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, estado, created_at')
      .eq('id', idUsuario)
      .single()

    if (error || !data) {
      throw new Error('No se encontro un perfil activo para este usuario.')
    }

    if (!data.estado) {
      throw new Error('Tu usuario esta inactivo. Contacta al organizador del sistema.')
    }

    return data
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar el perfil del usuario.')
  }
}
