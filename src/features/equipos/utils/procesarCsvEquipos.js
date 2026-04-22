import Papa from 'papaparse'

import { normalizarTexto } from './normalizarTexto.js'

const formatoCsv = {
  anterior: 'anterior',
  oficial: 'oficial',
}

const estadoFila = {
  categoriaNoEncontrada: 'categoria-no-encontrada',
  error: 'error',
  valida: 'valida',
}

const columnasOficiales = {
  categoria: 'Categoría en la que Participará:',
  correo: 'Nombre de usuario',
  institucion: 'Nombre de la Institución:',
  nivel: 'Nivel del Robot',
  nombreRobot: 'Nombre del Robot',
  representante: 'Nombre del Responsable/Coordinador',
}

function crearClaveCategoriaNivel(categoria, nivel) {
  return `${normalizarTexto(categoria)}::${normalizarTexto(nivel)}`
}

function crearClaveDuplicado(nombreRobot, subcategoriaId) {
  return `${normalizarTexto(nombreRobot)}::${subcategoriaId}`
}

function obtenerNombreCategoria(subcategoria) {
  return subcategoria.categorias?.nombre || subcategoria.categoria?.nombre || ''
}

function crearIndicesSubcategorias(subcategorias) {
  const porNombre = new Map()
  const porCategoriaNivel = new Map()

  subcategorias.forEach((subcategoria) => {
    porNombre.set(normalizarTexto(subcategoria.nombre), subcategoria.id)

    const categoria = obtenerNombreCategoria(subcategoria)

    if (categoria) {
      porCategoriaNivel.set(
        crearClaveCategoriaNivel(categoria, subcategoria.nombre),
        subcategoria.id,
      )
    }
  })

  return { porCategoriaNivel, porNombre }
}

function filaVacia(fila) {
  return Object.values(fila).every((valor) => !String(valor || '').trim())
}

function obtenerFormatoCsv(meta) {
  const campos = new Set((meta.fields || []).map((campo) => String(campo || '').trim()))

  if (campos.has('nombre_equipo')) return formatoCsv.anterior
  if (campos.has(columnasOficiales.nombreRobot)) return formatoCsv.oficial

  return null
}

function crearFilaAnterior(fila) {
  return {
    categoria: '',
    correo: String(fila.correo || '').trim(),
    institucion: String(fila.institucion || '').trim(),
    nombre_equipo: String(fila.nombre_equipo || '').trim(),
    nombre_robot: String(fila.nombre_robot || '').trim(),
    representante: String(fila.representante || '').trim(),
    subcategoria: String(fila.subcategoria || '').trim(),
  }
}

function crearFilaOficial(fila) {
  const nombreRobot = String(fila[columnasOficiales.nombreRobot] || '').trim()

  return {
    categoria: String(fila[columnasOficiales.categoria] || '').trim(),
    correo: String(fila[columnasOficiales.correo] || '').trim(),
    institucion: String(fila[columnasOficiales.institucion] || '').trim(),
    nombre_equipo: nombreRobot,
    nombre_robot: nombreRobot,
    representante: String(fila[columnasOficiales.representante] || '').trim(),
    subcategoria: String(fila[columnasOficiales.nivel] || '').trim(),
  }
}

function obtenerIdSubcategoria(filaNormalizada, indicesSubcategorias, formato) {
  if (formato === formatoCsv.oficial) {
    return indicesSubcategorias.porCategoriaNivel.get(
      crearClaveCategoriaNivel(filaNormalizada.categoria, filaNormalizada.subcategoria),
    )
  }

  return indicesSubcategorias.porNombre.get(normalizarTexto(filaNormalizada.subcategoria))
}

function obtenerNombreRobotDuplicado(filaNormalizada) {
  return filaNormalizada.nombre_robot || filaNormalizada.nombre_equipo
}

