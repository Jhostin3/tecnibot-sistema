import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabaseCliente'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  listarPartidosActivos,
  registrarResultadoPartido,
} from '../services/servicioJuez'

// Nota para desarrollo:
// Habilita Realtime manualmente en Supabase Dashboard -> Table Editor -> enfrentamientos -> Enable Realtime.

export function useJuez() {
  const { perfil } = useAutenticacion()
  const [partidos, setPartidos] = useState([])
  const [partidoFinalizado, setPartidoFinalizado] = useState(null)
  const [realtimeActivo, setRealtimeActivo] = useState(false)
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
      const partidosActivos = await listarPartidosActivos()
      setPartidos(partidosActivos)
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

    async function cargarPartidosIniciales() {
      setCargando(true)
      setError(null)

      try {
        const partidosActivos = await listarPartidosActivos()

        if (componenteActivo) {
          setPartidos(partidosActivos)
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

    cargarPartidosIniciales()

    const canal = supabase
      .channel('tecnibot-enfrentamientos-juez')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enfrentamientos' },
        () => {
          if (componenteActivo) {
            cargarPartidos({ mostrarCarga: false })
          }
        },
      )
      .subscribe((estadoCanal) => {
        if (!componenteActivo) return

        setRealtimeActivo(estadoCanal === 'SUBSCRIBED')
      })

    return () => {
      componenteActivo = false
      setRealtimeActivo(false)
      supabase.removeChannel(canal)
    }
  }, [cargarPartidos])

  async function guardarResultado({ enfrentamiento, golesA, golesB, observacion }) {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al juez actual.')
      return null
    }

    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      const resultado = await registrarResultadoPartido({
        enfrentamiento,
        golesA,
        golesB,
        juezId: perfil.id,
        observacion,
      })
      setPartidoFinalizado({
        ...enfrentamiento,
        ...resultado,
        estado: 'finalizado',
        ganador_id: resultado.ganador_id,
        observacion,
      })
      setMensaje('Resultado registrado correctamente.')
      await cargarPartidos({ mostrarCarga: false })

      return resultado
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    cargando,
    error,
    guardarResultado,
    guardando,
    mensaje,
    partidoFinalizado,
    partidos,
    recargar: cargarPartidos,
    realtimeActivo,
    setMensaje,
    setPartidoFinalizado,
  }
}
