import { Link } from 'react-router-dom'

import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { rutas } from '../../utils/rutas'

const accesosRapidos = [
  {
    descripcion: 'Registrar, importar y administrar equipos inscritos.',
    icono: 'EQ',
    ruta: rutas.equipos,
    titulo: 'Equipos',
  },
  {
    descripcion: 'Revisar estados y apoyar el control de homologacion.',
    icono: 'HO',
    ruta: rutas.homologacion,
    titulo: 'Homologacion',
  },
  {
    descripcion: 'Consultar o realizar el orden inicial del bracket.',
    icono: 'SO',
    ruta: rutas.sorteo,
    titulo: 'Sorteo',
  },
  {
    descripcion: 'Activar partidos, asignar canchas y ver resultados.',
    icono: 'PA',
    ruta: rutas.partidos,
    titulo: 'Partidos',
  },
]

export function PaginaDashboard() {
  const { perfil } = useAutenticacion()

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Inicio
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
          Bienvenido, {perfil?.nombre || 'organizador'}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Accede rapidamente a las herramientas principales de la competencia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {accesosRapidos.map((acceso) => (
          <Link
            className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
            key={acceso.titulo}
            to={acceso.ruta}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-sm font-black text-cyan-800 ring-1 ring-cyan-100">
              {acceso.icono}
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-950 group-hover:text-cyan-800">
              {acceso.titulo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {acceso.descripcion}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
