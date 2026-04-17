import { supabase } from '../../../lib/supabaseCliente'

export async function obtenerPerfilPorId(idUsuario) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, rol, estado, created_at')
    .eq('id', idUsuario)
    .single()

  if (error) {
    throw new Error('No se encontró un perfil activo para este usuario.')
  }

  if (!data.estado) {
    throw new Error('Tu usuario está inactivo. Contacta al organizador del sistema.')
  }

  return data
}
