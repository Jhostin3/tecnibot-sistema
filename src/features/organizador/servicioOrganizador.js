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

function obtenerSiguienteRondaEliminatoria(rondaActual) {
  const rondas = [
    'treintaidosavos',
    'dieciseisavos',
    'octavos',
    'cuartos',
    'semifinal',
    'final',
  ]
  const indice = rondas.indexOf(rondaActual)

  if (indice === -1) {
    return null
  }

  return rondas[indice + 1] || null
}

function construirSiguienteRondaDesdeOrigen(subcategoriaId, siguienteRonda, origen) {
  const cantidadPartidos = Math.max(1, Math.ceil(origen.length / 2))

  return Array.from({ length: cantidadPartidos }, (_, indice) => {
    const origenA = origen[indice * 2] || null
    const origenB = origen[indice * 2 + 1] || null
    const equipoA = origenA?.ganador_id ?? null
    const equipoB = origenB?.ganador_id ?? null
    const bye = !origenB && Boolean(equipoA)

    return {
      subcategoria_id: subcategoriaId,
      ronda: siguienteRonda,
      equipo_a_id: equipoA,
      equipo_b_id: equipoB,
      ganador_id: bye ? equipoA : null,
      estado: bye ? 'finalizado' : 'pendiente',
      orden: indice + 1,
      bye,
      cancha: null,
    }
  })
}

async function reemplazarRonda(subcategoriaId, ronda, enfrentamientos) {
  const { error: errorDelete } = await supabase
    .from('enfrentamientos')
    .delete()
    .eq('subcategoria_id', subcategoriaId)
    .eq('ronda', ronda)

  if (errorDelete) {
    throw new Error('No se pudo limpiar la ronda faltante.')
  }

  if (!enfrentamientos.length) {
    return
  }

  const { error: errorInsert } = await supabase
    .from('enfrentamientos')
    .insert(enfrentamientos)

  if (errorInsert) {
    throw new Error('No se pudo reconstruir la ronda faltante.')
  }
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

export async function reconciliarRondasFaltantes(subcategoriaId) {
  if (!subcategoriaId) {
    return false
  }

  const enfrentamientos = await listarEnfrentamientosPorSubcategoria(subcategoriaId)

  if (!enfrentamientos.length) {
    return false
  }

  for (const rondaActual of ['treintaidosavos', 'dieciseisavos', 'octavos', 'cuartos']) {
    const origen = enfrentamientos
      .filter((enfrentamiento) => enfrentamiento.ronda === rondaActual)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))

    if (!origen.length) {
      continue
    }

    const rondaCompleta = origen.every(
      (enfrentamiento) => enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id,
    )

    if (!rondaCompleta) {
      continue
    }

    const siguienteRonda = obtenerSiguienteRondaEliminatoria(rondaActual)

    if (!siguienteRonda) {
      continue
    }

    const existentes = enfrentamientos.filter(
      (enfrentamiento) => enfrentamiento.ronda === siguienteRonda,
    )

    if (existentes.length) {
      continue
    }

    const nuevosEnfrentamientos = construirSiguienteRondaDesdeOrigen(
      subcategoriaId,
      siguienteRonda,
      origen,
    )

    await reemplazarRonda(subcategoriaId, siguienteRonda, nuevosEnfrentamientos)
    return true
  }

  const semifinales = enfrentamientos
    .filter((enfrentamiento) => enfrentamiento.ronda === 'semifinal')
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))

  if (semifinales.length === 2) {
    const semifinalCompleta = semifinales.every(
      (enfrentamiento) => enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id,
    )

    if (semifinalCompleta) {
      const finalExistente = enfrentamientos.some((enfrentamiento) => enfrentamiento.ronda === 'final')

      if (!finalExistente) {
        const [semifinalA, semifinalB] = semifinales
        const perdedorSemifinalA =
          semifinalA.equipo_a_id === semifinalA.ganador_id
            ? semifinalA.equipo_b_id
            : semifinalA.equipo_a_id
        const perdedorSemifinalB =
          semifinalB.equipo_a_id === semifinalB.ganador_id
            ? semifinalB.equipo_b_id
            : semifinalB.equipo_a_id

        const nuevosFinales = [
          {
            subcategoria_id: subcategoriaId,
            ronda: 'final',
            equipo_a_id: semifinalA.ganador_id,
            equipo_b_id: semifinalB.ganador_id,
            ganador_id: !semifinalB.ganador_id ? semifinalA.ganador_id : null,
            estado: !semifinalB.ganador_id ? 'finalizado' : 'pendiente',
            orden: 1,
            bye: !semifinalB.ganador_id,
            cancha: null,
          },
        ]

        if (perdedorSemifinalA || perdedorSemifinalB) {
          const tercerLugarEsBye = Boolean(perdedorSemifinalA) !== Boolean(perdedorSemifinalB)
          const ganadorTercerLugar = perdedorSemifinalA || perdedorSemifinalB || null

          nuevosFinales.push({
            subcategoria_id: subcategoriaId,
            ronda: 'tercer_lugar',
            equipo_a_id: perdedorSemifinalA || null,
            equipo_b_id: perdedorSemifinalB || null,
            ganador_id: tercerLugarEsBye ? ganadorTercerLugar : null,
            estado: tercerLugarEsBye ? 'finalizado' : 'pendiente',
            orden: 1,
            bye: tercerLugarEsBye,
            cancha: null,
          })
        }

        await reemplazarRonda(subcategoriaId, 'final', nuevosFinales.filter((fila) => fila.ronda === 'final'))
        await reemplazarRonda(
          subcategoriaId,
          'tercer_lugar',
          nuevosFinales.filter((fila) => fila.ronda === 'tercer_lugar'),
        )
        return true
      }
    }
  }

  return false
}

