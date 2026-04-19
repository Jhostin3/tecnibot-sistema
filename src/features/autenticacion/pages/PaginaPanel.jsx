import { Link } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'
import { useAutenticacion } from '../hooks/useAutenticacion'

const camposPerfil = [
  { etiqueta: 'Nombre', propiedad: 'nombre' },
  { etiqueta: 'Rol', propiedad: 'rol' },
]

export function PaginaPanel() {
  const { perfil, usuario } = useAutenticacion()
  const esOrganizador = perfil?.rol === 'organizador'
  const puedeHomologar = ['organizador', 'homologador'].includes(perfil?.rol)

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Panel principal
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
          Sesión activa
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Acceso validado con Supabase Auth y perfil consultado desde la tabla
          perfiles.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {esOrganizador ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
              to={rutas.equipos}
            >
              Gestionar equipos
            </Link>
          ) : null}
          {esOrganizador ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
              to={rutas.sorteo}
            >
              Realizar sorteo
            </Link>
          ) : null}
          {puedeHomologar ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              to={rutas.homologacion}
            >
              Homologar equipos
            </Link>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {camposPerfil.map((campo) => (
          <article
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            key={campo.propiedad}
          >
            <p className="text-sm text-slate-500">{campo.etiqueta}</p>
            <p className="mt-2 text-xl font-bold capitalize text-slate-950">
              {perfil?.[campo.propiedad]}
            </p>
          </article>
        ))}
        <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Correo</p>
          <p className="mt-2 break-words text-xl font-bold text-slate-950">
            {usuario?.email}
          </p>
        </article>
      </div>
    </section>
  )
}
