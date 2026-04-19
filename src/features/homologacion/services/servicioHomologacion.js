import { supabase } from '../../../lib/supabaseCliente'

const seleccionEquipos = `
  id,
  nombre_equipo,
  nombre_robot,
  representante,
  institucion,
  subcategoria_id,
  estado_homologacion,
  observaciones,
  created_at,
  subcategorias(nombre)
`

const seleccionHomologaciones = `
  id,
  equipo_id,
  homologador_id,
  estado,
  observacion,
  fecha,
  homologador:perfiles(nombre)
`

function unirUltimasHomologaciones(equipos = [], homologaciones = []) {
  const ultimasPorEquipo = new Map()

  homologaciones.forEach((homologacion) => {
    if (!ultimasPorEquipo.has(homologacion.equipo_id)) {
      ultimasPorEquipo.set(homologacion.equipo_id, homologacion)
    }
  })

  return equipos.map((equipo) => ({
    ...equipo,
    ultima_homologacion: ultimasPorEquipo.get(equipo.id) || null,
  }))
}

export async function listarEquiposParaHomologacion() {
  try {
    const [respuestaEquipos, respuestaHomologaciones] = await Promise.all([
      supabase
        .from('equipos')
        .select(seleccionEquipos)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase
        .from('homologaciones')
        .select(seleccionHomologaciones)
        .order('fecha', { ascending: false })
        .limit(500),
    ])

    if (respuestaEquipos.error) {
      throw new Error('No se pudieron cargar los equipos para homologacion.')
    }

    if (respuestaHomologaciones.error) {
      throw new Error('No se pudo cargar el historial de homologaciones.')
    }

    return unirUltimasHomologaciones(
      respuestaEquipos.data || [],
      respuestaHomologaciones.data || [],
    )
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar la homologacion.')
  }
}

export async function listarSubcategoriasHomologacion() {
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

export async function registrarCambioHomologacion({
  equipoId,
  estado,
  homologadorId,
  observacion,
}) {
  try {
    const observacionLimpia = observacion?.trim() || null

    const { error: errorHomologacion } = await supabase
      .from('homologaciones')
      .insert({
        equipo_id: equipoId,
        estado,
        homologador_id: homologadorId,
        observacion: observacionLimpia,
      })

    if (errorHomologacion) {
      throw new Error('No se pudo registrar la homologacion.')
    }

    const { error: errorEquipo } = await supabase
      .from('equipos')
      .update({
        estado_homologacion: estado,
        observaciones: observacionLimpia,
      })
      .eq('id', equipoId)

    if (errorEquipo) {
      throw new Error('No se pudo actualizar el estado del equipo.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo registrar el cambio de homologacion.')
  }
}
