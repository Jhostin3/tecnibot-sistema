import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  listarEquiposParaHomologacion,
  listarSubcategoriasHomologacion,
  registrarCambioHomologacion,
} from '../services/servicioHomologacion'

export const estadosHomologacion = [
  { etiqueta: 'Pendiente', valor: 'pendiente' },
  { etiqueta: 'En revision', valor: 'en_revision' },
  { etiqueta: 'Aprobado', valor: 'aprobado' },
  { etiqueta: 'Rechazado', valor: 'rechazado' },
]

export function obtenerEtiquetaEstadoHomologacion(estado) {
  return estadosHomologacion.find((opcion) => opcion.valor === estado)?.etiqueta || estado
}

export function useHomologaciones() {
  const { perfil } = useAutenticacion()
  const [equipos, setEquipos] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [filtros, setFiltros] = useState({
    estado: '',
    subcategoriaId: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError(null)
    setMensaje('')

    try {
      const [equiposActuales, subcategoriasActuales] = await Promise.all([
        listarEquiposParaHomologacion(),
        listarSubcategoriasHomologacion(),
      ])

      setEquipos(equiposActuales)
      setSubcategorias(subcategoriasActuales)
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function cargarDatosIniciales() {
      setCargando(true)
      setError(null)

      try {
        const [equiposActuales, subcategoriasActuales] = await Promise.all([
          listarEquiposParaHomologacion(),
          listarSubcategoriasHomologacion(),
        ])

        if (!componenteActivo) return

        setEquipos(equiposActuales)
        setSubcategorias(subcategoriasActuales)
      } catch (error) {
        if (componenteActivo) {
          setError(error.message)
          setMensaje(error.message)
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarDatosIniciales()

    return () => {
      componenteActivo = false
    }
  }, [])

  const equiposFiltrados = useMemo(
    () =>
      equipos.filter((equipo) => {
        const coincideEstado = filtros.estado
          ? equipo.estado_homologacion === filtros.estado
          : true
        const coincideSubcategoria = filtros.subcategoriaId
          ? equipo.subcategoria_id === filtros.subcategoriaId
          : true

        return coincideEstado && coincideSubcategoria
      }),
    [equipos, filtros],
  )

  function actualizarFiltro(nombre, valor) {
    setFiltros((actuales) => ({
      ...actuales,
      [nombre]: valor,
    }))
  }

  async function cambiarEstadoHomologacion({
    equipo,
    equipoId,
    estado,
    numeroBola,
    observacion,
  }) {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al homologador actual.')
      return
    }

    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await registrarCambioHomologacion({
        equipo,
        equipoId,
        estado,
        homologadorId: perfil.id,
        numeroBola,
        observacion,
      })
      await cargarDatos()
      setMensaje('Estado de homologacion actualizado correctamente.')
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    actualizarFiltro,
    cambiarEstadoHomologacion,
    cargando,
    equipos: equiposFiltrados,
    estados: estadosHomologacion,
    error,
    filtros,
    guardando,
    mensaje,
    recargar: cargarDatos,
    setMensaje,
    subcategorias,
    totalEquipos: equipos.length,
  }
}
