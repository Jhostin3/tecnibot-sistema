import { Outlet, useNavigate } from 'react-router-dom'

import { PlantillaPanel } from '../components/templates/PlantillaPanel'
import { useAutenticacion } from '../features/autenticacion/hooks/useAutenticacion'
import { rutas } from '../utils/rutas'

export function LayoutPrivado() {
  const navigate = useNavigate()
  const { cerrarSesion, perfil, usuario } = useAutenticacion()

  async function manejarCierreSesion() {
    await cerrarSesion()
    navigate(rutas.login, { replace: true })
  }

  return (
    <PlantillaPanel
      alCerrarSesion={manejarCierreSesion}
      perfil={perfil}
      usuario={usuario}
    >
      <Outlet />
    </PlantillaPanel>
  )
}
