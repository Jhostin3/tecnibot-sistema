import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProveedorAutenticacion } from '../features/autenticacion/hooks/ContextoAutenticacion'
import { PaginaLogin } from '../features/autenticacion/pages/PaginaLogin'
import { PaginaPanel } from '../features/autenticacion/pages/PaginaPanel'
import { PaginaEquipos } from '../features/equipos/pages/PaginaEquipos'
import { LayoutPrivado } from '../layouts/LayoutPrivado'
import { LayoutPublico } from '../layouts/LayoutPublico'
import { rutas } from '../utils/rutas'
import { RutaPorRol } from './RutaPorRol'
import { RutaProtegida } from './RutaProtegida'

export function RouterSistema() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutPublico />}>
            <Route path={rutas.login} element={<PaginaLogin />} />
          </Route>
          <Route element={<RutaProtegida />}>
            <Route element={<LayoutPrivado />}>
              <Route path={rutas.panel} element={<PaginaPanel />} />
              <Route element={<RutaPorRol rolesPermitidos={['organizador']} />}>
                <Route path={rutas.equipos} element={<PaginaEquipos />} />
              </Route>
            </Route>
          </Route>
          <Route path={rutas.inicio} element={<Navigate replace to={rutas.panel} />} />
          <Route path="*" element={<Navigate replace to={rutas.login} />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  )
}
