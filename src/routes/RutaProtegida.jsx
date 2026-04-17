import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { IndicadorCarga } from '../components/atoms/IndicadorCarga'
import { useAutenticacion } from '../features/autenticacion/hooks/useAutenticacion'
import { rutas } from '../utils/rutas'

export function RutaProtegida() {
  const location = useLocation()
  const { cargandoSesion, usuarioAutenticado } = useAutenticacion()

  if (cargandoSesion) {
    return <IndicadorCarga mensaje="Validando sesión..." />
  }

  if (!usuarioAutenticado) {
    return <Navigate replace state={{ desde: location }} to={rutas.login} />
  }

  return <Outlet />
}
