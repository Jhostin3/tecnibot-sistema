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

export async function listarSubcategoriasSorteo() {
  const { data, error } = await supabase
    .from('subcategorias')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar las subcategorias.')
  }

  return data
}

export async function listarSubcategoriasListasParaSorteo() {
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
        lista: equiposAprobados.length === 8 && !sorteoActual.length,
      }
    }),
  )

  return revisiones.filter((subcategoria) => subcategoria.lista)
}

export async function listarEquiposAprobadosPorSubcategoria(subcategoriaId) {
  const { data, error } = await supabase
    .from('equipos')
    .select(seleccionEquiposAprobados)
    .eq('subcategoria_id', subcategoriaId)
    .eq('estado_homologacion', 'aprobado')
    .order('nombre_equipo', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar los equipos aprobados.')
  }

  return data
}

export async function obtenerSorteoPorSubcategoria(subcategoriaId) {
  const { data, error } = await supabase
    .from('sorteo')
    .select(seleccionSorteo)
    .eq('subcategoria_id', subcategoriaId)
    .order('numero_bola', { ascending: true })

  if (error) {
    throw new Error('No se pudo verificar si ya existe un sorteo.')
  }

  return data
}

function validarAsignaciones(asignaciones) {
  const numeros = asignaciones.map((asignacion) => Number(asignacion.numero_bola))
  const numerosUnicos = new Set(numeros)
  const tieneRangoValido = numeros.every((numero) => numero >= 1 && numero <= 8)

  if (asignaciones.length !== 8 || numerosUnicos.size !== 8 || !tieneRangoValido) {
    throw new Error('Asigna una bola unica del 1 al 8 para cada equipo.')
  }
}

function crearEnfrentamientosDesdeBolas(subcategoriaId, asignaciones) {
  const equiposPorBola = new Map(
    asignaciones.map((asignacion) => [
      Number(asignacion.numero_bola),
      asignacion.equipo_id,
    ]),
  )

  return [
    [1, 1, 2],
    [2, 3, 4],
    [3, 5, 6],
    [4, 7, 8],
  ].map(([orden, bolaA, bolaB]) => ({
    bye: false,
    equipo_a_id: equiposPorBola.get(bolaA),
    equipo_b_id: equiposPorBola.get(bolaB),
    estado: 'pendiente',
    orden,
    ronda: 'cuartos',
    subcategoria_id: subcategoriaId,
  }))
}

export async function guardarSorteoYGenerarCuartos({
  asignaciones,
  registradoPor,
  subcategoriaId,
}) {
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
}
