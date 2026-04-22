import { useEffect, useState } from 'react'

import { eventoModoSorteo, obtenerModoSorteo } from '../utils/modoSorteo'

export function useModoSorteo() {
  const [modoSorteo, setModoSorteo] = useState(() => obtenerModoSorteo())

  useEffect(() => {
    function actualizarModo(evento) {
      setModoSorteo(evento.detail || obtenerModoSorteo())
    }

    function actualizarDesdeStorage(evento) {
      if (evento.key === 'tecnibot_modo_sorteo') {
        setModoSorteo(obtenerModoSorteo())
      }
    }

    window.addEventListener(eventoModoSorteo, actualizarModo)
    window.addEventListener('storage', actualizarDesdeStorage)

    return () => {
      window.removeEventListener(eventoModoSorteo, actualizarModo)
      window.removeEventListener('storage', actualizarDesdeStorage)
    }
  }, [])

  return modoSorteo
}
