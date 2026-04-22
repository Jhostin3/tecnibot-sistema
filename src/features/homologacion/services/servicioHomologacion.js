import { supabase } from '../../../lib/supabaseCliente'
import {
  validarNumeroBolaPresencial,
  registrarNumeroBolaPresencial,
} from '../../sorteo/services/servicioSorteo'

const seleccionEquipos = `
  id,
  nombre_equipo,
  nombre_robot,
  representante,
  institucion,
  subcategoria_id,
  estado_homologacion,
  observaciones,
  created_at,
  subcategorias(nombre, categoria_id, categorias(nombre))
`

const seleccionHomologaciones = `
  id,
  equipo_id,
  homologador_id,
  estado,
  observacion,
  fecha,
  homologador:perfiles(nombre)
`

function unirUltimasHomologaciones(equipos = [], homologaciones = []) {
  const ultimasPorEquipo = new Map()

  homologaciones.forEach((homologacion) => {
    if (!ultimasPorEquipo.has(homologacion.equipo_id)) {
      ultimasPorEquipo.set(homologacion.equipo_id, homologacion)
    }
  })

  return equipos.map((equipo) => ({
    ...equipo,
    ultima_homologacion: ultimasPorEquipo.get(equipo.id) || null,
  }))
}

export async function listarEquiposParaHomologacion() {
  try {
    const [respuestaEquipos, respuestaHomologaciones] = await Promise.all([
      supabase
        .from('equipos')
        .select(seleccionEquipos)
        .order('created_at', { ascending: false })
        .order('nombre_equipo', { ascending: true })
        .limit(500),
      supabase
        .from('homologaciones')
        .select(seleccionHomologaciones)
        .order('fecha', { ascending: false })
        .limit(500),
    ])

    if (respuestaEquipos.error) {
      throw new Error('No se pudieron cargar los equipos para homologacion.')
    }

    if (respuestaHomologaciones.error) {
      throw new Error('No se pudo cargar el historial de homologaciones.')
    }

    return unirUltimasHomologaciones(
      respuestaEquipos.data || [],
      respuestaHomologaciones.data || [],
    )
  } catch (error) {
    throw new Error(error.message || 'No se pudo cargar la homologacion.')
  }
}

export async function listarSubcategoriasHomologacion() {
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

export async function validarNumeroBola(subcategoriaId, numeroBola, equipoId) {
  try {
    const { data, error } = await supabase
      .from('sorteo')
      .select('id, equipo_id, equipos(nombre_equipo)')
      .eq('subcategoria_id', subcategoriaId)
      .eq('numero_bola', numeroBola)
      .neq('equipo_id', equipoId)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    throw new Error(error.message || 'No se pudo validar el numero de bola.')
  }
}

export async function verificarDisponibilidadNumeroBola({ equipo, numeroBola }) {
  const numero = Number(numeroBola)

  if (!Number.isInteger(numero) || numero < 1) {
    throw new Error('Ingresa un numero entero positivo.')
  }

  const duplicados = await validarNumeroBola(equipo.subcategoria_id, numero, equipo.id)
  const duplicado = duplicados[0]

  if (duplicado) {
    const nombreEquipo = duplicado.equipos?.nombre_equipo || 'otro equipo'

    return {
      disponible: false,
      mensaje: `El numero ${numero} ya fue asignado a ${nombreEquipo} en esta subcategoria. Ingresa un numero diferente.`,
      nombreEquipo,
    }
  }

  return {
    disponible: true,
    mensaje: 'Numero disponible',
    nombreEquipo: '',
  }
}

export async function registrarCambioHomologacion({
  equipo,
  equipoId,
  estado,
  homologadorId,
  numeroBola,
  observacion,
}) {
  try {
    const observacionLimpia = observacion?.trim() || null
    const idEquipo = equipo?.id || equipoId

    if (estado === 'aprobado' && equipo && numeroBola) {
      const validacion = await verificarDisponibilidadNumeroBola({ equipo, numeroBola })

      if (!validacion.disponible) {
        throw new Error(validacion.mensaje)
      }

      await validarNumeroBolaPresencial({ equipo, numeroBola })
    }

    const { error: errorHomologacion } = await supabase
      .from('homologaciones')
      .insert({
        equipo_id: idEquipo,
        estado,
        homologador_id: homologadorId,
        observacion: observacionLimpia,
      })

    if (errorHomologacion) {
      throw new Error('No se pudo registrar la homologacion.')
    }

    const { error: errorEquipo } = await supabase
      .from('equipos')
      .update({
        estado_homologacion: estado,
        observaciones: observacionLimpia,
      })
      .eq('id', idEquipo)

    if (errorEquipo) {
      throw new Error('No se pudo actualizar el estado del equipo.')
    }

    if (estado === 'aprobado' && equipo && numeroBola) {
      await registrarNumeroBolaPresencial({
        equipo,
        numeroBola,
        registradoPor: homologadorId,
      })
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo registrar el cambio de homologacion.')
  }
}
