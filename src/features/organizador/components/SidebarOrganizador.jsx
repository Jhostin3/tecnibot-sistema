import { ClipboardCheck, GitBranch, Home, Play, Shuffle, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'

const enlaces = [
  { Icono: Home, etiqueta: 'Inicio', ruta: rutas.inicio },
  { Icono: Users, etiqueta: 'Equipos', ruta: rutas.equipos },
  { Icono: ClipboardCheck, etiqueta: 'Homol.', ruta: rutas.homologacion },
  { Icono: Shuffle, etiqueta: 'Sorteo', ruta: rutas.sorteo },
  { Icono: Play, etiqueta: 'Partid.', ruta: rutas.partidos },
  { Icono: GitBranch, etiqueta: 'Brackets', ruta: rutas.brackets },
]

const claseEnlace = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? 'bg-indigo-50 font-semibold text-indigo-600'
      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
  }`

export function SidebarOrganizador() {
  return (
    <aside className="hidden h-screen w-56 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <nav className="space-y-2">
        {enlaces.map((enlace) => {
          const IconoEnlace = enlace.Icono

          return (
            <NavLink
              className={claseEnlace}
              key={enlace.ruta}
              to={enlace.ruta}
            >
              <IconoEnlace className="h-5 w-5" />
              {enlace.etiqueta}
            </NavLink>
          )
        })}
      </nav>

      <p className="mt-auto pb-4 text-center text-xs text-slate-300">
        TecniBot Cuenca 2026
      </p>
    </aside>
  )
}
