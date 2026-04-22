import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabaseCliente'
import {
  listarEnfrentamientosPorSubcategoria,
  listarEstadosSubcategorias,
  listarSubcategorias,
} from './servicioLlave'

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

export function useLlave() {
  const [subcategorias, setSubcategorias] = useState([])
  const [estadosSubcategorias, setEstadosSubcategorias] = useState({})
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('')
  const [enfrentamientos, setEnfrentamientos] = useState([])
  const [ganadorFinal, setGanadorFinal] = useState(null)
  const [esCampeonAutomatico, setEsCampeonAutomatico] = useState(false)
  const [tieneSorteo, setTieneSorteo] = useState(false)
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

  const cargarLlave = useCallback(async (subcategoriaId, { mostrarCarga = true } = {}) => {
    if (!subcategoriaId) {
      setEnfrentamientos([])
      setGanadorFinal(null)
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

    const canal = supabase
      .channel(`llave-publica-${subcategoriaSeleccionada || 'general'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enfrentamientos' },
        () => {
          if (!componenteActivo) return

          if (subcategoriaSeleccionada) {
            cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
          }

          cargarOpcionesLlave().catch(() => undefined)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resultados' },
        () => {
          if (!componenteActivo || !subcategoriaSeleccionada) return

          cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sorteo' },
        () => {
          if (!componenteActivo) return

          if (subcategoriaSeleccionada) {
            cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
          }

          cargarOpcionesLlave().catch(() => undefined)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subcategorias' },
        () => {
          if (!componenteActivo) return

          cargarOpcionesLlave().catch(() => undefined)
        },
      )
      .subscribe()

    return () => {
      componenteActivo = false

      supabase.removeChannel(canal)
    }
  }, [cargarLlave, cargarOpcionesLlave, subcategoriaSeleccionada])

  return {
    cargando,
    enfrentamientos,
    error,
    esCampeonAutomatico,
    estadosSubcategorias,
    ganadorFinal,
    seleccionarSubcategoria: setSubcategoriaSeleccionada,
    subcategoriaSeleccionada,
    subcategorias,
    tieneSorteo,
  }
}
