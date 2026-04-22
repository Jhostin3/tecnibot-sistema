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
        const subcategoriasActuales = await listarSubcategorias()
        const estadosActuales = await listarEstadosSubcategorias(
          subcategoriasActuales.map((subcategoria) => subcategoria.id),
        )

        if (!componenteActivo) return

        setSubcategorias(subcategoriasActuales)
        setEstadosSubcategorias(estadosActuales)

        if (subcategoriasActuales.length) {
          setSubcategoriaSeleccionada(subcategoriasActuales[0].id)
        } else {
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
  }, [])

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

    const canal = subcategoriaSeleccionada
      ? supabase
          .channel(`llave-publica-${subcategoriaSeleccionada}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              filter: `subcategoria_id=eq.${subcategoriaSeleccionada}`,
              schema: 'public',
              table: 'enfrentamientos',
            },
            () => {
              if (componenteActivo) {
                cargarLlave(subcategoriaSeleccionada, { mostrarCarga: false })
                listarEstadosSubcategorias(subcategorias.map((subcategoria) => subcategoria.id))
                  .then((estadosActuales) => {
                    if (componenteActivo) {
                      setEstadosSubcategorias(estadosActuales)
                    }
                  })
                  .catch(() => undefined)
              }
            },
          )
          .subscribe()
      : null

    return () => {
      componenteActivo = false

      if (canal) {
        supabase.removeChannel(canal)
      }
    }
  }, [cargarLlave, subcategoriaSeleccionada, subcategorias])

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
