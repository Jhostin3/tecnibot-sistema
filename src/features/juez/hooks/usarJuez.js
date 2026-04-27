import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '../../../lib/supabaseCliente'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  listarPanelJuez,
  registrarResultadoPartido,
} from '../services/servicioJuez'

// Nota para desarrollo:
// Habilita Realtime manualmente en Supabase Dashboard -> Table Editor -> enfrentamientos -> Enable Realtime.

const CUENTA_REGRESIVA_INICIAL = 5

function construirEstadoInicial() {
  return {
    cargando: true,
    claveRondaActiva: null,
    claveRondaPendiente: null,
    error: null,
    estadoVista: 'sin_partidos',
    partidos: [],
    partidosPendientes: [],
  }
}

export function useJuez() {
  const { perfil } = useAutenticacion()
  const [estadoPanel, setEstadoPanel] = useState(construirEstadoInicial)
  const [partidoFinalizado, setPartidoFinalizado] = useState(null)
  const [realtimeActivo, setRealtimeActivo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cuentaRegresiva, setCuentaRegresiva] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const ultimaRondaActivaRef = useRef(null)
  const preparandoSiguienteRondaRef = useRef(false)

  const cargarPartidos = useCallback(async ({ mostrarCarga = true } = {}) => {
    if (mostrarCarga) {
      setEstadoPanel((actual) => ({
        ...actual,
        cargando: true,
      }))
    }

    setEstadoPanel((actual) => ({
      ...actual,
      error: null,
    }))

    try {
      const panel = await listarPanelJuez()
      const hayActivos = panel.partidosActivos.length > 0
      const hayPendientes = panel.partidosPendientes.length > 0
      let estadoVista = 'sin_partidos'

      if (hayActivos) {
        estadoVista = 'ronda_activa'
        ultimaRondaActivaRef.current = panel.claveActiva
        preparandoSiguienteRondaRef.current = false
        setCuentaRegresiva(0)
        setMensaje('')
      } else if (hayPendientes) {
        estadoVista = preparandoSiguienteRondaRef.current
          ? 'preparando_siguiente_ronda'
          : 'esperando_torneo'
      }

      setEstadoPanel({
        cargando: false,
        claveRondaActiva: panel.claveActiva,
        claveRondaPendiente: panel.clavePendiente,
        error: null,
        estadoVista,
        partidos: panel.partidosActivos,
        partidosPendientes: panel.partidosPendientes,
      })
    } catch (error) {
      setEstadoPanel((actual) => ({
        ...actual,
        cargando: false,
        error: error.message,
      }))
      setMensaje(error.message)
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function cargarPartidosIniciales() {
      await cargarPartidos()
    }

    cargarPartidosIniciales()

    const canal = supabase
      .channel('tecnibot-juez-enfrentamientos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enfrentamientos' },
        async () => {
          if (!componenteActivo) return
          await cargarPartidos({ mostrarCarga: false })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resultados' },
        async () => {
          if (!componenteActivo) return
          await cargarPartidos({ mostrarCarga: false })
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

  useEffect(() => {
    const hayTransicionDeRonda =
      Boolean(ultimaRondaActivaRef.current) &&
      estadoPanel.partidos.length === 0 &&
      estadoPanel.partidosPendientes.length > 0

    if (hayTransicionDeRonda) {
      preparandoSiguienteRondaRef.current = true
      ultimaRondaActivaRef.current = null
      setCuentaRegresiva(CUENTA_REGRESIVA_INICIAL)
      setMensaje('Ronda completada. Preparando siguiente ronda...')
      setEstadoPanel((actual) => ({
        ...actual,
        estadoVista: 'preparando_siguiente_ronda',
      }))
      return
    }

    if (estadoPanel.partidos.length > 0) {
      preparandoSiguienteRondaRef.current = false
      setCuentaRegresiva(0)
    }
  }, [estadoPanel.partidos.length, estadoPanel.partidosPendientes.length])

  useEffect(() => {
    if (estadoPanel.estadoVista !== 'preparando_siguiente_ronda' || !cuentaRegresiva) {
      return undefined
    }

    const temporizador = window.setTimeout(async () => {
      if (cuentaRegresiva === 1) {
        preparandoSiguienteRondaRef.current = false
        setCuentaRegresiva(0)
        await cargarPartidos({ mostrarCarga: false })
        return
      }

      setCuentaRegresiva((actual) => actual - 1)
    }, 1000)

    return () => {
      window.clearTimeout(temporizador)
    }
  }, [cargarPartidos, cuentaRegresiva, estadoPanel.estadoVista])

  async function guardarResultado({ enfrentamiento, golesA, golesB, observacion }) {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al juez actual.')
      return null
    }

    setGuardando(true)
    setEstadoPanel((actual) => ({
      ...actual,
      error: null,
    }))
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
      setEstadoPanel((actual) => ({
        ...actual,
        error: error.message,
      }))
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  const rondaActual = estadoPanel.partidos.length
    ? estadoPanel.partidos[0]
    : estadoPanel.partidosPendientes[0] || null

  return {
    cargando: estadoPanel.cargando,
    cuentaRegresiva,
    error: estadoPanel.error,
    estadoVista: estadoPanel.estadoVista,
    guardarResultado,
    guardando,
    mensaje,
    partidoFinalizado,
    partidos: estadoPanel.partidos,
    partidosPendientes: estadoPanel.partidosPendientes,
    realtimeActivo,
    recargar: cargarPartidos,
    rondaActual,
    setMensaje,
    setPartidoFinalizado,
  }
}
