import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabaseCliente'
import {
  listarEnfrentamientosPorSubcategoria,
  listarSubcategorias,
  obtenerGanadorFinal,
} from './servicioLlave'

export function useLlave() {
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('')
  const [enfrentamientos, setEnfrentamientos] = useState([])
  const [ganadorFinal, setGanadorFinal] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarLlave = useCallback(async (subcategoriaId, { mostrarCarga = true } = {}) => {
    if (!subcategoriaId) {
      setEnfrentamientos([])
      setGanadorFinal(null)
      setCargando(false)
      return
    }

    if (mostrarCarga) {
      setCargando(true)
    }

    setError(null)

    try {
      const [enfrentamientosActuales, ganadorActual] = await Promise.all([
        listarEnfrentamientosPorSubcategoria(subcategoriaId),
        obtenerGanadorFinal(subcategoriaId),
      ])

      setEnfrentamientos(enfrentamientosActuales)
      setGanadorFinal(ganadorActual)
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

        if (!componenteActivo) return

        setSubcategorias(subcategoriasActuales)

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
        setCargando(false)
        return
      }

      setCargando(true)
      setError(null)

      try {
        const [enfrentamientosActuales, ganadorActual] = await Promise.all([
          listarEnfrentamientosPorSubcategoria(subcategoriaSeleccionada),
          obtenerGanadorFinal(subcategoriaSeleccionada),
        ])

        if (componenteActivo) {
          setEnfrentamientos(enfrentamientosActuales)
          setGanadorFinal(ganadorActual)
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
  }, [cargarLlave, subcategoriaSeleccionada])

  return {
    cargando,
    enfrentamientos,
    error,
    ganadorFinal,
    seleccionarSubcategoria: setSubcategoriaSeleccionada,
    subcategoriaSeleccionada,
    subcategorias,
  }
}
