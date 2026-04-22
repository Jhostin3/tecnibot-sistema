import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabaseCliente'
import { listarSubcategorias } from '../equipos/services/servicioSubcategorias'
import {
  activarEnfrentamiento,
  activarRondaCompleta,
  desactivarEnfrentamiento,
  listarEnfrentamientosFinalizados,
  listarEnfrentamientosPorEstado,
} from './servicioOrganizador'

export function usePartidos() {
  const [pendientes, setPendientes] = useState([])
  const [activos, setActivos] = useState([])
  const [finalizados, setFinalizados] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarPartidos = useCallback(async ({ mostrarCarga = true } = {}) => {
    if (mostrarCarga) {
      setCargando(true)
    }

    setError(null)

    try {
      const [partidosPendientes, partidosActivos, partidosFinalizados, subcategoriasActuales] =
        await Promise.all([
          listarEnfrentamientosPorEstado('pendiente'),
          listarEnfrentamientosPorEstado('activo'),
          listarEnfrentamientosFinalizados(),
          listarSubcategorias(),
        ])

      setPendientes(partidosPendientes)
      setActivos(partidosActivos)
      setFinalizados(partidosFinalizados)
      setSubcategorias(subcategoriasActuales)
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
    } finally {
      if (mostrarCarga) {
        setCargando(false)
      }
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function cargarInicial() {
      setCargando(true)
      setError(null)

      try {
        const [partidosPendientes, partidosActivos, partidosFinalizados, subcategoriasActuales] =
          await Promise.all([
            listarEnfrentamientosPorEstado('pendiente'),
            listarEnfrentamientosPorEstado('activo'),
            listarEnfrentamientosFinalizados(),
            listarSubcategorias(),
          ])

        if (componenteActivo) {
          setPendientes(partidosPendientes)
          setActivos(partidosActivos)
          setFinalizados(partidosFinalizados)
          setSubcategorias(subcategoriasActuales)
        }
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

    cargarInicial()

    const canal = supabase
      .channel('partidos-organizador')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enfrentamientos' },
        () => {
          if (componenteActivo) {
            cargarPartidos({ mostrarCarga: false })
          }
        },
      )
      .subscribe()

    return () => {
      componenteActivo = false
      supabase.removeChannel(canal)
    }
  }, [cargarPartidos])

  async function activarPartido(partidoId, cancha) {
    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await activarEnfrentamiento(partidoId, cancha)
      await cargarPartidos({ mostrarCarga: false })
      setMensaje('Partido activado correctamente.')
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  async function activarRonda(enfrentamientos) {
    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await activarRondaCompleta(enfrentamientos)
      await cargarPartidos({ mostrarCarga: false })
      setMensaje('Ronda activada correctamente.')
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  async function desactivarPartido(partidoId) {
    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await desactivarEnfrentamiento(partidoId)
      await cargarPartidos({ mostrarCarga: false })
      setMensaje('Partido desactivado correctamente.')
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    activarPartido,
    activarRonda,
    activos,
    cargando,
    desactivarPartido,
    error,
    finalizados,
    guardando,
    mensaje,
    pendientes,
    recargar: cargarPartidos,
    setMensaje,
    subcategorias,
  }
}
