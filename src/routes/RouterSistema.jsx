import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProveedorAutenticacion } from '../features/autenticacion/hooks/ContextoAutenticacion'
import { PaginaLogin } from '../features/autenticacion/pages/PaginaLogin'
import { PaginaEquipos } from '../features/equipos/pages/PaginaEquipos'
import { PaginaHomologacion } from '../features/homologacion/pages/PaginaHomologacion'
import { PaginaPartidoActivo } from '../features/juez/PaginaPartidoActivo'
import { PaginaJuez } from '../features/juez/pages/PaginaJuez'
import { PaginaLlave } from '../features/llave/PaginaLlave'
import { PaginaDashboard } from '../features/organizador/PaginaDashboard'
import { PaginaPartidos } from '../features/organizador/PaginaPartidos'
import { PaginaLlavePublica } from '../features/sorteo/pages/PaginaLlavePublica'
import { PaginaSorteo } from '../features/sorteo/pages/PaginaSorteo'
import { LayoutPrivado } from '../layouts/LayoutPrivado'
import { LayoutPublico } from '../layouts/LayoutPublico'
import { rutas } from '../utils/rutas'
import { RedireccionPorRol } from './RedireccionPorRol'
import { RutaPorRol } from './RutaPorRol'
import { RutaProtegida } from './RutaProtegida'

export function RouterSistema() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutPublico />}>
            <Route path={rutas.login} element={<PaginaLogin />} />
            <Route path={rutas.llave} element={<PaginaLlave />} />
            <Route path={rutas.llaveSubcategoria} element={<PaginaLlavePublica />} />
          </Route>
          <Route element={<RutaProtegida />}>
            <Route element={<LayoutPrivado />}>
              <Route path={rutas.panel} element={<RedireccionPorRol />} />
              <Route element={<RutaPorRol rolesPermitidos={['organizador']} />}>
                <Route path={rutas.inicio} element={<PaginaDashboard />} />
                <Route path={rutas.equipos} element={<PaginaEquipos />} />
                <Route path={rutas.partidos} element={<PaginaPartidos />} />
              </Route>
              <Route element={<RutaPorRol rolesPermitidos={['organizador', 'homologador']} />}>
                <Route path={rutas.sorteo} element={<PaginaSorteo />} />
              </Route>
              <Route element={<RutaPorRol rolesPermitidos={['juez']} />}>
                <Route path={rutas.juez} element={<PaginaJuez />} />
                <Route path={rutas.juezPartido} element={<PaginaPartidoActivo />} />
              </Route>
              <Route element={<RutaPorRol rolesPermitidos={['organizador', 'homologador']} />}>
                <Route path={rutas.homologacion} element={<PaginaHomologacion />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate replace to={rutas.login} />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  )
}
