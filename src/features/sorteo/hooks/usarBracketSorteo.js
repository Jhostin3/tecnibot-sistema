import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabaseCliente'
import { listarBracketPorSubcategoria } from '../services/servicioSorteo'

export function useBracketSorteo(subcategoriaId) {
  const [cargando, setCargando] = useState(Boolean(subcategoriaId))
  const [error, setError] = useState(null)
  const [enfrentamientos, setEnfrentamientos] = useState([])
  const [mensaje, setMensaje] = useState('')

  const cargarBracket = useCallback(async () => {
    if (!subcategoriaId) {
      setEnfrentamientos([])
      setCargando(false)
      return
    }

    setCargando(true)
    setError(null)
    setMensaje('')

    try {
      const bracket = await listarBracketPorSubcategoria(subcategoriaId)
      setEnfrentamientos(bracket)
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [subcategoriaId])

  useEffect(() => {
    let componenteActivo = true

    async function cargarBracketInicial() {
      if (!subcategoriaId) {
        if (componenteActivo) {
          setEnfrentamientos([])
          setCargando(false)
        }
        return
      }

      setCargando(true)
      setError(null)
      setMensaje('')

      try {
        const bracket = await listarBracketPorSubcategoria(subcategoriaId)

        if (componenteActivo) {
          setEnfrentamientos(bracket)
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

    cargarBracketInicial()

    const canal = subcategoriaId
      ? supabase
          .channel(`bracket-publico-${subcategoriaId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              filter: `subcategoria_id=eq.${subcategoriaId}`,
              schema: 'public',
              table: 'enfrentamientos',
            },
            () => {
              if (componenteActivo) {
                cargarBracket()
              }
            },
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'resultados' },
            () => {
              if (componenteActivo) {
                cargarBracket()
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
  }, [cargarBracket, subcategoriaId])

  return {
    cargando,
    error,
    enfrentamientos,
    mensaje,
    recargar: cargarBracket,
  }
}