function validarFila(
  filaNormalizada,
  subcategoriaId,
  clavesDuplicadas,
  formato,
) {
  const errores = []
  const advertencias = []
  const nombreRobotDuplicado = obtenerNombreRobotDuplicado(filaNormalizada)

  if (!filaNormalizada.nombre_equipo) errores.push('El nombre del equipo es requerido.')
  if (!filaNormalizada.nombre_robot && formato === formatoCsv.oficial) {
    errores.push('El nombre del robot es requerido.')
  }
  if (!filaNormalizada.representante) errores.push('El representante es requerido.')
  if (!filaNormalizada.institucion) errores.push('La institucion es requerida.')
  if (!filaNormalizada.categoria && formato === formatoCsv.oficial) {
    errores.push('La categoria es requerida.')
  }
  if (!filaNormalizada.subcategoria) errores.push('La subcategoria es requerida.')

  if (
    formato === formatoCsv.oficial &&
    filaNormalizada.categoria &&
    filaNormalizada.subcategoria &&
    !subcategoriaId
  ) {
    advertencias.push(
      `Categoria no encontrada: ${filaNormalizada.categoria} / ${filaNormalizada.subcategoria}`,
    )
  }

  if (formato === formatoCsv.anterior && filaNormalizada.subcategoria && !subcategoriaId) {
    errores.push('La subcategoria no existe.')
  }

  if (nombreRobotDuplicado && subcategoriaId) {
    const claveDuplicado = crearClaveDuplicado(nombreRobotDuplicado, subcategoriaId)

    if (clavesDuplicadas.has(claveDuplicado)) {
      errores.push('Duplicado: mismo robot en la misma categoria')
    }

    clavesDuplicadas.add(claveDuplicado)
  }

  return { advertencias, errores }
}

function transformarFila(filaNormalizada, subcategoriaId) {
  return {
    correo: filaNormalizada.correo || null,
    estado_homologacion: 'pendiente',
    estado_inscripcion: 'pendiente',
    institucion: filaNormalizada.institucion,
    nombre_equipo: filaNormalizada.nombre_equipo,
    nombre_robot: filaNormalizada.nombre_robot || null,
    observaciones: null,
    representante: filaNormalizada.representante,
    subcategoria_id: subcategoriaId,
  }
}

function resolverEstadoFila(errores, advertencias) {
  if (errores.length) return estadoFila.error
  if (advertencias.length) return estadoFila.categoriaNoEncontrada

  return estadoFila.valida
}

export function procesarCsvEquipos(archivo, subcategorias) {
  return new Promise((resolve, reject) => {
    Papa.parse(archivo, {
      complete: ({ data, errors, meta }) => {
        if (errors.length) {
          reject(new Error('El archivo CSV tiene un formato invalido.'))
          return
        }

        const formato = obtenerFormatoCsv(meta)

        if (!formato) {
          reject(
            new Error(
              'El CSV no coincide con el formato anterior ni con el formato oficial de Google Forms.',
            ),
          )
          return
        }

        const indicesSubcategorias = crearIndicesSubcategorias(subcategorias)
        const clavesDuplicadas = new Set()
        const normalizarFila =
          formato === formatoCsv.oficial ? crearFilaOficial : crearFilaAnterior

        const filas = data.filter((fila) => !filaVacia(fila)).map((fila, indice) => {
          const filaNormalizada = normalizarFila(fila)
          const subcategoriaId = obtenerIdSubcategoria(
            filaNormalizada,
            indicesSubcategorias,
            formato,
          )
          const { advertencias, errores } = validarFila(
            filaNormalizada,
            subcategoriaId,
            clavesDuplicadas,
            formato,
          )
          const estado = resolverEstadoFila(errores, advertencias)
          const importable = estado === estadoFila.valida

          return {
            advertencias,
            datos: importable ? transformarFila(filaNormalizada, subcategoriaId) : null,
            errores,
            estado,
            fila: indice + 2,
            formato,
            original: filaNormalizada,
          }
        })

        resolve(filas)
      },
      error: () => reject(new Error('No se pudo leer el archivo CSV.')),
      header: true,
      skipEmptyLines: true,
      transform: (valor) => String(valor || '').trim(),
      transformHeader: (encabezado) => String(encabezado || '').trim(),
    })
  })
}
