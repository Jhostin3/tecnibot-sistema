import { ChevronRight, ClipboardCheck, Play, Shuffle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { rutas } from '../../utils/rutas'
import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'

const accesosRapidos = [
  {
    descripcion: 'Registrar, importar y administrar equipos inscritos.',
    Icono: Users,
    ruta: rutas.equipos,
    estiloIcono: 'bg-blue-100 text-blue-600',
    titulo: 'Equipos',
  },
  {
    descripcion: 'Revisar estados y apoyar el control de homologacion.',
    Icono: ClipboardCheck,
    ruta: rutas.homologacion,
    estiloIcono: 'bg-emerald-100 text-emerald-600',
    titulo: 'Homologacion',
  },
  {
    descripcion: 'Generar el orden inicial del bracket con la ruleta.',
    Icono: Shuffle,
    ruta: rutas.sorteo,
    estiloIcono: 'bg-purple-100 text-purple-600',
    titulo: 'Sorteo',
  },
  {
    descripcion: 'Activar partidos, asignar canchas y ver resultados.',
    Icono: Play,
    ruta: rutas.partidos,
    estiloIcono: 'bg-amber-100 text-amber-600',
    titulo: 'Partidos',
  },
]

export function PaginaDashboard() {
  const { perfil } = useAutenticacion()

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 p-6 shadow-lg shadow-blue-900/20">
        <span className="inline-flex rounded-full bg-blue-800 px-3 py-1 text-xs font-semibold text-cyan-400">
          27 - 04 - 26 - UETS
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white">
          Bienvenido, {perfil?.nombre || 'organizador'}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-200">
          Accede rapidamente a las herramientas principales de la competencia.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {accesosRapidos.map((acceso) => {
          const IconoAcceso = acceso.Icono

          return (
            <Link
              className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              key={acceso.titulo}
              to={acceso.ruta}
            >
              <ChevronRight className="absolute right-4 top-4 h-5 w-5 text-slate-300 transition group-hover:text-blue-500" />
              <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${acceso.estiloIcono}`}>
                <IconoAcceso className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">{acceso.titulo}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{acceso.descripcion}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
