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

const ordenSecuencialRondas = [
  'treintaidosavos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinal',
  'tercer_lugar',
  'final',
]

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

function obtenerOrdenRonda(ronda) {
  return ordenRondas[ronda] || 999
}

function obtenerGrupoRondasPorOrden(orden) {
  return ordenSecuencialRondas.filter((ronda) => obtenerOrdenRonda(ronda) === orden)
}

async function listarEnfrentamientosPorSubcategoria(subcategoriaId) {
  const { data, error } = await supabase
    .from('enfrentamientos')
    .select(seleccionEnfrentamientos)
    .eq('subcategoria_id', subcategoriaId)
    .limit(500)

  if (error) {
    throw new Error('No se pudieron verificar los enfrentamientos de la subcategoria.')
  }

  return data || []
}

function obtenerPrimeraRondaPendiente(enfrentamientos = []) {
  const pendientes = enfrentamientos
    .filter((enfrentamiento) => enfrentamiento.estado === 'pendiente' && !enfrentamiento.bye)
    .sort(compararEnfrentamientos)

  return pendientes[0]?.ronda || null
}

async function activarRondasPendientes(subcategoriaId, rondas = []) {
  if (!subcategoriaId || !rondas.length) {
    return 0
  }

  const { data, error } = await supabase
    .from('enfrentamientos')
    .update({ estado: 'activo' })
    .eq('subcategoria_id', subcategoriaId)
    .eq('estado', 'pendiente')
    .in('ronda', rondas)
    .select('id')

  if (error) {
    throw new Error('No se pudo activar la siguiente ronda del torneo.')
  }

  return data?.length || 0
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

async function listarEnfrentamientosActivos(subcategoriaId) {
  let consulta = supabase
    .from('enfrentamientos')
    .select(seleccionEnfrentamientos)
    .eq('estado', 'activo')
    .limit(500)

  if (subcategoriaId) {
    consulta = consulta.eq('subcategoria_id', subcategoriaId)
  }

  const { data, error } = await consulta

  if (error) {
    throw new Error('No se pudo verificar si ya existe una ronda activa.')
  }

  return data || []
}

async function asegurarSinOtraRondaActiva(enfrentamientosObjetivo) {
  const subcategoriaId = enfrentamientosObjetivo[0]?.subcategoria_id
  const enfrentamientosActivos = await listarEnfrentamientosActivos(subcategoriaId)

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

export async function iniciarTorneo(subcategoriaId) {
  try {
    if (!subcategoriaId) {
      throw new Error('Selecciona una subcategoria para iniciar el torneo.')
    }

    const enfrentamientosActivos = await listarEnfrentamientosActivos(subcategoriaId)

    if (enfrentamientosActivos.length) {
      throw new Error('La subcategoria seleccionada ya tiene partidos activos.')
    }

    const enfrentamientosSubcategoria = await listarEnfrentamientosPorSubcategoria(subcategoriaId)
    const primeraRonda = obtenerPrimeraRondaPendiente(enfrentamientosSubcategoria)

    if (!primeraRonda) {
      throw new Error('No hay partidos pendientes para iniciar el torneo.')
    }

    const partidosPrimeraRonda = enfrentamientosSubcategoria.filter(
      (enfrentamiento) => enfrentamiento.ronda === primeraRonda,
    )
    const cantidadActivada = await activarRondasPendientes(subcategoriaId, [primeraRonda])

    return {
      cantidadPartidos: cantidadActivada || partidosPrimeraRonda.length,
      ronda: primeraRonda,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo iniciar el torneo.')
  }
}

export async function verificarYAvanzarRonda(subcategoriaId, rondaActual) {
  try {
    if (!subcategoriaId || !rondaActual) {
      return {
        avanzo: false,
        nuevaRonda: null,
      }
    }

    const enfrentamientosSubcategoria = await listarEnfrentamientosPorSubcategoria(subcategoriaId)
    const enfrentamientosRondaActual = enfrentamientosSubcategoria.filter(
      (enfrentamiento) => enfrentamiento.ronda === rondaActual,
    )

    if (!enfrentamientosRondaActual.length) {
      return {
        avanzo: false,
        nuevaRonda: null,
      }
    }

    const rondaCompleta = enfrentamientosRondaActual.every(
      (enfrentamiento) => enfrentamiento.estado === 'finalizado',
    )

    if (!rondaCompleta) {
      return {
        avanzo: false,
        nuevaRonda: null,
      }
    }

    const ordenRondaActual = obtenerOrdenRonda(rondaActual)
    const pendientesSiguientes = enfrentamientosSubcategoria
      .filter(
        (enfrentamiento) =>
          enfrentamiento.estado === 'pendiente' &&
          !enfrentamiento.bye &&
          obtenerOrdenRonda(enfrentamiento.ronda) > ordenRondaActual,
      )
      .sort(compararEnfrentamientos)

    if (!pendientesSiguientes.length) {
      return {
        avanzo: false,
        nuevaRonda: null,
        torneoFinalizado: true,
      }
    }

    const siguienteOrden = obtenerOrdenRonda(pendientesSiguientes[0].ronda)
    const rondasActivables = obtenerGrupoRondasPorOrden(siguienteOrden).filter((ronda) =>
      pendientesSiguientes.some((enfrentamiento) => enfrentamiento.ronda === ronda),
    )

    if (!rondasActivables.length) {
      return {
        avanzo: false,
        nuevaRonda: null,
      }
    }

    await activarRondasPendientes(subcategoriaId, rondasActivables)

    return {
      avanzo: true,
      nuevaRonda: rondasActivables[0],
      torneoFinalizado: false,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo verificar y avanzar la ronda.')
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
