import { supabase } from '../../lib/supabaseCliente'

const seleccionEnfrentamientos = `
  id,
  subcategoria_id,
  ronda,
  equipo_a_id,
  equipo_b_id,
  ganador_id,
  estado,
  orden,
  bye,
  cancha
`

const etiquetasRonda = {
  treintaidosavos: 'Treintaidosavos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final',
}

async function listarEquiposPorIds(idsEquipos) {
  try {
    const ids = Array.from(new Set(idsEquipos.filter(Boolean))).slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre_equipo, nombre_robot')
      .in('id', ids)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los equipos de los partidos.')
    }

    return new Map((data || []).map((equipo) => [equipo.id, equipo]))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos de los partidos.')
  }
}

async function listarSubcategoriasPorIds(idsSubcategorias) {
  try {
    const ids = Array.from(new Set(idsSubcategorias.filter(Boolean))).slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('subcategorias')
      .select('id, nombre')
      .in('id', ids)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar las subcategorias de los partidos.')
    }

    return new Map((data || []).map((subcategoria) => [subcategoria.id, subcategoria]))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar las subcategorias de los partidos.')
  }
}

async function listarResultadosPorEnfrentamientos(idsEnfrentamientos) {
  try {
    const ids = idsEnfrentamientos.slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('resultados')
      .select('id, enfrentamiento_id, goles_a, goles_b, observacion, fecha')
      .in('enfrentamiento_id', ids)
      .order('fecha', { ascending: false })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los resultados de los partidos.')
    }

    const resultados = new Map()

    ;(data || []).forEach((resultado) => {
      if (!resultados.has(resultado.enfrentamiento_id)) {
        resultados.set(resultado.enfrentamiento_id, resultado)
      }
    })

    return resultados
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los resultados de los partidos.')
  }
}

async function adjuntarDatosEnfrentamientos(enfrentamientos) {
  const idsEquipos = enfrentamientos.flatMap((enfrentamiento) => [
    enfrentamiento.equipo_a_id,
    enfrentamiento.equipo_b_id,
    enfrentamiento.ganador_id,
  ])
  const idsSubcategorias = enfrentamientos.map((enfrentamiento) =>
    enfrentamiento.subcategoria_id
  )
  const idsEnfrentamientos = enfrentamientos.map((enfrentamiento) => enfrentamiento.id)
  const [equiposPorId, subcategoriasPorId, resultadosPorId] = await Promise.all([
    listarEquiposPorIds(idsEquipos),
    listarSubcategoriasPorIds(idsSubcategorias),
    listarResultadosPorEnfrentamientos(idsEnfrentamientos),
  ])

  return enfrentamientos.map((enfrentamiento) => ({
    ...enfrentamiento,
    equipo_a: equiposPorId.get(enfrentamiento.equipo_a_id) || null,
    equipo_b: equiposPorId.get(enfrentamiento.equipo_b_id) || null,
    etiqueta_ronda: etiquetasRonda[enfrentamiento.ronda] || enfrentamiento.ronda,
    ganador: equiposPorId.get(enfrentamiento.ganador_id) || null,
    resultado: resultadosPorId.get(enfrentamiento.id) || null,
    subcategoria: subcategoriasPorId.get(enfrentamiento.subcategoria_id) || null,
  }))
}

export async function listarEnfrentamientosPorEstado(estado) {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('estado', estado)
      .order('ronda', { ascending: true })
      .order('orden', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los enfrentamientos.')
    }

    return adjuntarDatosEnfrentamientos(data || [])
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los enfrentamientos.')
  }
}

export async function listarEnfrentamientosFinalizados() {
  try {
    const enfrentamientos = await listarEnfrentamientosPorEstado('finalizado')

    return enfrentamientos
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los partidos finalizados.')
  }
}

export async function activarEnfrentamiento(id, cancha) {
  try {
    if (!id || !cancha?.trim()) {
      throw new Error('Selecciona una cancha para activar el partido.')
    }

    const { error } = await supabase
      .from('enfrentamientos')
      .update({
        cancha: cancha.trim(),
        estado: 'activo',
      })
      .eq('id', id)

    if (error) {
      throw new Error('No se pudo activar el partido.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo activar el partido.')
  }
}

export async function activarRondaCompleta(enfrentamientos) {
  try {
    if (!Array.isArray(enfrentamientos) || !enfrentamientos.length) {
      throw new Error('No hay partidos para activar en esta ronda.')
    }

    await Promise.all(
      enfrentamientos.map(async (enfrentamiento) => {
        if (!enfrentamiento.id) {
          throw new Error('No se pudo identificar un partido de la ronda.')
        }

        const { error } = await supabase
          .from('enfrentamientos')
          .update({
            cancha: enfrentamiento.cancha?.trim() || null,
            estado: 'activo',
          })
          .eq('id', enfrentamiento.id)

        if (error) {
          throw new Error('No se pudo activar uno de los partidos de la ronda.')
        }
      }),
    )
  } catch (error) {
    throw new Error(error.message || 'No se pudo activar la ronda completa.')
  }
}

export async function desactivarEnfrentamiento(id) {
  try {
    if (!id) {
      throw new Error('No se pudo identificar el partido.')
    }

    const { error } = await supabase
      .from('enfrentamientos')
      .update({
        cancha: null,
        estado: 'pendiente',
      })
      .eq('id', id)

    if (error) {
      throw new Error('No se pudo desactivar el partido.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo desactivar el partido.')
  }
}
