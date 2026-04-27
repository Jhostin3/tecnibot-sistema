import { supabase } from '../../../lib/supabaseCliente'

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

const ORDEN_RONDAS_ELIMINATORIAS = [
  'treintaidosavos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinal',
  'final',
]

function compararPorRondaYOrden(a, b) {
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

function obtenerClaveRonda(partido) {
  return `${partido.subcategoria_id}-${partido.ronda}`
}

function normalizarGoles(valor) {
  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero < 0) {
    throw new Error('Los goles deben ser numeros enteros desde 0.')
  }

  return numero
}

function obtenerSiguienteRonda(rondaActual) {
  const indiceActual = ORDEN_RONDAS_ELIMINATORIAS.indexOf(rondaActual)

  if (indiceActual === -1) {
    return null
  }

  return ORDEN_RONDAS_ELIMINATORIAS[indiceActual + 1] || null
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

function adjuntarDatosPartido(enfrentamiento, equiposPorId, subcategoriasPorId) {
  return {
    ...enfrentamiento,
    equipo_a: equiposPorId.get(enfrentamiento.equipo_a_id) || null,
    equipo_b: equiposPorId.get(enfrentamiento.equipo_b_id) || null,
    etiqueta_ronda: etiquetasRonda[enfrentamiento.ronda] || enfrentamiento.ronda,
    subcategoria: subcategoriasPorId.get(enfrentamiento.subcategoria_id) || null,
  }
}

export async function listarPartidosActivos() {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(`
        id,
        ronda,
        orden,
        estado,
        bye,
        equipo_a_id,
        equipo_b_id,
        ganador_id,
        subcategoria_id,
        cancha
      `)
      .eq('estado', 'activo')
      .eq('bye', false)
      .order('ronda', { ascending: true })
      .order('orden', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los partidos activos.')
    }

    const enfrentamientos = data || []
    const idsEquipos = enfrentamientos.flatMap((partido) => [
      partido.equipo_a_id,
      partido.equipo_b_id,
    ])
    const idsSubcategorias = enfrentamientos.map((partido) => partido.subcategoria_id)
    const [equiposPorId, subcategoriasPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarSubcategoriasPorIds(idsSubcategorias),
    ])

    return enfrentamientos
      .sort(compararPorRondaYOrden)
      .map((partido) => adjuntarDatosPartido(partido, equiposPorId, subcategoriasPorId))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los partidos activos.')
  }
}

export async function listarPartidosPendientesJuez() {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(`
        id,
        ronda,
        orden,
        estado,
        bye,
        equipo_a_id,
        equipo_b_id,
        ganador_id,
        subcategoria_id,
        cancha
      `)
      .eq('estado', 'pendiente')
      .eq('bye', false)
      .order('ronda', { ascending: true })
      .order('orden', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los partidos pendientes del juez.')
    }

    const enfrentamientos = data || []
    const idsEquipos = enfrentamientos.flatMap((partido) => [
      partido.equipo_a_id,
      partido.equipo_b_id,
    ])
    const idsSubcategorias = enfrentamientos.map((partido) => partido.subcategoria_id)
    const [equiposPorId, subcategoriasPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarSubcategoriasPorIds(idsSubcategorias),
    ])

    return enfrentamientos
      .sort(compararPorRondaYOrden)
      .map((partido) => adjuntarDatosPartido(partido, equiposPorId, subcategoriasPorId))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los partidos pendientes del juez.')
  }
}

export async function listarPanelJuez() {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .in('estado', ['activo', 'pendiente'])
      .eq('bye', false)
      .limit(500)

    if (error) {
      throw new Error('No se pudo cargar el estado actual de la competencia.')
    }

    const enfrentamientos = (data || []).sort(compararPorRondaYOrden)
    const idsEquipos = enfrentamientos.flatMap((partido) => [
      partido.equipo_a_id,
      partido.equipo_b_id,
    ])
    const idsSubcategorias = enfrentamientos.map((partido) => partido.subcategoria_id)
    const [equiposPorId, subcategoriasPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarSubcategoriasPorIds(idsSubcategorias),
    ])
    const partidos = enfrentamientos.map((partido) =>
      adjuntarDatosPartido(partido, equiposPorId, subcategoriasPorId),
    )
    const partidosActivos = partidos.filter((partido) => partido.estado === 'activo')
    const partidosPendientes = partidos.filter((partido) => partido.estado === 'pendiente')
    const claveActiva = partidosActivos[0] ? obtenerClaveRonda(partidosActivos[0]) : null
    const clavePendiente = partidosPendientes[0] ? obtenerClaveRonda(partidosPendientes[0]) : null

    return {
      claveActiva,
      clavePendiente,
      partidosActivos,
      partidosPendientes,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar el estado actual de la competencia.')
  }
}

