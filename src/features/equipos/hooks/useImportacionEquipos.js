import { useMemo, useState } from 'react'

import { importarEquipos } from '../services/servicioEquipos'
import { procesarCsvEquipos } from '../utils/procesarCsvEquipos'

export function useImportacionEquipos({ alFinalizar, subcategorias }) {
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [filas, setFilas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [resumen, setResumen] = useState(null)

  const filasValidas = useMemo(
    () => filas.filter((fila) => fila.estado === 'valida'),
    [filas],
  )

  function seleccionarArchivo(archivoSeleccionado) {
    setArchivo(archivoSeleccionado)
    setFilas([])
    setMensaje('')
    setResumen(null)
  }

  async function procesarArchivo() {
    if (!archivo) {
      setMensaje('Selecciona un archivo CSV.')
      return
    }

    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      setMensaje('Solo se permiten archivos CSV en esta etapa.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const filasProcesadas = await procesarCsvEquipos(archivo, subcategorias)
      setFilas(filasProcesadas)
      setResumen(null)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  async function confirmarImportacion() {
    if (!filasValidas.length) {
      setMensaje('No hay filas válidas para importar.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      await importarEquipos(filasValidas.map((fila) => fila.datos))
      setResumen({
        conError: filas.length - filasValidas.length,
        importadas: filasValidas.length,
      })
      setArchivo(null)
      setFilas([])
      await alFinalizar()
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return {
    archivo,
    cargando,
    confirmarImportacion,
    filas,
    filasValidas,
    mensaje,
    procesarArchivo,
    resumen,
    seleccionarArchivo,
  }
}
