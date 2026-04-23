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

const ordenRondas = {
  treintaidosavos: 1,
  dieciseisavos: 2,
  octavos: 3,
  cuartos: 4,
  semifinal: 5,
  final: 6,
  tercer_lugar: 7,
}

async function listarEquiposPorIds(idsEquipos) {
  try {
    const ids = Array.from(new Set(idsEquipos.filter(Boolean))).slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre_equipo, nombre_robot, institucion')
      .in('id', ids)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los equipos de la llave.')
    }

    return new Map((data || []).map((equipo) => [equipo.id, equipo]))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos de la llave.')
  }
}

async function listarResultadosPorEnfrentamientos(idsEnfrentamientos) {
  try {
    const ids = idsEnfrentamientos.slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('resultados')
      .select('id, enfrentamiento_id, goles_a, goles_b')
      .in('enfrentamiento_id', ids)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los resultados de la llave.')
    }

    return new Map((data || []).map((resultado) => [resultado.enfrentamiento_id, resultado]))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los resultados de la llave.')
  }
}

function adjuntarDatos(enfrentamientos, equiposPorId, resultadosPorId) {
  return enfrentamientos.map((enfrentamiento) => ({
    ...enfrentamiento,
    equipo_a: equiposPorId.get(enfrentamiento.equipo_a_id) || null,
    equipo_b: equiposPorId.get(enfrentamiento.equipo_b_id) || null,
    ganador: equiposPorId.get(enfrentamiento.ganador_id) || null,
    resultado: resultadosPorId.get(enfrentamiento.id) || null,
  }))
}

export async function listarSubcategorias() {
  try {
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id, nombre, categoria_id, categorias(id, nombre)')
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

export async function listarEstadosSubcategorias(idsSubcategorias = []) {
  try {
    const ids = Array.from(new Set(idsSubcategorias.filter(Boolean))).slice(0, 500)

    if (!ids.length) return {}

    const { data, error } = await supabase
      .from('enfrentamientos')
      .select('subcategoria_id, ronda, ganador_id, estado, bye')
      .in('subcategoria_id', ids)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los estados de las subcategorias.')
    }

    return ids.reduce((estados, subcategoriaId) => {
      const enfrentamientos = (data || []).filter(
        (enfrentamiento) => enfrentamiento.subcategoria_id === subcategoriaId,
      )
      const esCampeonAutomatico =
        enfrentamientos.length === 1 &&
        enfrentamientos[0].ronda === 'final' &&
        enfrentamientos[0].bye === true &&
        enfrentamientos[0].ganador_id !== null
      const finalFinalizada = enfrentamientos.some(
        (enfrentamiento) =>
          enfrentamiento.ronda === 'final' &&
          enfrentamiento.estado === 'finalizado' &&
          enfrentamiento.ganador_id !== null,
      )

      if (!enfrentamientos.length) {
        estados[subcategoriaId] = 'sin_sorteo'
      } else if (esCampeonAutomatico) {
        estados[subcategoriaId] = 'walkover'
      } else if (finalFinalizada) {
        estados[subcategoriaId] = 'finalizado'
      } else {
        estados[subcategoriaId] = 'en_curso'
      }

      return estados
    }, {})
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los estados de las subcategorias.')
  }
}

export async function listarEnfrentamientosPorSubcategoria(subcategoriaId) {
  try {
    if (!subcategoriaId) return []

    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('subcategoria_id', subcategoriaId)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los enfrentamientos de la llave.')
    }

    const enfrentamientos = (data || []).sort((a, b) => {
      const ordenRondaA = ordenRondas[a.ronda] || 99
      const ordenRondaB = ordenRondas[b.ronda] || 99

      if (ordenRondaA !== ordenRondaB) return ordenRondaA - ordenRondaB

      return a.orden - b.orden
    })
    const idsEquipos = enfrentamientos.flatMap((enfrentamiento) => [
      enfrentamiento.equipo_a_id,
      enfrentamiento.equipo_b_id,
      enfrentamiento.ganador_id,
    ])
    const [equiposPorId, resultadosPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarResultadosPorEnfrentamientos(
        enfrentamientos.map((enfrentamiento) => enfrentamiento.id),
      ),
    ])

    return adjuntarDatos(enfrentamientos, equiposPorId, resultadosPorId)
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los enfrentamientos de la llave.')
  }
}

export async function obtenerGanadorFinal(subcategoriaId) {
  try {
    if (!subcategoriaId) return null

    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('subcategoria_id', subcategoriaId)
      .eq('ronda', 'final')
      .eq('estado', 'finalizado')
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error('No se pudo cargar el ganador final.')
    }

    if (!data?.ganador_id) return null

    const equiposPorId = await listarEquiposPorIds([data.ganador_id])

    return equiposPorId.get(data.ganador_id) || null
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar el ganador final.')
  }
}
