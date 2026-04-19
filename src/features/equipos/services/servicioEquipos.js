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
  try {
    const { data, error } = await supabase
      .from('equipos')
      .select(seleccionEquipos)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los equipos.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos.')
  }
}

export async function crearEquipo(datosEquipo) {
  try {
    const { error } = await supabase.from('equipos').insert(datosEquipo)

    if (error) {
      throw new Error('No se pudo crear el equipo. Revisa los datos ingresados.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo crear el equipo.')
  }
}

export async function importarEquipos(datosEquipos) {
  try {
    const { error } = await supabase.from('equipos').insert(datosEquipos)

    if (error) {
      throw new Error('No se pudieron importar los equipos validos.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudieron importar los equipos validos.')
  }
}

export async function actualizarEquipo(idEquipo, datosEquipo) {
  try {
    const { error } = await supabase
      .from('equipos')
      .update(datosEquipo)
      .eq('id', idEquipo)

    if (error) {
      throw new Error('No se pudo actualizar el equipo.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo actualizar el equipo.')
  }
}

export async function eliminarEquipo(idEquipo) {
  try {
    const { error } = await supabase.from('equipos').delete().eq('id', idEquipo)

    if (error) {
      throw new Error('No se pudo eliminar el equipo.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo eliminar el equipo.')
  }
}
