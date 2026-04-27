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

function normalizarCruce(equipoAOriginal, equipoBOriginal) {
  const equipoA = equipoAOriginal || null
  const equipoB =
    equipoA && equipoBOriginal && equipoA === equipoBOriginal ? null : (equipoBOriginal || null)
  const bye = Boolean(equipoA) && !equipoB

  return {
    bye,
    equipo_a_id: equipoA,
    equipo_b_id: equipoB,
    estado: bye ? 'finalizado' : 'pendiente',
    ganador_id: bye ? equipoA : null,
  }
}

function validarEquiposUnicosEnRonda(enfrentamientos = [], mensajeBase) {
  const equiposRonda = new Set()

  enfrentamientos.forEach((enfrentamiento) => {
    ;[enfrentamiento.equipo_a_id, enfrentamiento.equipo_b_id]
      .filter(Boolean)
      .forEach((equipoId) => {
        if (equiposRonda.has(equipoId)) {
          throw new Error(mensajeBase || 'Se detecto un equipo repetido en la ronda generada.')
        }

        equiposRonda.add(equipoId)
      })
  })
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

async function guardarEnfrentamientosRondaExistente(enfrentamientos = []) {
  if (!enfrentamientos.length) {
    return
  }

  const operaciones = enfrentamientos.map((enfrentamiento) =>
    supabase
      .from('enfrentamientos')
      .update({
        equipo_a_id: enfrentamiento.equipo_a_id,
        equipo_b_id: enfrentamiento.equipo_b_id,
        ganador_id: enfrentamiento.ganador_id,
        estado: enfrentamiento.estado,
        bye: enfrentamiento.bye,
      })
      .eq('id', enfrentamiento.id),
  )

  const resultados = await Promise.all(operaciones)
  const primerError = resultados.find((resultado) => resultado.error)?.error

  if (primerError) {
    throw new Error('El resultado se guardo, pero no se pudo completar la siguiente ronda.')
  }
}

async function eliminarRonda(subcategoriaId, ronda) {
  const { data, error } = await supabase
    .from('enfrentamientos')
    .delete()
    .eq('subcategoria_id', subcategoriaId)
    .eq('ronda', ronda)
    .select('id')

  if (error) {
    throw new Error('No se pudo limpiar la siguiente ronda antes de regenerarla.')
  }

  if (data?.length) {
    console.log(`ELIMINANDO RONDA EXISTENTE: ${ronda}`, data.map((fila) => fila.id))
  }
}

function construirEnfrentamientosDesdeOrigen(subcategoriaId, ronda, enfrentamientosOrigen) {
  const nuevosEnfrentamientos = []
  const cantidadPartidos = Math.max(1, Math.ceil(enfrentamientosOrigen.length / 2))

  for (let indice = 0; indice < cantidadPartidos; indice += 1) {
    const origenA = enfrentamientosOrigen[indice * 2] || null
    const origenB = enfrentamientosOrigen[indice * 2 + 1] || null
    const equipoA = origenA?.ganador_id ?? null
    const equipoB = origenB?.ganador_id ?? null
    const cruce = normalizarCruce(equipoA, equipoB)

    console.log(`Partido ${indice + 1}: ${equipoA} vs ${equipoB}`)

    nuevosEnfrentamientos.push({
      subcategoria_id: subcategoriaId,
      ronda,
      ...cruce,
      orden: indice + 1,
    })
  }

  return nuevosEnfrentamientos
}

function completarEnfrentamientosExistentes(enfrentamientosDestino, ganadores) {
  let indiceGanador = 0

  return enfrentamientosDestino.map((enfrentamiento) => {
    const equipoA =
      enfrentamiento.equipo_a_id || ganadores[indiceGanador++] || null
    const equipoB =
      enfrentamiento.equipo_b_id || ganadores[indiceGanador++] || null
    const cruce = normalizarCruce(equipoA, equipoB)

    return {
      ...enfrentamiento,
      ...cruce,
    }
  })
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

  await eliminarRonda(subcategoriaId, 'final')
  await eliminarRonda(subcategoriaId, 'tercer_lugar')

  const nuevosEnfrentamientos = [
    {
      subcategoria_id: subcategoriaId,
      ronda: 'final',
      ...normalizarCruce(ganadorSemifinalA, ganadorSemifinalB || null),
      orden: 1,
    },
  ]

  if (perdedorSemifinalA || perdedorSemifinalB) {
    nuevosEnfrentamientos.push({
      subcategoria_id: subcategoriaId,
      ronda: 'tercer_lugar',
      ...normalizarCruce(perdedorSemifinalA || null, perdedorSemifinalB || null),
      orden: 1,
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

  validarEquiposUnicosEnRonda(
    nuevosEnfrentamientos,
    'No se pudo generar final/tercer lugar porque un equipo quedo repetido en la misma ronda.',
  )

  const { error } = await supabase.from('enfrentamientos').insert(nuevosEnfrentamientos)

  if (error) {
    console.error('ERROR AL INSERTAR:', error)
    throw new Error('El resultado se guardo, pero no se pudieron crear los partidos finales.')
  }
}

async function generarSiguienteRonda(subcategoriaId, rondaFinalizada) {
  const enfrentamientos = await listarEnfrentamientosRonda(subcategoriaId, rondaFinalizada)

  if (!enfrentamientos.length || rondaFinalizada === 'final' || rondaFinalizada === 'tercer_lugar') {
    return
  }

  if (rondaFinalizada === 'semifinal') {
    await generarFinalYPartidoTercerLugar(subcategoriaId, enfrentamientos)
    return
  }

  const ganadores = enfrentamientos.map((enfrentamiento) => enfrentamiento.ganador_id).filter(Boolean)

  console.log('GANADORES EXTRAIDOS:', ganadores)
  console.log('CANTIDAD:', ganadores.length)

  const siguienteRonda = obtenerSiguienteRonda(rondaFinalizada)

  if (!siguienteRonda) {
    return
  }

  const enfrentamientosExistentes = await listarEnfrentamientosRonda(subcategoriaId, siguienteRonda)

  if (enfrentamientosExistentes.length) {
    const cantidadEsperada = Math.max(1, Math.ceil(enfrentamientos.length / 2))

    if (enfrentamientosExistentes.length >= cantidadEsperada) {
      const actualizados = completarEnfrentamientosExistentes(
        enfrentamientosExistentes,
        ganadores,
      )

      validarEquiposUnicosEnRonda(
        actualizados,
        'No se pudo completar la siguiente ronda porque un equipo quedo repetido en la misma ronda.',
      )
      console.log('ACTUALIZANDO RONDA EXISTENTE:', actualizados)
      await guardarEnfrentamientosRondaExistente(actualizados)
      return
    }
  }

  await eliminarRonda(subcategoriaId, siguienteRonda)

  const nuevosEnfrentamientos = construirEnfrentamientosDesdeOrigen(
    subcategoriaId,
    siguienteRonda,
    enfrentamientos,
  )

  if (!nuevosEnfrentamientos.length) {
    return
  }

  validarEquiposUnicosEnRonda(
    nuevosEnfrentamientos,
    'No se pudo crear la siguiente ronda porque un equipo quedo repetido en la misma ronda.',
  )
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
