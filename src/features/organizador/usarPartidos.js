import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '../../lib/supabaseCliente'
import { listarSubcategorias } from '../equipos/services/servicioSubcategorias'
import {
  activarEnfrentamiento,
  desactivarEnfrentamiento,
  iniciarTorneo,
  listarEnfrentamientosFinalizados,
  listarEnfrentamientosPorEstado,
  verificarYAvanzarRonda,
} from './servicioOrganizador'

const etiquetasRonda = {
  treintaidosavos: 'Treintaidosavos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final',
  tercer_lugar: 'Tercer lugar',
}

export function usePartidos(subcategoriaIdSeleccionada = '') {
  const [pendientes, setPendientes] = useState([])
  const [activos, setActivos] = useState([])
  const [finalizados, setFinalizados] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [contadorRegresivo, setContadorRegresivo] = useState(0)
  const [torneoFinalizado, setTorneoFinalizado] = useState(false)
  const [rondaActual, setRondaActual] = useState(null)
  const temporizadorAvanceRef = useRef(null)
  const temporizadorCuentaRef = useRef(null)
  const avanceEnProcesoRef = useRef(false)
  const ultimaRondaActivaRef = useRef(null)

  const limpiarTemporizadores = useCallback(() => {
    if (temporizadorAvanceRef.current) {
      window.clearTimeout(temporizadorAvanceRef.current)
      temporizadorAvanceRef.current = null
    }

    if (temporizadorCuentaRef.current) {
      window.clearInterval(temporizadorCuentaRef.current)
      temporizadorCuentaRef.current = null
    }

    setContadorRegresivo(0)
  }, [temporizadorAvanceRef, temporizadorCuentaRef])

  const filtrarPorSubcategoria = useCallback(
    (partidos = []) =>
      subcategoriaIdSeleccionada
        ? partidos.filter((partido) => partido.subcategoria_id === subcategoriaIdSeleccionada)
        : [],
    [subcategoriaIdSeleccionada],
  )

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

  const verificarRondaCompleta = useCallback(async ({
    activosActuales = activos,
    finalizadosActuales = finalizados,
    pendientesActuales = pendientes,
  } = {}) => {
    if (!subcategoriaIdSeleccionada) {
      limpiarTemporizadores()
      avanceEnProcesoRef.current = false
      ultimaRondaActivaRef.current = null
      setRondaActual(null)
      setTorneoFinalizado(false)
      return
    }

    const activosSubcategoria = filtrarPorSubcategoria(activosActuales)
    const pendientesSubcategoria = filtrarPorSubcategoria(pendientesActuales)
    const finalizadosSubcategoria = filtrarPorSubcategoria(finalizadosActuales)
    const totalPartidos =
      activosSubcategoria.length + pendientesSubcategoria.length + finalizadosSubcategoria.length

    if (activosSubcategoria.length > 0) {
      limpiarTemporizadores()
      avanceEnProcesoRef.current = false
      ultimaRondaActivaRef.current = activosSubcategoria[0].ronda
      setRondaActual(activosSubcategoria[0].ronda)
      setTorneoFinalizado(false)
      return
    }

    setRondaActual(null)

    if (!pendientesSubcategoria.length) {
      limpiarTemporizadores()
      avanceEnProcesoRef.current = false
      ultimaRondaActivaRef.current = null
      setTorneoFinalizado(totalPartidos > 0)
      return
    }

    if (!ultimaRondaActivaRef.current || avanceEnProcesoRef.current) {
      setTorneoFinalizado(false)
      return
    }

    avanceEnProcesoRef.current = true
    setTorneoFinalizado(false)
    setContadorRegresivo(5)
    setMensaje('Ronda completada. Activando siguiente ronda en 5 segundos...')

    temporizadorCuentaRef.current = window.setInterval(() => {
      setContadorRegresivo((actual) => {
        if (actual <= 1) {
          if (temporizadorCuentaRef.current) {
            window.clearInterval(temporizadorCuentaRef.current)
            temporizadorCuentaRef.current = null
          }

          return 0
        }

        return actual - 1
      })
    }, 1000)

    const rondaFinalizada = ultimaRondaActivaRef.current

    temporizadorAvanceRef.current = window.setTimeout(async () => {
      try {
        const resultado = await verificarYAvanzarRonda(
          subcategoriaIdSeleccionada,
          rondaFinalizada,
        )

        if (resultado?.avanzo && resultado.nuevaRonda) {
          const etiqueta = etiquetasRonda[resultado.nuevaRonda] || resultado.nuevaRonda
          setMensaje(`Ronda ${etiqueta} activada automaticamente.`)
        } else if (resultado?.torneoFinalizado) {
          setMensaje('Torneo finalizado.')
          setTorneoFinalizado(true)
        }

        ultimaRondaActivaRef.current = null
        await cargarPartidos({ mostrarCarga: false })
      } catch (errorAvance) {
        setError(errorAvance.message)
        setMensaje(errorAvance.message)
      } finally {
        avanceEnProcesoRef.current = false
        temporizadorAvanceRef.current = null
        limpiarTemporizadores()
      }
    }, 5000)
  }, [
    activos,
    cargarPartidos,
    filtrarPorSubcategoria,
    finalizados,
    limpiarTemporizadores,
    pendientes,
    subcategoriaIdSeleccionada,
  ])

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

    const configuracionEnfrentamientos = {
      event: '*',
      schema: 'public',
      table: 'enfrentamientos',
    }

    if (subcategoriaIdSeleccionada) {
      configuracionEnfrentamientos.filter = `subcategoria_id=eq.${subcategoriaIdSeleccionada}`
    }

    const canal = supabase
      .channel(`tecnibot-partidos-live-${subcategoriaIdSeleccionada || 'general'}-${Date.now()}`)
      .on(
        'postgres_changes',
        configuracionEnfrentamientos,
        () => {
          if (componenteActivo) {
            cargarPartidos({ mostrarCarga: false })
          }
        },
      )
      .subscribe()

    return () => {
      componenteActivo = false
      limpiarTemporizadores()
      supabase.removeChannel(canal)
    }
  }, [cargarPartidos, limpiarTemporizadores, subcategoriaIdSeleccionada])

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      verificarRondaCompleta()
    }, 0)

    return () => {
      window.clearTimeout(temporizador)
    }
  }, [activos, finalizados, pendientes, verificarRondaCompleta])

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

  async function iniciarTorneoCompleto(subcategoriaId) {
    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      const resultado = await iniciarTorneo(subcategoriaId)
      await cargarPartidos({ mostrarCarga: false })
      const etiqueta = etiquetasRonda[resultado.ronda] || resultado.ronda
      setMensaje(
        `Ronda ${etiqueta} activada — ${resultado.cantidadPartidos} partidos en curso.`,
      )
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
    activos,
    cargando,
    desactivarPartido,
    error,
    finalizados,
    guardando,
    iniciarTorneo: iniciarTorneoCompleto,
    mensaje,
    pendientes,
    recargar: cargarPartidos,
    rondaActual,
    setMensaje,
    subcategorias,
    contadorRegresivo,
    torneoFinalizado,
  }
}
