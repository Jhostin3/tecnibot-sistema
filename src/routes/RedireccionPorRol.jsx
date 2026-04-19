import { Navigate } from 'react-router-dom'

import { useAutenticacion } from '../features/autenticacion/hooks/useAutenticacion'
import { rutas } from '../utils/rutas'

const rutasPorRol = {
  homologador: rutas.homologacion,
  juez: rutas.juez,
  organizador: rutas.inicio,
}

function obtenerRutaPorRol(rol) {
  return rutasPorRol[rol] || rutas.panel
}

export function RedireccionPorRol() {
  const { perfil } = useAutenticacion()

  return <Navigate replace to={obtenerRutaPorRol(perfil?.rol)} />
}
