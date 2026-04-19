import { Link } from 'react-router-dom'

import { rutas } from '../../utils/rutas'
import { Boton } from '../atoms/Boton'

export function BarraSuperiorPrivada({ alCerrarSesion, perfil, usuario }) {
  const esOrganizador = perfil?.rol === 'organizador'

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-800">
            Sistema de Gestion de Competencias de Robotica
          </p>
          <p className="text-xs text-slate-500">
            {perfil?.nombre} - {usuario?.email}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {esOrganizador ? (
            <nav className="flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                to={rutas.inicio}
              >
                Inicio
              </Link>
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                to={rutas.equipos}
              >
                Equipos
              </Link>
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                to={rutas.partidos}
              >
                Partidos
              </Link>
            </nav>
          ) : null}
          <Boton variante="secundario" onClick={alCerrarSesion}>
            Cerrar sesion
          </Boton>
        </div>
      </div>
    </header>
  )
}
