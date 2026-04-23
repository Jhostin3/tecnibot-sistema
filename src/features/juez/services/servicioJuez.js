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

function normalizarGoles(valor) {
  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero < 0) {
    throw new Error('Los goles deben ser numeros enteros desde 0.')
  }

  return numero
}

function calcularSiguienteRonda(rondaActual, cantidadPartidos) {
  if (rondaActual === 'final' || rondaActual === 'tercer_lugar') return null

  const rondasPorPartidos = {
    1: 'final',
    2: 'semifinal',
    4: 'cuartos',
    8: 'octavos',
    16: 'dieciseisavos',
    32: 'treintaidosavos',
  }
  const siguienteCantidad = cantidadPartidos / 2

  return rondasPorPartidos[siguienteCantidad] || null
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
      .select(seleccionEnfrentamientos)
      .eq('estado', 'activo')
      .eq('bye', false)
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

    return enfrentamientos.map((partido) =>
      adjuntarDatosPartido(partido, equiposPorId, subcategoriasPorId),
    )
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los partidos activos.')
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

async function listarRondaPorPartido(partido) {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select(seleccionEnfrentamientos)
      .eq('subcategoria_id', partido.subcategoria_id)
      .eq('ronda', partido.ronda)
      .order('orden', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudo verificar si la ronda termino.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudo verificar si la ronda termino.')
  }
}

async function existeSiguienteRonda(subcategoriaId, ronda) {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select('id')
      .eq('subcategoria_id', subcategoriaId)
      .eq('ronda', ronda)
      .limit(1)

    if (error) {
      throw new Error('No se pudo verificar la siguiente ronda.')
    }

    return Boolean(data?.length)
  } catch (error) {
    throw new Error(error.message || 'No se pudo verificar la siguiente ronda.')
  }
}

async function completarSiguienteRondaExistente(subcategoriaId, siguienteRonda, ganadores) {
  const { data, error } = await supabase
    .from('enfrentamientos')
    .select(seleccionEnfrentamientos)
    .eq('subcategoria_id', subcategoriaId)
    .eq('ronda', siguienteRonda)
    .order('orden', { ascending: true })
    .limit(500)

  if (error) {
    throw new Error('No se pudo actualizar la siguiente ronda.')
  }

  const enfrentamientos = data || []
  const actualizaciones = []
  let indiceGanador = 0

  enfrentamientos.forEach((enfrentamiento) => {
    let equipoA = enfrentamiento.equipo_a_id
    let equipoB = enfrentamiento.equipo_b_id

    if (!equipoA && indiceGanador < ganadores.length) {
      equipoA = ganadores[indiceGanador]
      indiceGanador += 1
    }

    if (!equipoB && indiceGanador < ganadores.length) {
      equipoB = ganadores[indiceGanador]
      indiceGanador += 1
    }

    if (
      equipoA !== enfrentamiento.equipo_a_id ||
      equipoB !== enfrentamiento.equipo_b_id
    ) {
      actualizaciones.push({
        equipo_a_id: equipoA,
        equipo_b_id: equipoB,
        id: enfrentamiento.id,
      })
    }
  })

  if (!actualizaciones.length) return

  const operaciones = actualizaciones.map((actualizacion) =>
    supabase
      .from('enfrentamientos')
      .update({
        equipo_a_id: actualizacion.equipo_a_id,
        equipo_b_id: actualizacion.equipo_b_id,
      })
      .eq('id', actualizacion.id),
  )

  const resultados = await Promise.all(operaciones)
  const primerError = resultados.find((resultado) => resultado.error)?.error

  if (primerError) {
    throw new Error('El resultado se guardo, pero no se pudo completar la siguiente ronda.')
  }
}

async function generarSiguienteRondaSiCorresponde(partido) {
  const ronda = await listarRondaPorPartido(partido)
  const rondaFinalizada = ronda.length > 0 && ronda.every((enfrentamiento) =>
    enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id
  )

  if (!rondaFinalizada || partido.ronda === 'final' || partido.ronda === 'tercer_lugar') return

  if (partido.ronda === 'semifinal') {
    const semifinales = [...ronda].sort((a, b) => a.orden - b.orden)
    const [semifinalA, semifinalB] = semifinales

    if (!semifinalA || !semifinalB) return

    const finalExiste = await existeSiguienteRonda(partido.subcategoria_id, 'final')
    const tercerLugarExiste = await existeSiguienteRonda(partido.subcategoria_id, 'tercer_lugar')
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
    const nuevosEnfrentamientos = []

    if (!finalExiste && ganadorSemifinalA && ganadorSemifinalB) {
      nuevosEnfrentamientos.push({
        bye: false,
        equipo_a_id: ganadorSemifinalA,
        equipo_b_id: ganadorSemifinalB,
        estado: 'pendiente',
        ganador_id: null,
        orden: 1,
        ronda: 'final',
        subcategoria_id: partido.subcategoria_id,
      })
    }

    if (!tercerLugarExiste && perdedorSemifinalA && perdedorSemifinalB) {
      nuevosEnfrentamientos.push({
        bye: false,
        equipo_a_id: perdedorSemifinalA,
        equipo_b_id: perdedorSemifinalB,
        estado: 'pendiente',
        ganador_id: null,
        orden: 1,
        ronda: 'tercer_lugar',
        subcategoria_id: partido.subcategoria_id,
      })
    }

    if (!nuevosEnfrentamientos.length) return

    const { error } = await supabase.from('enfrentamientos').insert(nuevosEnfrentamientos)

    if (error) {
      throw new Error('El resultado se guardo, pero no se pudieron crear los partidos finales.')
    }

    return
  }

  const siguienteRonda = calcularSiguienteRonda(partido.ronda, ronda.length)

  if (!siguienteRonda) {
    return
  }

  const ganadores = ronda
    .sort((a, b) => a.orden - b.orden)
    .map((enfrentamiento) => enfrentamiento.ganador_id)

  if (await existeSiguienteRonda(partido.subcategoria_id, siguienteRonda)) {
    await completarSiguienteRondaExistente(partido.subcategoria_id, siguienteRonda, ganadores)
    return
  }

  const nuevosEnfrentamientos = []

  for (let indice = 0; indice < ganadores.length; indice += 2) {
    const equipoA = ganadores[indice]
    const equipoB = ganadores[indice + 1]

    if (!equipoA || !equipoB) continue

    nuevosEnfrentamientos.push({
      bye: false,
      equipo_a_id: equipoA,
      equipo_b_id: equipoB,
      estado: 'pendiente',
      ganador_id: null,
      orden: nuevosEnfrentamientos.length + 1,
      ronda: siguienteRonda,
      subcategoria_id: partido.subcategoria_id,
    })
  }

  if (!nuevosEnfrentamientos.length) return

  const { error } = await supabase.from('enfrentamientos').insert(nuevosEnfrentamientos)

  if (error) {
    throw new Error('El resultado se guardo, pero no se pudo crear la siguiente ronda.')
  }
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

    await generarSiguienteRondaSiCorresponde({
      ...enfrentamiento,
      estado: 'finalizado',
      ganador_id: ganadorId,
    })

    return {
      ganador_id: ganadorId,
      goles_a: golesEquipoA,
      goles_b: golesEquipoB,
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo registrar el resultado.')
  }
}
