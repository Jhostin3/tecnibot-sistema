import Papa from 'papaparse'

import { normalizarTexto } from './normalizarTexto'

function crearIndiceSubcategorias(subcategorias) {
  return new Map(
    subcategorias.map((subcategoria) => [
      normalizarTexto(subcategoria.nombre),
      subcategoria.id,
    ]),
  )
}

function filaVacia(fila) {
  return Object.values(fila).every((valor) => !String(valor || '').trim())
}

function validarFila(fila, indiceSubcategorias, nombresEnArchivo) {
  const errores = []
  const nombreEquipo = String(fila.nombre_equipo || '').trim()
  const representante = String(fila.representante || '').trim()
  const institucion = String(fila.institucion || '').trim()
  const subcategoria = String(fila.subcategoria || '').trim()
  const claveDuplicado = normalizarTexto(nombreEquipo)

  if (!nombreEquipo) errores.push('El nombre del equipo es requerido.')
  if (!representante) errores.push('El representante es requerido.')
  if (!institucion) errores.push('La institución es requerida.')
  if (!subcategoria) errores.push('La subcategoría es requerida.')
  if (nombreEquipo && nombresEnArchivo.has(claveDuplicado)) {
    errores.push('El nombre del equipo está duplicado en el archivo.')
  }
  if (nombreEquipo) nombresEnArchivo.add(claveDuplicado)
  if (subcategoria && !indiceSubcategorias.has(normalizarTexto(subcategoria))) {
    errores.push('La subcategoría no existe.')
  }

  return errores
}

function transformarFila(fila, indiceSubcategorias) {
  return {
    correo: String(fila.correo || '').trim() || null,
    estado_homologacion: 'pendiente',
    estado_inscripcion: 'pendiente',
    institucion: String(fila.institucion || '').trim(),
    nombre_equipo: String(fila.nombre_equipo || '').trim(),
    nombre_robot: String(fila.nombre_robot || '').trim() || null,
    observaciones: null,
    representante: String(fila.representante || '').trim(),
    subcategoria_id: indiceSubcategorias.get(normalizarTexto(fila.subcategoria)),
  }
}

export function procesarCsvEquipos(archivo, subcategorias) {
  return new Promise((resolve, reject) => {
    Papa.parse(archivo, {
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(new Error('El archivo CSV tiene un formato inválido.'))
          return
        }

        const indiceSubcategorias = crearIndiceSubcategorias(subcategorias)
        const nombresEnArchivo = new Set()

        const filas = data.filter((fila) => !filaVacia(fila)).map((fila, indice) => {
          const errores = validarFila(fila, indiceSubcategorias, nombresEnArchivo)

          return {
            datos: errores.length ? null : transformarFila(fila, indiceSubcategorias),
            errores,
            estado: errores.length ? 'error' : 'valida',
            fila: indice + 2,
            original: fila,
          }
        })

        resolve(filas)
      },
      error: () => reject(new Error('No se pudo leer el archivo CSV.')),
      header: true,
      skipEmptyLines: true,
    })
  })
}
