import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAutenticacion } from '../features/autenticacion/hooks/useAutenticacion'
import { rutas } from '../utils/rutas'

export function RutaProtegida() {
  const location = useLocation()
  const { usuarioAutenticado } = useAutenticacion()

  if (!usuarioAutenticado) {
    return <Navigate replace state={{ desde: location }} to={rutas.login} />
  }

  return <Outlet />
}
