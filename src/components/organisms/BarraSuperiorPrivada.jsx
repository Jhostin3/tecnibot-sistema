import { Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { rutas } from '../../utils/rutas'

const claseLink = ({ isActive }) =>
  `inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
    isActive
      ? 'bg-blue-700 text-white'
      : 'text-blue-200 hover:bg-blue-700 hover:text-white'
  }`

export function BarraSuperiorPrivada({ alCerrarSesion, perfil, usuario }) {
  const esOrganizador = perfil?.rol === 'organizador'
  const esHomologador = perfil?.rol === 'homologador'

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg shadow-blue-900/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-cyan-400" />
          <div>
            <p className="text-xl font-black tracking-normal text-white">TECNIBOT</p>
            <p className="text-xs font-semibold text-cyan-400">Cuenca 2026</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {esOrganizador ? (
            <nav className="flex flex-wrap gap-2">
              <NavLink className={claseLink} to={rutas.inicio}>
                Inicio
              </NavLink>
              <NavLink className={claseLink} to={rutas.equipos}>
                Equipos
              </NavLink>
              <NavLink className={claseLink} to={rutas.partidos}>
                Partidos
              </NavLink>
              <NavLink className={claseLink} to={rutas.sorteo}>
                Sorteo
              </NavLink>
            </nav>
          ) : null}

          {esHomologador ? (
            <nav className="flex flex-wrap gap-2">
              <NavLink className={claseLink} to={rutas.homologacion}>
                Homologacion
              </NavLink>
              <NavLink className={claseLink} to={rutas.sorteo}>
                Sorteo
              </NavLink>
            </nav>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-blue-700 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            <p className="text-sm font-semibold text-blue-300">{perfil?.nombre}</p>
            <p className="text-xs text-blue-300/80">{usuario?.email}</p>
          </div>

          <button
            className="min-h-10 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-200 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
            onClick={alCerrarSesion}
            type="button"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  )
}
