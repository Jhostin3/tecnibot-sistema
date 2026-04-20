import {
  ChevronRight,
  ClipboardCheck,
  Home,
  Play,
  Shuffle,
  Users,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { rutas } from '../../utils/rutas'
import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'

const accesosRapidos = [
  {
    descripcion: 'Registrar, importar y administrar equipos inscritos.',
    estado: 'Gestion activa',
    Icono: Users,
    ruta: rutas.equipos,
    estiloIcono: 'bg-blue-50 text-blue-500',
    titulo: 'Equipos',
  },
  {
    descripcion: 'Revisar estados y apoyar el control de homologacion.',
    estado: 'Control tecnico',
    Icono: ClipboardCheck,
    ruta: rutas.homologacion,
    estiloIcono: 'bg-emerald-50 text-emerald-500',
    titulo: 'Homologacion',
  },
  {
    descripcion: 'Generar el orden inicial del bracket con la ruleta.',
    estado: 'Ruleta lista',
    Icono: Shuffle,
    ruta: rutas.sorteo,
    estiloIcono: 'bg-purple-50 text-purple-500',
    titulo: 'Sorteo',
  },
  {
    descripcion: 'Activar partidos, asignar canchas y ver resultados.',
    estado: 'Operaciones',
    Icono: Play,
    ruta: rutas.partidos,
    estiloIcono: 'bg-amber-50 text-amber-500',
    titulo: 'Partidos',
  },
]

const enlacesSidebar = [
  { Icono: Home, etiqueta: 'Inicio', ruta: rutas.inicio },
  { Icono: Users, etiqueta: 'Equipos', ruta: rutas.equipos },
  { Icono: ClipboardCheck, etiqueta: 'Homol.', ruta: rutas.homologacion },
  { Icono: Shuffle, etiqueta: 'Sorteo', ruta: rutas.sorteo },
  { Icono: Play, etiqueta: 'Partid.', ruta: rutas.partidos },
]

const claseEnlaceSidebar = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? 'bg-blue-50 font-semibold text-blue-600'
      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
  }`

export function PaginaDashboard() {
  const { perfil } = useAutenticacion()
  const nombreOrganizador = perfil?.nombre || 'organizador'

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-100">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-96px)] w-56 flex-col border-r border-slate-200 bg-white p-4 md:flex">
          <nav className="space-y-2">
            {enlacesSidebar.map((enlace) => {
              const IconoEnlace = enlace.Icono

              return (
                <NavLink
                  className={claseEnlaceSidebar}
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

        <main className="flex-1 p-4 md:p-8">
          <header className="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white shadow-sm">
            <p className="text-sm text-white/70">Bienvenido,</p>
            <h1 className="mt-1 text-2xl font-bold">{nombreOrganizador}</h1>
            <span className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              27 · 04 · 26 · UETS Cuenca
            </span>
          </header>

          <div className="grid grid-cols-2 gap-4">
            {accesosRapidos.map((acceso) => {
              const IconoAcceso = acceso.Icono

              return (
                <Link
                  className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  key={acceso.titulo}
                  to={acceso.ruta}
                >
                  <div className="flex items-start">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${acceso.estiloIcono}`}>
                      <IconoAcceso className="h-6 w-6" />
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-400">
                    {acceso.estado}
                  </p>
                  <h2 className="mt-4 text-lg font-semibold text-slate-800">
                    {acceso.titulo}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {acceso.descripcion}
                  </p>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </section>
  )
}
