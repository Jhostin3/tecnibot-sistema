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
          equipos_aprobados: equiposAprobados.length,
          lista: equiposAprobados.length >= 2 && !sorteoActual.length,
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

async function listarEquiposPorIds(idsEquipos) {
  try {
    const ids = Array.from(new Set(idsEquipos.filter(Boolean))).slice(0, 500)

    if (!ids.length) return new Map()

    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre_equipo')
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
  if (asignaciones.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos aprobados para sortear.')
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

function calcularSiguientePotenciaDeDos(cantidad) {
  let potencia = 1

  while (potencia < cantidad) {
    potencia *= 2
  }

  return potencia
}

function obtenerRondaInicial(tamanoBracket) {
  const rondas = {
    2: 'final',
    4: 'semifinal',
    8: 'cuartos',
    16: 'octavos',
    32: 'dieciseisavos',
    64: 'treintaidosavos',
  }

  return rondas[tamanoBracket] || `ronda_${Math.log2(tamanoBracket)}`
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

function crearParejasIniciales(slots, cantidadByes) {
  if (!cantidadByes) {
    return Array.from({ length: slots.length / 2 }).map((_, indice) => [
      slots[indice * 2],
      slots[indice * 2 + 1],
    ])
  }

  return Array.from({ length: slots.length / 2 }).map((_, indice) => [
    slots[indice],
    slots[slots.length - 1 - indice],
  ])
}

function crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones) {
  const tamanoBracket = calcularSiguientePotenciaDeDos(asignaciones.length)
  const cantidadByes = tamanoBracket - asignaciones.length
  const rondaInicial = obtenerRondaInicial(tamanoBracket)
  const slots = crearSlotsBracket(asignaciones, tamanoBracket)

  return crearParejasIniciales(slots, cantidadByes).map(([slotA, slotB], indice) => {
    const equipoA = slotA.equipo_id
    const equipoB = slotB.equipo_id
    const tieneBye = !equipoA || !equipoB
    const equipoGanador = tieneBye ? equipoA || equipoB : null

    return {
      bye: tieneBye,
      equipo_a_id: equipoGanador || equipoA,
      equipo_b_id: tieneBye ? null : equipoB,
      estado: tieneBye ? 'finalizado' : 'pendiente',
      ganador_id: equipoGanador,
      orden: indice + 1,
      ronda: rondaInicial,
      subcategoria_id: subcategoriaId,
    }
  })
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
      throw new Error('No se pudo guardar el sorteo.')
    }

    const enfrentamientos = crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones)
    const { error: errorEnfrentamientos } = await supabase
      .from('enfrentamientos')
      .insert(enfrentamientos)

    if (errorEnfrentamientos) {
      throw new Error('El sorteo se guardo, pero no se pudieron generar los cuartos.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo guardar el sorteo.')
  }
}