function obtenerPrimeraRondaPendiente(enfrentamientos = []) {
  const pendientes = enfrentamientos
    .filter((enfrentamiento) => enfrentamiento.estado === 'pendiente' && !enfrentamiento.bye)
    .sort(compararEnfrentamientos)

  return pendientes[0]?.ronda || null
}

function obtenerRondasActivablesDesdePendientes(enfrentamientos = []) {
  const pendientes = enfrentamientos
    .filter((enfrentamiento) => enfrentamiento.estado === 'pendiente' && !enfrentamiento.bye)
    .sort(compararEnfrentamientos)

  if (!pendientes.length) {
    return []
  }

  const siguienteOrden = obtenerOrdenRonda(pendientes[0].ronda)

  return obtenerGrupoRondasPorOrden(siguienteOrden).filter((ronda) =>
    pendientes.some((enfrentamiento) => enfrentamiento.ronda === ronda),
  )
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

export async function reanudarTorneoSiCorresponde(subcategoriaId) {
  try {
    if (!subcategoriaId) {
      return {
        nuevaRonda: null,
        reanudo: false,
        torneoFinalizado: false,
      }
    }

    await reconciliarRondasFaltantes(subcategoriaId)

    const enfrentamientosSubcategoria = await listarEnfrentamientosPorSubcategoria(subcategoriaId)

    if (!enfrentamientosSubcategoria.length) {
      return {
        nuevaRonda: null,
        reanudo: false,
        torneoFinalizado: false,
      }
    }

    const activos = enfrentamientosSubcategoria.filter((enfrentamiento) => enfrentamiento.estado === 'activo')

    if (activos.length) {
      return {
        nuevaRonda: activos[0].ronda,
        reanudo: false,
        torneoFinalizado: false,
      }
    }

    const finalizados = enfrentamientosSubcategoria.filter(
      (enfrentamiento) => enfrentamiento.estado === 'finalizado',
    )
    const rondasActivables = obtenerRondasActivablesDesdePendientes(enfrentamientosSubcategoria)

    if (!rondasActivables.length) {
      return {
        nuevaRonda: null,
        reanudo: false,
        torneoFinalizado: enfrentamientosSubcategoria.length > 0,
      }
    }

    if (!finalizados.length) {
      return {
        nuevaRonda: null,
        reanudo: false,
        torneoFinalizado: false,
      }
    }

    await activarRondasPendientes(subcategoriaId, rondasActivables)

    return {
      nuevaRonda: rondasActivables[0],
      reanudo: true,
      torneoFinalizado: false,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo reanudar el torneo en curso.')
  }
}

export async function reanudarTorneosEnCurso() {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select('subcategoria_id')
      .limit(500)

    if (error) {
      throw new Error('No se pudieron revisar los torneos en curso.')
    }

    const subcategoriasIds = Array.from(
      new Set(
        (data || [])
          .map((enfrentamiento) => enfrentamiento.subcategoria_id)
          .filter(Boolean),
      ),
    )

    const resultados = []

    for (const subcategoriaId of subcategoriasIds) {
      resultados.push(await reanudarTorneoSiCorresponde(subcategoriaId))
    }

    return resultados
  } catch (error) {
    throw new Error(error.message || 'No se pudieron reanudar los torneos en curso.')
  }
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
      throw new Error('Selecciona una subcategoria antes de iniciar el torneo.')
    }

    await reconciliarRondasFaltantes(subcategoriaId)

    const { data: activa, error: errorActiva } = await supabase
      .from('enfrentamientos')
      .select('id')
      .eq('subcategoria_id', subcategoriaId)
      .eq('estado', 'activo')
      .limit(1)

    if (errorActiva) {
      throw new Error('No se pudo verificar si esta subcategoria ya tiene partidos activos.')
    }

    if (activa?.length) {
      throw new Error('Esta subcategoria ya tiene partidos activos.')
    }

    const enfrentamientosSubcategoria = await listarEnfrentamientosPorSubcategoria(subcategoriaId)
    const primeraRonda = obtenerPrimeraRondaPendiente(enfrentamientosSubcategoria)

    if (!primeraRonda) {
      throw new Error('No hay rondas pendientes para esta subcategoria.')
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

    const rondasActivables = obtenerRondasActivablesDesdePendientes(pendientesSiguientes)

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
