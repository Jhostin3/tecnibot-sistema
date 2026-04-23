import { supabase } from '../../../lib/supabaseCliente'

const seleccionEquiposAprobados = `
  id,
  nombre_equipo,
  nombre_robot,
  representante,
  institucion,
  subcategoria_id
`

const seleccionSorteo = `
  id,
  subcategoria_id,
  equipo_id,
  numero_bola,
  registrado_por,
  fecha,
  equipos(nombre_equipo)
`

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
  created_at
`

const MAX_EQUIPOS_POR_SUBCATEGORIA = 64
const MIN_EQUIPOS_PARA_SORTEO = 4

export async function listarCategoriasSorteo() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar las categorias.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar las categorias.')
  }
}

export async function crearCategoriaSorteo(nombre) {
  try {
    const nombreLimpio = nombre?.trim()

    if (!nombreLimpio) {
      throw new Error('Ingresa un nombre para la categoria.')
    }

    const { data: existente, error: errorExistente } = await supabase
      .from('categorias')
      .select('id')
      .ilike('nombre', nombreLimpio)
      .limit(1)
      .maybeSingle()

    if (errorExistente) {
      throw new Error('No se pudo validar la categoria.')
    }

    if (existente) {
      throw new Error('Ya existe una categoria con ese nombre.')
    }

    const { error } = await supabase.from('categorias').insert({
      nombre: nombreLimpio,
    })

    if (error) {
      throw new Error('No se pudo crear la categoria.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo crear la categoria.')
  }
}

export async function listarSubcategoriasSorteo() {
  try {
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id, categoria_id, nombre')
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

export async function listarSubcategoriasListasParaSorteo() {
  try {
    const subcategorias = await listarSubcategoriasSorteo()
    const revisiones = await Promise.all(
      subcategorias.map(async (subcategoria) => {
        const [equiposAprobados, sorteoActual] = await Promise.all([
          listarEquiposAprobadosPorSubcategoria(subcategoria.id),
          obtenerSorteoPorSubcategoria(subcategoria.id),
        ])

        return {
          ...subcategoria,
          campeonAutomatico: equiposAprobados.length === 1,
          equipos_aprobados: equiposAprobados.length,
          lista: equiposAprobados.length >= 1 && !sorteoActual.length,
        }
      }),
    )

    return revisiones.filter((subcategoria) => subcategoria.lista)
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar las subcategorias listas.')
  }
}

export async function listarEquiposAprobadosPorSubcategoria(subcategoriaId) {
  try {
    const { data, error } = await supabase
      .from('equipos')
      .select(seleccionEquiposAprobados)
      .eq('subcategoria_id', subcategoriaId)
      .eq('estado_homologacion', 'aprobado')
      .order('nombre_equipo', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los equipos aprobados.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos aprobados.')
  }
}

export async function obtenerSorteoPorSubcategoria(subcategoriaId) {
  try {
    const { data, error } = await supabase
      .from('sorteo')
      .select(seleccionSorteo)
      .eq('subcategoria_id', subcategoriaId)
      .order('numero_bola', { ascending: true })
      .limit(500)

    if (error) {
      throw new Error('No se pudo verificar si ya existe un sorteo.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudo verificar si ya existe un sorteo.')
  }
}

export async function listarSubcategoriasConSorteo() {
  try {
    const { data: sorteos, error: errorSorteos } = await supabase
      .from('sorteo')
      .select('subcategoria_id')
      .limit(500)

    if (errorSorteos) {
      throw new Error('No se pudieron cargar los sorteos registrados.')
    }

    const idsSubcategorias = Array.from(
      new Set((sorteos || []).map((sorteo) => sorteo.subcategoria_id).filter(Boolean)),
    )

    if (!idsSubcategorias.length) {
      return []
    }

    const [respuestaSubcategorias, respuestaFinales] = await Promise.all([
      supabase
        .from('subcategorias')
        .select('id, categoria_id, nombre')
        .in('id', idsSubcategorias)
        .order('nombre', { ascending: true })
        .limit(500),
      supabase
        .from('enfrentamientos')
        .select('subcategoria_id, ganador_id')
        .in('subcategoria_id', idsSubcategorias)
        .eq('ronda', 'final')
        .eq('estado', 'finalizado')
        .not('ganador_id', 'is', null)
        .limit(500),
    ])

    if (respuestaSubcategorias.error) {
      throw new Error('No se pudieron cargar las subcategorias con sorteo.')
    }

    if (respuestaFinales.error) {
      throw new Error('No se pudo verificar el estado de los brackets.')
    }

    const subcategoriasFinalizadas = new Set(
      (respuestaFinales.data || []).map((final) => final.subcategoria_id),
    )

    return (respuestaSubcategorias.data || []).map((subcategoria) => ({
      ...subcategoria,
      finalizada: subcategoriasFinalizadas.has(subcategoria.id),
    }))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los brackets del torneo.')
  }
}

async function buscarNumeroBolaDuplicado(subcategoriaId, numeroBola, equipoId) {
  const { data, error } = await supabase
    .from('sorteo')
    .select('id, equipo_id, equipos(nombre_equipo)')
    .eq('subcategoria_id', subcategoriaId)
    .eq('numero_bola', numeroBola)
    .neq('equipo_id', equipoId)
    .limit(1)

  if (error) {
    throw new Error('No se pudo validar el numero de bola.')
  }

  return data || []
}

function crearErrorNumeroBolaDuplicado(numero, nombreEquipo = 'otro equipo') {
  return new Error(
    `El numero ${numero} ya fue asignado a ${nombreEquipo} en esta subcategoria. Ingresa un numero diferente.`,
  )
}

function manejarErrorUnicidadSorteo(error) {
  if (error?.code !== '23505') return null

  if (error.message?.includes('numero_bola')) {
    return new Error(
      'Ese numero de bola ya esta asignado a otro equipo en esta subcategoria.',
    )
  }

  if (error.message?.includes('equipo_id')) {
    return new Error(
      'Este equipo ya tiene un numero de bola asignado en esta subcategoria.',
    )
  }

  return null
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
      throw new Error('No se pudieron cargar los equipos del bracket.')
    }

    return new Map((data || []).map((equipo) => [equipo.id, equipo]))
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos del bracket.')
  }
}

async function listarResultadosPorEnfrentamientos(idsEnfrentamientos) {
  try {
    const ids = idsEnfrentamientos.slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('resultados')
      .select('id, enfrentamiento_id, goles_a, goles_b, fecha')
      .in('enfrentamiento_id', ids)
      .order('fecha', { ascending: false })
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los resultados del bracket.')
    }

    const resultados = new Map()

    ;(data || []).forEach((resultado) => {
      if (!resultados.has(resultado.enfrentamiento_id)) {
        resultados.set(resultado.enfrentamiento_id, resultado)
      }
    })

    return resultados
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los resultados del bracket.')
  }
}

function adjuntarDatosBracket(enfrentamientos, equiposPorId, resultadosPorId, bolasPorEquipo) {
  return enfrentamientos.map((enfrentamiento) => ({
    ...enfrentamiento,
    equipo_a: equiposPorId.get(enfrentamiento.equipo_a_id) || null,
    equipo_b: equiposPorId.get(enfrentamiento.equipo_b_id) || null,
    resultado: resultadosPorId.get(enfrentamiento.id) || null,
    bola_a: bolasPorEquipo.get(enfrentamiento.equipo_a_id) || null,
    bola_b: bolasPorEquipo.get(enfrentamiento.equipo_b_id) || null,
  }))
}

export async function listarBracketPorSubcategoria(subcategoriaId) {
  try {
    const [respuestaEnfrentamientos, sorteo] = await Promise.all([
      supabase
        .from('enfrentamientos')
        .select(seleccionEnfrentamientos)
        .eq('subcategoria_id', subcategoriaId)
        .order('orden', { ascending: true })
        .limit(500),
      obtenerSorteoPorSubcategoria(subcategoriaId),
    ])

    if (respuestaEnfrentamientos.error) {
      throw new Error('No se pudo cargar la llave del torneo.')
    }

    const enfrentamientos = respuestaEnfrentamientos.data || []
    const idsEquipos = enfrentamientos.flatMap((enfrentamiento) => [
      enfrentamiento.equipo_a_id,
      enfrentamiento.equipo_b_id,
      enfrentamiento.ganador_id,
    ])
    const bolasPorEquipo = new Map(
      sorteo
        .filter((asignacion) => asignacion.equipo_id)
        .map((asignacion) => [asignacion.equipo_id, asignacion.numero_bola]),
    )

    const [equiposPorId, resultadosPorId] = await Promise.all([
      listarEquiposPorIds(idsEquipos),
      listarResultadosPorEnfrentamientos(enfrentamientos.map((enfrentamiento) => enfrentamiento.id)),
    ])

    return adjuntarDatosBracket(enfrentamientos, equiposPorId, resultadosPorId, bolasPorEquipo)
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar la llave del torneo.')
  }
}

function validarAsignaciones(asignaciones) {
  if (asignaciones.length < 1) {
    throw new Error('Se necesita al menos 1 equipo aprobado.')
  }

  if (asignaciones.length > MAX_EQUIPOS_POR_SUBCATEGORIA) {
    throw new Error('El sistema soporta hasta 64 equipos por subcategoría')
  }

  if (asignaciones.length !== 1 && asignaciones.length < MIN_EQUIPOS_PARA_SORTEO) {
    throw new Error('Se necesitan al menos 4 equipos aprobados para realizar el sorteo.')
  }

  const numeros = asignaciones.map((asignacion) => Number(asignacion.numero_bola))
  const numerosUnicos = new Set(numeros)
  const tieneRangoValido = numeros.every(
    (numero) => numero >= 1 && numero <= asignaciones.length,
  )

  if (numerosUnicos.size !== asignaciones.length || !tieneRangoValido) {
    throw new Error('Asigna una bola unica para cada equipo.')
  }
}

function crearEnfrentamientoCampeonAutomatico(subcategoriaId, asignacion) {
  return {
    bye: true,
    equipo_a_id: asignacion.equipo_id,
    equipo_b_id: null,
    estado: 'finalizado',
    ganador_id: asignacion.equipo_id,
    orden: 1,
    ronda: 'final',
    subcategoria_id: subcategoriaId,
  }
}

function calcularSiguientePotenciaDeDos(cantidad) {
  let potencia = 1

  while (potencia < cantidad) {
    potencia *= 2
  }

  return potencia
}

function crearSlotsBracket(asignaciones, tamanoBracket) {
  const slotsEquipos = [...asignaciones]
    .sort((a, b) => Number(a.numero_bola) - Number(b.numero_bola))
    .map((asignacion) => ({
      equipo_id: asignacion.equipo_id,
      numero_bola: Number(asignacion.numero_bola),
      tipo: 'equipo',
    }))
  const cantidadByes = tamanoBracket - slotsEquipos.length
  const slotsBye = Array.from({ length: cantidadByes }).map((_, indice) => ({
    equipo_id: null,
    numero_bola: slotsEquipos.length + indice + 1,
    tipo: 'bye',
  }))

  return [...slotsEquipos, ...slotsBye]
}

function crearParticipanteDesdeAsignacion(asignacion) {
  return {
    equipo_id: asignacion.equipo_id,
  }
}

function crearParticipanteDesdeGanador(ordenPartido) {
  return {
    equipo_id: null,
    orden_partido_origen: ordenPartido,
  }
}

function crearEnfrentamientosDesdeParticipantes(subcategoriaId, participantes) {
  const ronda = obtenerNombreRonda(participantes.length)

  return Array.from({ length: participantes.length / 2 }).map((_, indice) => {
    const participanteA = participantes[indice * 2]
    const participanteB = participantes[indice * 2 + 1]
    const equipoA = participanteA?.equipo_id || null
    const equipoB = participanteB?.equipo_id || null

    return {
      bye: false,
      equipo_a_id: equipoA,
      equipo_b_id: equipoB,
      estado: 'pendiente',
      ganador_id: null,
      orden: indice + 1,
      ronda,
      subcategoria_id: subcategoriaId,
    }
  })
}

function crearBracketDesdeParticipantes(subcategoriaId, participantesIniciales) {
  const enfrentamientos = []
  let participantesActuales = participantesIniciales

  while (participantesActuales.length > 1) {
    const rondaActual = crearEnfrentamientosDesdeParticipantes(
      subcategoriaId,
      participantesActuales,
    )

    enfrentamientos.push(...rondaActual)
    participantesActuales = rondaActual.map((partido) =>
      crearParticipanteDesdeGanador(partido.orden),
    )
  }

  return enfrentamientos
}

function crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones) {
  const tamanoBracket = calcularSiguientePotenciaDeDos(asignaciones.length)
  const cantidadByes = tamanoBracket - asignaciones.length
  const slots = crearSlotsBracket(asignaciones, tamanoBracket).filter((slot) => slot.tipo === 'equipo')

  if (!cantidadByes) {
    return crearEnfrentamientosDesdeParticipantes(
      subcategoriaId,
      slots.map(crearParticipanteDesdeAsignacion),
    )
  }

  const equiposConBye = slots.slice(0, cantidadByes)
  const equiposPrimeraRonda = slots.slice(cantidadByes)
  const enfrentamientosPrimeraRonda = crearEnfrentamientosDesdeParticipantes(
    subcategoriaId,
    equiposPrimeraRonda.map(crearParticipanteDesdeAsignacion),
  )
  const participantesSiguienteRonda = []
  const ganadoresPrimeraRonda = enfrentamientosPrimeraRonda.map((partido) =>
    crearParticipanteDesdeGanador(partido.orden),
  )
  const crucesConGanador = Math.min(cantidadByes, ganadoresPrimeraRonda.length)

  for (let indice = 0; indice < crucesConGanador; indice += 1) {
    participantesSiguienteRonda.push(crearParticipanteDesdeAsignacion(equiposConBye[indice]))
    participantesSiguienteRonda.push(ganadoresPrimeraRonda[indice])
  }

  for (let indice = crucesConGanador; indice < equiposConBye.length; indice += 1) {
    participantesSiguienteRonda.push(crearParticipanteDesdeAsignacion(equiposConBye[indice]))
  }

  for (let indice = crucesConGanador; indice < ganadoresPrimeraRonda.length; indice += 1) {
    participantesSiguienteRonda.push(ganadoresPrimeraRonda[indice])
  }

  const enfrentamientosSiguienteRonda = crearEnfrentamientosDesdeParticipantes(
    subcategoriaId,
    participantesSiguienteRonda,
  )

  return [...enfrentamientosPrimeraRonda, ...enfrentamientosSiguienteRonda]
}

export async function guardarSorteoYGenerarCuartos({
  asignaciones,
  registradoPor,
  subcategoriaId,
}) {
  try {
    validarAsignaciones(asignaciones)

    const sorteoExistente = await obtenerSorteoPorSubcategoria(subcategoriaId)

    if (sorteoExistente.length) {
      throw new Error('Ya existe un sorteo registrado para esta subcategoria.')
    }

    const filasSorteo = asignaciones.map((asignacion) => ({
      equipo_id: asignacion.equipo_id,
      fecha: new Date().toISOString(),
      numero_bola: Number(asignacion.numero_bola),
      registrado_por: registradoPor,
      subcategoria_id: subcategoriaId,
    }))

    const { error: errorSorteo } = await supabase.from('sorteo').insert(filasSorteo)

    if (errorSorteo) {
      throw (
        manejarErrorUnicidadSorteo(errorSorteo) ||
        new Error('No se pudo guardar el sorteo.')
      )
    }

    const enfrentamientos = asignaciones.length === 1
      ? [crearEnfrentamientoCampeonAutomatico(subcategoriaId, asignaciones[0])]
      : crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones)
    const { error: errorEnfrentamientos } = await supabase
      .from('enfrentamientos')
      .insert(enfrentamientos)

    if (errorEnfrentamientos) {
      throw new Error('El sorteo se guardo, pero no se pudieron generar los enfrentamientos.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo guardar el sorteo.')
  }
}

async function listarEquiposPorSubcategoria(subcategoriaId) {
  try {
    const { data, error } = await supabase
      .from('equipos')
      .select(seleccionEquiposAprobados + ', estado_homologacion')
      .eq('subcategoria_id', subcategoriaId)
      .limit(500)

    if (error) {
      throw new Error('No se pudieron cargar los equipos de la subcategoria.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudieron cargar los equipos de la subcategoria.')
  }
}

async function obtenerEnfrentamientosPorSubcategoria(subcategoriaId) {
  try {
    const { data, error } = await supabase
      .from('enfrentamientos')
      .select('id')
      .eq('subcategoria_id', subcategoriaId)
      .limit(1)

    if (error) {
      throw new Error('No se pudo verificar si ya existe un bracket.')
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudo verificar si ya existe un bracket.')
  }
}

async function generarEnfrentamientosPresencialesSiCompleto(subcategoriaId) {
  const [equiposSubcategoria, sorteoActual, enfrentamientosActuales] = await Promise.all([
    listarEquiposPorSubcategoria(subcategoriaId),
    obtenerSorteoPorSubcategoria(subcategoriaId),
    obtenerEnfrentamientosPorSubcategoria(subcategoriaId),
  ])

  if (enfrentamientosActuales.length) return

  const todosAprobados =
    equiposSubcategoria.length > 0 &&
    equiposSubcategoria.every((equipo) => equipo.estado_homologacion === 'aprobado')

  if (!todosAprobados) return

  const bolasPorEquipo = new Map(
    sorteoActual.map((asignacion) => [asignacion.equipo_id, asignacion]),
  )
  const todosConBola = equiposSubcategoria.every((equipo) => bolasPorEquipo.has(equipo.id))

  if (!todosConBola) return

  const asignaciones = equiposSubcategoria
    .map((equipo) => bolasPorEquipo.get(equipo.id))
    .sort((a, b) => Number(a.numero_bola) - Number(b.numero_bola))
    .map((asignacion) => ({
      equipo_id: asignacion.equipo_id,
      numero_bola: Number(asignacion.numero_bola),
    }))
  const enfrentamientos = asignaciones.length === 1
    ? [crearEnfrentamientoCampeonAutomatico(subcategoriaId, asignaciones[0])]
    : crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones)
  const { error } = await supabase.from('enfrentamientos').insert(enfrentamientos)

  if (error) {
    throw new Error('No se pudo generar el bracket del sorteo presencial.')
  }
}

export async function validarNumeroBolaPresencial({
  equipo,
  numeroBola,
}) {
  try {
    const numero = Number(numeroBola)

    if (!Number.isInteger(numero) || numero < 1) {
      throw new Error('Ingresa un numero de bola valido.')
    }

    const duplicados = await buscarNumeroBolaDuplicado(
      equipo.subcategoria_id,
      numero,
      equipo.id,
    )
    const bolaDuplicada = duplicados[0]

    if (bolaDuplicada) {
      const nombreEquipo = bolaDuplicada.equipos?.nombre_equipo || 'otro equipo'
      throw crearErrorNumeroBolaDuplicado(numero, nombreEquipo)
    }

    const { data: bolaExistente, error: errorExistente } = await supabase
      .from('sorteo')
      .select('id')
      .eq('subcategoria_id', equipo.subcategoria_id)
      .eq('equipo_id', equipo.id)
      .limit(1)
      .maybeSingle()

    if (errorExistente) {
      throw new Error('No se pudo verificar el numero de bola del equipo.')
    }

    if (bolaExistente) {
      throw new Error('Este equipo ya tiene un numero de bola asignado.')
    }

    return numero
  } catch (error) {
    throw new Error(error.message || 'No se pudo validar el numero de bola.')
  }
}

export async function registrarNumeroBolaPresencial({
  equipo,
  numeroBola,
  registradoPor,
}) {
  try {
    const numero = await validarNumeroBolaPresencial({ equipo, numeroBola })

    const { error: errorSorteo } = await supabase.from('sorteo').insert({
      equipo_id: equipo.id,
      fecha: new Date().toISOString(),
      numero_bola: numero,
      registrado_por: registradoPor,
      subcategoria_id: equipo.subcategoria_id,
    })

    if (errorSorteo) {
      throw (
        manejarErrorUnicidadSorteo(errorSorteo) ||
        new Error('No se pudo registrar el numero de bola.')
      )
    }

    await generarEnfrentamientosPresencialesSiCompleto(equipo.subcategoria_id)
  } catch (error) {
    throw new Error(error.message || 'No se pudo registrar el sorteo presencial.')
  }
}

export function obtenerNombreRonda(tamanoBracket) {
  const nombreRonda = {
    64: 'treintaidosavos',
    32: 'dieciseisavos',
    16: 'octavos',
    8: 'cuartos',
    4: 'semifinal',
    2: 'final',
  }

  return nombreRonda[tamanoBracket] || `ronda_${Math.log2(tamanoBracket)}`
}

export { MAX_EQUIPOS_POR_SUBCATEGORIA, MIN_EQUIPOS_PARA_SORTEO }
