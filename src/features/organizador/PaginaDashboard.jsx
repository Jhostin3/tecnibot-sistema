import {
  ChevronRight,
  ClipboardCheck,
  Plus,
  Play,
  Shuffle,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { rutas } from '../../utils/rutas'
import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { listarEquipos } from '../equipos/services/servicioEquipos'
import { GridBrackets } from '../sorteo/components/GridBrackets'
import { useModoSorteo } from '../sorteo/hooks/useModoSorteo'
import {
  crearCategoriaSorteo,
  listarCategoriasSorteo,
  listarSubcategoriasConSorteo,
} from '../sorteo/services/servicioSorteo'
import { guardarModoSorteo, modosSorteo } from '../sorteo/utils/modoSorteo'
import { SidebarOrganizador } from './components/SidebarOrganizador'

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

export function PaginaDashboard() {
  const { perfil } = useAutenticacion()
  const modoSorteo = useModoSorteo()
  const [brackets, setBrackets] = useState([])
  const [categorias, setCategorias] = useState([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [guardandoCategoria, setGuardandoCategoria] = useState(false)
  const [mensajeCategoria, setMensajeCategoria] = useState('')
  const [errorCategoria, setErrorCategoria] = useState('')
  const [conteoEquipos, setConteoEquipos] = useState(null)
  const nombreOrganizador = perfil?.nombre || 'organizador'

  useEffect(() => {
    let activo = true

    async function cargarConteoEquipos() {
      try {
        const equipos = await listarEquipos()

        if (activo) {
          setConteoEquipos(equipos.length)
        }
      } catch {
        if (activo) {
          setConteoEquipos(0)
        }
      }
    }

    cargarConteoEquipos()

    return () => {
      activo = false
    }
  }, [])

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

  useEffect(() => {
    let activo = true

    async function cargarCategorias() {
      try {
        const categoriasActuales = await listarCategoriasSorteo()

        if (activo) {
          setCategorias(categoriasActuales)
        }
      } catch {
        if (activo) {
          setCategorias([])
        }
      }
    }

    cargarCategorias()

    return () => {
      activo = false
    }
  }, [])

  async function crearCategoria(evento) {
    evento.preventDefault()
    setGuardandoCategoria(true)
    setMensajeCategoria('')
    setErrorCategoria('')

    try {
      await crearCategoriaSorteo(nombreCategoria)
      const categoriasActuales = await listarCategoriasSorteo()

      setCategorias(categoriasActuales)
      setNombreCategoria('')
      setMensajeCategoria('Categoria creada correctamente.')
    } catch (error) {
      setErrorCategoria(error.message)
    } finally {
      setGuardandoCategoria(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-100">
      <div className="flex w-full">
        <SidebarOrganizador />

        <main className="flex-1 p-4 md:p-8">
          <header className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 p-6 text-white shadow-sm">
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
                    {acceso.titulo === 'Equipos'
                      ? `${conteoEquipos ?? '...'} equipos registrados`
                      : acceso.estado}
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

          <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              CONFIGURACION DEL TORNEO
            </p>
            <h2 className="mt-4 text-lg font-bold text-slate-800">
              Modo de sorteo:
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className={`rounded-xl px-6 py-3 transition-all ${
                  modoSorteo === modosSorteo.virtual
                    ? 'bg-indigo-500 font-bold text-white'
                    : 'border border-slate-200 bg-slate-100 text-slate-500'
                }`}
                onClick={() => guardarModoSorteo(modosSorteo.virtual)}
                type="button"
              >
                Virtual
              </button>
              <button
                className={`rounded-xl px-6 py-3 transition-all ${
                  modoSorteo === modosSorteo.presencial
                    ? 'bg-teal-500 font-bold text-white'
                    : 'border border-slate-200 bg-slate-100 text-slate-500'
                }`}
                onClick={() => guardarModoSorteo(modosSorteo.presencial)}
                type="button"
              >
                Presencial
              </button>
            </div>
            {modoSorteo === modosSorteo.virtual ? (
              <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-600">
                El homologador realizara el sorteo con la ruleta animada despues
                de aprobar todos los equipos.
              </p>
            ) : (
              <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-600">
                Al aprobar cada equipo en homologacion, se pedira ingresar el
                numero de bola que le correspondio en el sorteo fisico.
              </p>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  CATEGORIAS
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-800">
                  Agregar categorias
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Crea nuevas categorias como Soccer para usarlas despues en las especialidades.
                </p>
              </div>

              <form className="w-full max-w-xl space-y-3" onSubmit={crearCategoria}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    onChange={(evento) => setNombreCategoria(evento.target.value)}
                    placeholder="Nueva categoria"
                    type="text"
                    value={nombreCategoria}
                  />
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={guardandoCategoria}
                    type="submit"
                  >
                    <Plus className="h-4 w-4" />
                    {guardandoCategoria ? 'Guardando...' : 'Agregar categoria'}
                  </button>
                </div>

                {mensajeCategoria ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    {mensajeCategoria}
                  </p>
                ) : null}

                {errorCategoria ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {errorCategoria}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {categorias.length ? (
                categorias.map((categoria) => (
                  <span
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    key={categoria.id}
                  >
                    {categoria.nombre}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">Aun no hay categorias registradas.</p>
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
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
            </div>

            <GridBrackets brackets={brackets} />
          </section>
        </main>
      </div>
    </section>
  )
}
