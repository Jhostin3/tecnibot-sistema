import { Navigate, Outlet } from 'react-router-dom'

import { useAutenticacion } from '../features/autenticacion/hooks/useAutenticacion'
import { rutas } from '../utils/rutas'

export function RutaPorRol({ rolesPermitidos }) {
  const { perfil } = useAutenticacion()

  if (!rolesPermitidos.includes(perfil?.rol)) {
    return <Navigate replace to={rutas.panel} />
  }

  return <Outlet />
}
