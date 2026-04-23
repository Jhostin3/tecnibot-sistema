import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabaseCliente'
import {
  listarEnfrentamientosPorSubcategoria,
  listarEstadosSubcategorias,
  listarSubcategorias,
} from './servicioLlave'

// Nota para desarrollo:
// Habilita Realtime manualmente en Supabase Dashboard -> Table Editor -> enfrentamientos/resultados -> Enable Realtime.

const INTERVALO_REFRESCO_LLAVE = 2000

function detectarCampeonAutomatico(enfrentamientos = []) {
  return (
    enfrentamientos.length === 1 &&
    enfrentamientos[0].ronda === 'final' &&
    enfrentamientos[0].bye === true &&
    enfrentamientos[0].ganador_id !== null
  )
}

function obtenerGanadorFinalDesdeEnfrentamientos(enfrentamientos = []) {
  return (
    enfrentamientos.find(
      (enfrentamiento) =>
        enfrentamiento.ronda === 'final' &&
        enfrentamiento.estado === 'finalizado' &&
        enfrentamiento.ganador_id !== null,
    )?.ganador || null
  )
}

function detectarCompetenciaFinalizada(enfrentamientos = []) {
  return enfrentamientos.length > 0 && enfrentamientos.every((enfrentamiento) =>
    enfrentamiento.estado === 'finalizado'
  )
}

export function useLlave() {
  const [subcategorias, setSubcategorias] = useState([])
  const [estadosSubcategorias, setEstadosSubcategorias] = useState({})
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('')
  const [enfrentamientos, setEnfrentamientos] = useState([])
  const [ganadorFinal, setGanadorFinal] = useState(null)
  const [competenciaFinalizada, setCompetenciaFinalizada] = useState(false)
  const [esCampeonAutomatico, setEsCampeonAutomatico] = useState(false)
  const [tieneSorteo, setTieneSorteo] = useState(false)
  const [realtimeActivo, setRealtimeActivo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarOpcionesLlave = useCallback(async () => {
    const subcategoriasActuales = await listarSubcategorias()
    const estadosActuales = await listarEstadosSubcategorias(
      subcategoriasActuales.map((subcategoria) => subcategoria.id),
    )

    setSubcategorias(subcategoriasActuales)
    setEstadosSubcategorias(estadosActuales)
    setSubcategoriaSeleccionada((actual) =>
      actual && subcategoriasActuales.some((subcategoria) => subcategoria.id === actual)
        ? actual
        : (subcategoriasActuales[0]?.id || '')
    )

    return subcategoriasActuales
  }, [])

  const refrescarEstadosSubcategorias = useCallback(async () => {
    const subcategoriasActuales = await listarSubcategorias()
    const estadosActuales = await listarEstadosSubcategorias(
      subcategoriasActuales.map((subcategoria) => subcategoria.id),
    )

    setSubcategorias(subcategoriasActuales)
    setEstadosSubcategorias(estadosActuales)
  }, [])

  const cargarLlave = useCallback(async (subcategoriaId, { mostrarCarga = true } = {}) => {
    if (!subcategoriaId) {
      setEnfrentamientos([])
      setGanadorFinal(null)
      setCompetenciaFinalizada(false)
      setEsCampeonAutomatico(false)
      setTieneSorteo(false)
      setCargando(false)
      return
    }

    if (mostrarCarga) {
      setCargando(true)
    }

    setError(null)

    try {
      const enfrentamientosActuales = await listarEnfrentamientosPorSubcategoria(subcategoriaId)

      setEnfrentamientos(enfrentamientosActuales)
      setTieneSorteo(enfrentamientosActuales.length > 0)
      setCompetenciaFinalizada(detectarCompetenciaFinalizada(enfrentamientosActuales))
      setEsCampeonAutomatico(detectarCampeonAutomatico(enfrentamientosActuales))
      setGanadorFinal(obtenerGanadorFinalDesdeEnfrentamientos(enfrentamientosActuales))
    } catch (error) {
      setError(error.message)
    } finally {
      if (mostrarCarga) {
        setCargando(false)
      }
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function cargarOpciones() {
      setCargando(true)
      setError(null)

      try {
        if (!componenteActivo) return

        const subcategoriasActuales = await cargarOpcionesLlave()

        if (!subcategoriasActuales.length) {
          setCargando(false)
        }
      } catch (error) {
        if (componenteActivo) {
          setError(error.message)
          setCargando(false)
        }
      }
    }

    cargarOpciones()

    return () => {
      componenteActivo = false
    }
  }, [cargarOpcionesLlave])

  useEffect(() => {
    let componenteActivo = true

    async function cargarDatos() {
      if (!subcategoriaSeleccionada) {
        setEnfrentamientos([])
        setGanadorFinal(null)
        setCompetenciaFinalizada(false)
        setEsCampeonAutomatico(false)
        setTieneSorteo(false)
        setCargando(false)
        return
      }

      setCargando(true)
      setError(null)

      try {
        const enfrentamientosActuales =
          await listarEnfrentamientosPorSubcategoria(subcategoriaSeleccionada)

        if (componenteActivo) {
          setEnfrentamientos(enfrentamientosActuales)
          setTieneSorteo(enfrentamientosActuales.length > 0)
          setCompetenciaFinalizada(detectarCompetenciaFinalizada(enfrentamientosActuales))
          setEsCampeonAutomatico(detectarCampeonAutomatico(enfrentamientosActuales))
          setGanadorFinal(obtenerGanadorFinalDesdeEnfrentamientos(enfrentamientosActuales))
        }
      } catch (error) {
        if (componenteActivo) {
          setError(error.message)
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarDatos()

    const intervalo = window.setInterval(() => {
      if (!componenteActivo || !subcategoriaSeleccionada) return

      cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
      refrescarEstadosSubcategorias()
    }, INTERVALO_REFRESCO_LLAVE)

    const canal = supabase
      .channel(`tecnibot-enfrentamientos-${subcategoriaSeleccionada || 'general'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enfrentamientos',
          filter: `subcategoria_id=eq.${subcategoriaSeleccionada}`,
        },
        () => {
          if (!componenteActivo) return

          if (subcategoriaSeleccionada) {
            cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
          }

          refrescarEstadosSubcategorias()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resultados',
        },
        () => {
          if (!componenteActivo) return

          if (subcategoriaSeleccionada) {
            cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
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
      window.clearInterval(intervalo)

      supabase.removeChannel(canal)
    }
  }, [cargarLlave, refrescarEstadosSubcategorias, subcategoriaSeleccionada])

  return {
    cargando,
    competenciaFinalizada,
    enfrentamientos,
    error,
    esCampeonAutomatico,
    estadosSubcategorias,
    ganadorFinal,
    realtimeActivo,
    seleccionarSubcategoria: setSubcategoriaSeleccionada,
    subcategoriaSeleccionada,
    subcategorias,
    tieneSorteo,
  }
}
