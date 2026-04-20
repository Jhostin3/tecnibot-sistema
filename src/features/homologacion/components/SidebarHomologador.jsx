import { ClipboardCheck, GitBranch, Home, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'

const enlaces = [
  { activo: 'inicio', Icono: Home, etiqueta: 'Inicio', ruta: rutas.inicio },
  {
    activo: 'homologacion',
    Icono: ClipboardCheck,
    etiqueta: 'Homologacion',
    ruta: rutas.homologacion,
  },
  { activo: 'sorteo', Icono: Shuffle, etiqueta: 'Sorteo', ruta: rutas.sorteo },
  { activo: 'brackets', Icono: GitBranch, etiqueta: 'Brackets', ruta: rutas.brackets },
]

export function SidebarHomologador({ activo = 'inicio' }) {
  return (
    <aside className="hidden h-screen w-56 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <nav className="space-y-2">
        {enlaces.map((enlace) => {
          const IconoEnlace = enlace.Icono
          const estaActivo = activo === enlace.activo

          return (
            <Link
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                estaActivo
                  ? 'bg-teal-50 font-semibold text-teal-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
              }`}
              key={enlace.ruta}
              to={enlace.ruta}
            >
              <IconoEnlace className="h-5 w-5" />
              {enlace.etiqueta}
            </Link>
          )
        })}
      </nav>

      <p className="mt-auto pb-4 text-center text-xs text-slate-300">
        TecniBot Cuenca 2026
      </p>
    </aside>
  )
}
