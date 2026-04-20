import { ClipboardCheck, Home, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'

const enlaces = [
  { activo: 'inicio', Icono: Home, etiqueta: 'Inicio', ruta: rutas.inicio },
  {
    activo: 'homologacion',
    Icono: ClipboardCheck,
    etiqueta: 'Homologacion',
    ruta: rutas.homologacion,
  },
  { activo: 'sorteo', Icono: Shuffle, etiqueta: 'Sorteo', ruta: rutas.sorteo },
]

function obtenerInicial(nombre) {
  return nombre?.trim().charAt(0).toUpperCase() || 'H'
}

export function SidebarHomologador({ activo = 'inicio' }) {
  const { perfil } = useAutenticacion()
  const nombre = perfil?.nombre || 'homologador'

  return (
    <aside className="hidden h-screen w-56 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-600">
          {obtenerInicial(nombre)}
        </div>
        <p className="mt-3 truncate text-sm font-semibold text-slate-800">{nombre}</p>
        <p className="text-xs capitalize text-slate-400">{perfil?.rol || 'homologador'}</p>
      </div>

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
