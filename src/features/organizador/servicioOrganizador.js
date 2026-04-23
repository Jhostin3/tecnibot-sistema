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
  tercer_lugar: 'Tercer lugar',
}

const ordenRondas = {
  treintaidosavos: 1,
  dieciseisavos: 2,
  octavos: 3,
  cuartos: 4,
  semifinal: 5,
  tercer_lugar: 6,
  final: 6,
}

function compararEnfrentamientos(a, b) {
  const ordenRondaA = ordenRondas[a.ronda] || 999
  const ordenRondaB = ordenRondas[b.ronda] || 999

  if (ordenRondaA !== ordenRondaB) {
    return ordenRondaA - ordenRondaB
  }

  if (a.subcategoria_id !== b.subcategoria_id) {
    return `${a.subcategoria_id}`.localeCompare(`${b.subcategoria_id}`)
  }

  return (a.orden || 0) - (b.orden || 0)
}

function obtenerClaveRonda(enfrentamiento) {
  return `${enfrentamiento.subcategoria_id}-${enfrentamiento.ronda}`
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

async function listarEnfrentamientosActivos() {
  const { data, error } = await supabase
    .from('enfrentamientos')
    .select(seleccionEnfrentamientos)
    .eq('estado', 'activo')
    .limit(500)

  if (error) {
    throw new Error('No se pudo verificar si ya existe una ronda activa.')
  }

  return data || []
}

async function asegurarSinOtraRondaActiva(enfrentamientosObjetivo) {
  const enfrentamientosActivos = await listarEnfrentamientosActivos()

  if (!enfrentamientosActivos.length) return

  const clavesObjetivo = new Set(enfrentamientosObjetivo.map(obtenerClaveRonda))
  const hayOtraRondaActiva = enfrentamientosActivos.some(
    (enfrentamiento) => !clavesObjetivo.has(obtenerClaveRonda(enfrentamiento)),
  )

  if (!hayOtraRondaActiva) return

  const rondaActiva = enfrentamientosActivos[0]
  const etiquetaRonda = etiquetasRonda[rondaActiva.ronda] || rondaActiva.ronda

  throw new Error(
    `Ya hay partidos activos en ${etiquetaRonda}. Finaliza esa ronda antes de activar otra.`,
  )
}

export async function iniciarTorneo() {
  try {
    const enfrentamientosActivos = await listarEnfrentamientosActivos()

    if (enfrentamientosActivos.length) {
      throw new Error('El torneo ya tiene partidos activos en este momento.')
    }

    const { data: enfrentamientosPendientes, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('estado', 'pendiente')
      .eq('bye', false)
      .limit(500)

    if (error) {
      throw new Error('No se pudo verificar la primera ronda del torneo.')
    }

    if (!enfrentamientosPendientes?.length) {
      throw new Error('No hay partidos pendientes para iniciar el torneo.')
    }

    const primeraRonda = [...enfrentamientosPendientes].sort(compararEnfrentamientos)[0]?.ronda

    if (!primeraRonda) {
      throw new Error('No se pudo determinar la primera ronda del torneo.')
    }

    const partidosPrimeraRonda = enfrentamientosPendientes.filter(
      (enfrentamiento) => enfrentamiento.ronda === primeraRonda,
    )
    const ids = partidosPrimeraRonda.map((enfrentamiento) => enfrentamiento.id).filter(Boolean)

    const { error: errorActivacion } = await supabase
      .from('enfrentamientos')
      .update({ estado: 'activo' })
      .in('id', ids)

    if (errorActivacion) {
      throw new Error('No se pudo iniciar la primera ronda del torneo.')
    }

    return partidosPrimeraRonda.length
  } catch (error) {
    throw new Error(error.message || 'No se pudo iniciar el torneo.')
  }
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

    const enfrentamientos = await adjuntarDatosEnfrentamientos(data || [])

    return enfrentamientos.sort(compararEnfrentamientos)
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

    const { data: enfrentamiento, error: errorEnfrentamiento } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('id', id)
      .limit(1)
      .single()

    if (errorEnfrentamiento || !enfrentamiento) {
      throw new Error('No se pudo identificar el partido que intentas activar.')
    }

    await asegurarSinOtraRondaActiva([enfrentamiento])

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
