import { supabase } from '../../../lib/supabaseCliente'

const seleccionEquipos = `
  id,
  nombre_equipo,
  nombre_robot,
  representante,
  institucion,
  correo,
  subcategoria_id,
  estado_inscripcion,
  estado_homologacion,
  observaciones,
  created_at,
  subcategorias(nombre)
`

export async function listarEquipos() {
  const { data, error } = await supabase
    .from('equipos')
    .select(seleccionEquipos)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar los equipos.')
  }

  return data
}

export async function crearEquipo(datosEquipo) {
  const { error } = await supabase.from('equipos').insert(datosEquipo)

  if (error) {
    throw new Error('No se pudo crear el equipo. Revisa los datos ingresados.')
  }
}

export async function actualizarEquipo(idEquipo, datosEquipo) {
  const { error } = await supabase
    .from('equipos')
    .update(datosEquipo)
    .eq('id', idEquipo)

  if (error) {
    throw new Error('No se pudo actualizar el equipo.')
  }
}

export async function eliminarEquipo(idEquipo) {
  const { error } = await supabase.from('equipos').delete().eq('id', idEquipo)

  if (error) {
    throw new Error('No se pudo eliminar el equipo.')
  }
}
