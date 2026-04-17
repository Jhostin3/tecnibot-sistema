import { useCallback, useMemo, useState } from 'react'

import {
  cerrarSesionSimulada,
  iniciarSesionSimulada,
  obtenerSesionActual,
} from '../services/servicioAutenticacion'

export function useAutenticacion() {
  const [sesion, setSesion] = useState(() => obtenerSesionActual())

  const iniciarSesion = useCallback(async (credenciales) => {
    const nuevaSesion = await iniciarSesionSimulada(credenciales)
    setSesion(nuevaSesion)
    return nuevaSesion
  }, [])

  const cerrarSesion = useCallback(() => {
    cerrarSesionSimulada()
    setSesion(null)
  }, [])

  return useMemo(
    () => ({
      cerrarSesion,
      iniciarSesion,
      sesion,
      usuarioAutenticado: Boolean(sesion),
    }),
    [cerrarSesion, iniciarSesion, sesion],
  )
}