export async function obtenerPartidoActivoPorId(enfrentamientoId) {
  try {
    if (!enfrentamientoId) {
      throw new Error('No se pudo identificar el partido.')
    }

    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('id', enfrentamientoId)
      .eq('estado', 'activo')
      .eq('bye', false)
      .single()

    if (error) {
      throw new Error('No se pudo cargar el partido activo.')
    }

    const idsEquipos = [data.equipo_a_id, data.equipo_b_id]
    const [equiposPorId, subcategoriasPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarSubcategoriasPorIds([data.subcategoria_id]),
    ])

    return adjuntarDatosPartido(data, equiposPorId, subcategoriasPorId)
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar el partido activo.')
  }
}

async function listarEnfrentamientosRonda(subcategoriaId, ronda) {
  const { data, error } = await supabase
    .from('enfrentamientos')
    .select('id, orden, ganador_id, bye, estado, equipo_a_id, equipo_b_id')
    .eq('subcategoria_id', subcategoriaId)
    .eq('ronda', ronda)
    .order('orden', { ascending: true })
    .limit(500)

  if (error) {
    throw new Error('No se pudo verificar si la ronda termino.')
  }

  return data || []
}

async function eliminarRonda(subcategoriaId, ronda) {
  const { error } = await supabase
    .from('enfrentamientos')
    .delete()
    .eq('subcategoria_id', subcategoriaId)
    .eq('ronda', ronda)

  if (error) {
    throw new Error('No se pudo limpiar la siguiente ronda antes de regenerarla.')
  }
}

function construirEnfrentamientosDesdeGanadores(subcategoriaId, ronda, ganadores) {
  const nuevosEnfrentamientos = []

  for (let i = 0; i < ganadores.length; i += 2) {
    const equipoA = ganadores[i]
    const equipoB = ganadores[i + 1] ?? null
    const esBye = equipoB === null

    if (!equipoA) {
      continue
    }

    console.log(`Partido ${i / 2 + 1}: ${equipoA} vs ${equipoB}`)

    nuevosEnfrentamientos.push({
      subcategoria_id: subcategoriaId,
      ronda,
      equipo_a_id: equipoA,
      equipo_b_id: equipoB,
      ganador_id: esBye ? equipoA : null,
      estado: esBye ? 'finalizado' : 'pendiente',
      orden: i / 2 + 1,
      bye: esBye,
    })
  }

  return nuevosEnfrentamientos
}

async function generarFinalYPartidoTercerLugar(subcategoriaId, semifinales) {
  const [semifinalA, semifinalB] = semifinales

  if (!semifinalA || !semifinalB) {
    return
  }

  const ganadorSemifinalA = semifinalA.ganador_id
  const ganadorSemifinalB = semifinalB.ganador_id
  const perdedorSemifinalA =
    semifinalA.equipo_a_id === semifinalA.ganador_id
      ? semifinalA.equipo_b_id
      : semifinalA.equipo_a_id
  const perdedorSemifinalB =
    semifinalB.equipo_a_id === semifinalB.ganador_id
      ? semifinalB.equipo_b_id
      : semifinalB.equipo_a_id

  if (!ganadorSemifinalA || !ganadorSemifinalB) {
    console.error('No hay suficientes ganadores para generar la final')
    return
  }

  await eliminarRonda(subcategoriaId, 'final')
  await eliminarRonda(subcategoriaId, 'tercer_lugar')

  const nuevosEnfrentamientos = [
    {
      subcategoria_id: subcategoriaId,
      ronda: 'final',
      equipo_a_id: ganadorSemifinalA,
      equipo_b_id: ganadorSemifinalB,
      ganador_id: null,
      estado: 'pendiente',
      orden: 1,
      bye: false,
    },
  ]

  if (perdedorSemifinalA && perdedorSemifinalB) {
    nuevosEnfrentamientos.push({
      subcategoria_id: subcategoriaId,
      ronda: 'tercer_lugar',
      equipo_a_id: perdedorSemifinalA,
      equipo_b_id: perdedorSemifinalB,
      ganador_id: null,
      estado: 'pendiente',
      orden: 1,
      bye: false,
    })
  }

  console.log('GANADORES EXTRAIDOS:', [
    ganadorSemifinalA,
    ganadorSemifinalB,
    perdedorSemifinalA,
    perdedorSemifinalB,
  ].filter(Boolean))
  console.log('CANTIDAD:', nuevosEnfrentamientos.length)
  console.log('INSERTANDO:', nuevosEnfrentamientos)

  const { error } = await supabase.from('enfrentamientos').insert(nuevosEnfrentamientos)

  if (error) {
    console.error('ERROR AL INSERTAR:', error)
    throw new Error('El resultado se guardo, pero no se pudieron crear los partidos finales.')
  }
}

