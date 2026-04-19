import { useCallback, useEffect, useState } from 'react'

import { listarBracketPorSubcategoria } from '../services/servicioSorteo'

export function useBracketSorteo(subcategoriaId) {
  const [cargando, setCargando] = useState(Boolean(subcategoriaId))
  const [enfrentamientos, setEnfrentamientos] = useState([])
  const [mensaje, setMensaje] = useState('')

  const cargarBracket = useCallback(async () => {
    if (!subcategoriaId) {
      setEnfrentamientos([])
      setCargando(false)
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const bracket = await listarBracketPorSubcategoria(subcategoriaId)
      setEnfrentamientos(bracket)
    } catch (error) {
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
      setMensaje('')

      try {
        const bracket = await listarBracketPorSubcategoria(subcategoriaId)

        if (componenteActivo) {
          setEnfrentamientos(bracket)
        }
      } catch (error) {
        if (componenteActivo) {
          setMensaje(error.message)
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarBracketInicial()

    return () => {
      componenteActivo = false
    }
  }, [subcategoriaId])

  return {
    cargando,
    enfrentamientos,
    mensaje,
    recargar: cargarBracket,
  }
}
