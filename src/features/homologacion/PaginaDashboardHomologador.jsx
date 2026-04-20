import { ChevronRight, ClipboardCheck, Shuffle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { rutas } from '../../utils/rutas'
import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { GridBrackets } from '../sorteo/components/GridBrackets'
import { listarSubcategoriasConSorteo } from '../sorteo/services/servicioSorteo'
import { SidebarHomologador } from './components/SidebarHomologador'

const accesos = [
  {
    descripcion: 'Revisa equipos, cambia estados y registra observaciones tecnicas.',
    estado: 'Control tecnico',
    Icono: ClipboardCheck,
    ruta: rutas.homologacion,
    estiloIcono: 'bg-teal-50 text-teal-500',
    titulo: 'Homologacion',
  },
  {
    descripcion: 'Gira la ruleta con equipos aprobados y genera el bracket inicial.',
    estado: 'Ruleta de equipos',
    Icono: Shuffle,
    ruta: rutas.sorteo,
    estiloIcono: 'bg-cyan-50 text-cyan-500',
    titulo: 'Sorteo',
  },
]

export function PaginaDashboardHomologador() {
  const { perfil } = useAutenticacion()
  const [brackets, setBrackets] = useState([])
  const nombre = perfil?.nombre || 'homologador'

  useEffect(() => {
    let activo = true

    async function cargarBrackets() {
      try {
        const subcategorias = await listarSubcategoriasConSorteo()

        if (activo) {
          setBrackets(subcategorias)
        }
      } catch {
        if (activo) {
          setBrackets([])
        }
      }
    }

    cargarBrackets()

    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <SidebarHomologador activo="inicio" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full p-8">
          <header className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white shadow-sm">
            <p className="text-sm text-white/70">Bienvenido,</p>
            <h1 className="mt-1 text-2xl font-bold">{nombre}</h1>
            <span className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              27 · 04 · 26 · UETS Cuenca
            </span>
          </header>

          <div className="grid grid-cols-2 gap-4">
            {accesos.map((acceso) => {
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

          <section className="mt-8">
            <div className="mb-4">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                LLAVES
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-800">
                Brackets del torneo
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Toca una subcategoria para ver su llave completa.
              </p>
            </div>

            <GridBrackets brackets={brackets} />
          </section>
        </div>
      </main>
    </div>
  )
}