async function generarSiguienteRonda(subcategoriaId, rondaFinalizada) {
  const enfrentamientos = await listarEnfrentamientosRonda(subcategoriaId, rondaFinalizada)
  const rondaCompleta =
    enfrentamientos.length > 0 &&
    enfrentamientos.every(
      (enfrentamiento) =>
        enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id,
    )

  if (!rondaCompleta || rondaFinalizada === 'final' || rondaFinalizada === 'tercer_lugar') {
    return
  }

  if (rondaFinalizada === 'semifinal') {
    await generarFinalYPartidoTercerLugar(subcategoriaId, enfrentamientos)
    return
  }

  const ganadores = enfrentamientos.map((enfrentamiento) => enfrentamiento.ganador_id).filter(Boolean)

  console.log('GANADORES EXTRAIDOS:', ganadores)
  console.log('CANTIDAD:', ganadores.length)

  if (ganadores.length < 2) {
    console.error('No hay suficientes ganadores para generar siguiente ronda')
    return
  }

  const siguienteRonda = obtenerSiguienteRonda(rondaFinalizada)

  if (!siguienteRonda) {
    return
  }

  await eliminarRonda(subcategoriaId, siguienteRonda)

  const nuevosEnfrentamientos = construirEnfrentamientosDesdeGanadores(
    subcategoriaId,
    siguienteRonda,
    ganadores,
  )

  if (!nuevosEnfrentamientos.length) {
    return
  }

  console.log('INSERTANDO:', nuevosEnfrentamientos)

  const { error } = await supabase
    .from('enfrentamientos')
    .insert(nuevosEnfrentamientos)

  if (error) {
    console.error('ERROR AL INSERTAR:', error)
    throw new Error('El resultado se guardo, pero no se pudo crear la siguiente ronda.')
  }

  console.log('Siguiente ronda generada correctamente')
}

export async function registrarResultadoPartido({
  enfrentamiento,
  golesA,
  golesB,
  juezId,
  observacion,
}) {
  try {
    if (!enfrentamiento?.id || !juezId) {
      throw new Error('Faltan datos para registrar el resultado.')
    }

    const golesEquipoA = normalizarGoles(golesA)
    const golesEquipoB = normalizarGoles(golesB)

    if (golesEquipoA === golesEquipoB) {
      throw new Error('Debe haber un ganador. Modifica el marcador.')
    }

    const ganadorId =
      golesEquipoA > golesEquipoB
        ? enfrentamiento.equipo_a_id
        : enfrentamiento.equipo_b_id

    const { error: errorResultado } = await supabase.from('resultados').insert({
      enfrentamiento_id: enfrentamiento.id,
      fecha: new Date().toISOString(),
      goles_a: golesEquipoA,
      goles_b: golesEquipoB,
      juez_id: juezId,
      observacion: observacion?.trim() || null,
    })

    if (errorResultado) {
      throw new Error('No se pudo guardar el resultado del partido.')
    }

    const { error: errorEnfrentamiento } = await supabase
      .from('enfrentamientos')
      .update({
        estado: 'finalizado',
        ganador_id: ganadorId,
      })
      .eq('id', enfrentamiento.id)

    if (errorEnfrentamiento) {
      throw new Error('El resultado se guardo, pero no se pudo finalizar el partido.')
    }

    await generarSiguienteRonda(enfrentamiento.subcategoria_id, enfrentamiento.ronda)

    return {
      ganador_id: ganadorId,
      goles_a: golesEquipoA,
      goles_b: golesEquipoB,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo registrar el resultado.')
  }
}
