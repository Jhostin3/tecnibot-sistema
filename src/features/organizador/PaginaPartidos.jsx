import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { CampoSeleccion } from '../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../components/atoms/Etiqueta'
import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { SidebarHomologador } from '../homologacion/components/SidebarHomologador'
import { SidebarOrganizador } from './components/SidebarOrganizador'
import { TarjetaEnfrentamiento } from './components/TarjetaEnfrentamiento'
import { usePartidos } from './usarPartidos'

const pestanas = [
  { etiqueta: 'Pendientes', valor: 'pendientes' },
  { etiqueta: 'En juego', valor: 'activos' },
  { etiqueta: 'Finalizados', valor: 'finalizados' },
]

const canchasBase = ['Cancha 1', 'Cancha 2', 'Cancha 3']
const claveCanchas = 'tecnibot_canchas'

function obtenerCanchasGuardadas() {
  try {
    const canchasGuardadas = JSON.parse(localStorage.getItem(claveCanchas) || '[]')

    if (Array.isArray(canchasGuardadas) && canchasGuardadas.length) {
      return canchasGuardadas.filter(Boolean)
    }

    return canchasBase
  } catch {
    return canchasBase
  }
}

function crearClaveGrupo(partido) {
  return `${partido.subcategoria?.nombre || 'Subcategoria'} - ${partido.ronda}`
}

function crearTituloGrupo(partido) {
  return `${partido.subcategoria?.nombre || 'Subcategoria'} · ${partido.etiqueta_ronda}`
}

function agruparPartidos(partidos) {
  return partidos.reduce((grupos, partido) => {
    const clave = crearClaveGrupo(partido)

    if (!grupos[clave]) {
      grupos[clave] = []
    }

    grupos[clave].push(partido)
    return grupos
  }, {})
}

function ListaPartidos({
  mensajeVacio,
  mostrarAcciones = false,
  partidos,
}) {
  const grupos = useMemo(() => agruparPartidos(partidos || []), [partidos])
  const entradas = Object.entries(grupos)

  if (!partidos?.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-600">{mensajeVacio}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {entradas.map(([grupo, partidosGrupo]) => (
        <section className="space-y-3" key={grupo}>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
                Grupo de ronda
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">
                {crearTituloGrupo(partidosGrupo[0])}
              </h2>
            </div>
          </div>
          <div className="grid gap-4">
            {partidosGrupo.map((partido) => (
              <TarjetaEnfrentamiento
                key={partido.id}
                mostrarAcciones={mostrarAcciones}
                partido={partido}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function PaginaPartidos() {
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
  const {
    activos,
    cargando,
    error,
    finalizados,
    guardando,
    iniciarTorneo,
    mensaje,
    pendientes,
    subcategorias,
  } = usePartidos()
  const [pestanaActiva, setPestanaActiva] = useState('pendientes')
  const [canchas, setCanchas] = useState(obtenerCanchasGuardadas)
  const [nuevaCancha, setNuevaCancha] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [subcategoriaId, setSubcategoriaId] = useState('')
  const esHomologador = perfil?.rol === 'homologador'
  const etiquetaModulo = esHomologador ? 'Homologador' : 'Organizador'
  const Sidebar = esHomologador ? SidebarHomologador : SidebarOrganizador

  const categorias = useMemo(() => {
    const categoriasUnicas = new Map()

    subcategorias.forEach((subcategoria) => {
      const categoria = subcategoria.categorias

      if (categoria?.id && !categoriasUnicas.has(categoria.id)) {
        categoriasUnicas.set(categoria.id, categoria)
      }
    })

    return Array.from(categoriasUnicas.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    )
  }, [subcategorias])

  const subcategoriasFiltradas = useMemo(() => {
    if (!categoriaId) return subcategorias

    return subcategorias.filter((subcategoria) => subcategoria.categoria_id === categoriaId)
  }, [categoriaId, subcategorias])

  const subcategoriaIdSeleccionada = subcategoriasFiltradas.some(
    (subcategoria) => subcategoria.id === subcategoriaId,
  )
    ? subcategoriaId
    : ''

  const filtrarPartidos = useMemo(
    () => (partidos = []) =>
      partidos.filter((partido) => {
        const coincideCategoria = categoriaId
          ? subcategorias.some(
              (subcategoria) =>
                subcategoria.id === partido.subcategoria_id &&
                subcategoria.categoria_id === categoriaId,
            )
          : true
        const coincideSubcategoria = subcategoriaIdSeleccionada
          ? partido.subcategoria_id === subcategoriaIdSeleccionada
          : true

        return coincideCategoria && coincideSubcategoria
      }),
    [categoriaId, subcategoriaIdSeleccionada, subcategorias],
  )

  const partidosPorPestana = {
    activos: filtrarPartidos(activos),
    finalizados: filtrarPartidos(finalizados),
    pendientes: filtrarPartidos(pendientes),
  }
  const puedeIniciarTorneo = pendientes.length > 0 && activos.length === 0
  const mensajesVacios = {
    activos: 'No hay partidos en juego.',
    finalizados: 'Aun no hay partidos finalizados.',
    pendientes: 'No hay partidos pendientes por activar.',
  }

  useEffect(() => {
    localStorage.setItem(claveCanchas, JSON.stringify(canchas))
  }, [canchas])

  function agregarCancha(evento) {
    evento.preventDefault()

    const nombreCancha = nuevaCancha.trim()

    if (!nombreCancha) return

    setCanchas((actuales) =>
      actuales.some((cancha) => cancha.toLowerCase() === nombreCancha.toLowerCase())
        ? actuales
        : [...actuales, nombreCancha],
    )
    setNuevaCancha('')
  }

  function eliminarCancha(canchaAEliminar) {
    setCanchas((actuales) => actuales.filter((cancha) => cancha !== canchaAEliminar))
  }

  const contenido = (
    <section className="space-y-6 p-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          className="mb-5 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-blue-600"
          onClick={() => navigate('/')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          Inicio
        </button>
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          {etiquetaModulo}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          Gestionar partidos
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Inicia el torneo una sola vez y revisa como las rondas avanzan automaticamente.
        </p>
      </div>

      {mensaje ? (
        <p className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
          {mensaje}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
              Mis canchas
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Canchas rapidas
            </h2>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={agregarCancha}>
            <input
              className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
              onChange={(evento) => setNuevaCancha(evento.target.value)}
              placeholder="Nueva cancha"
              type="text"
              value={nuevaCancha}
            />
            <button
              className="min-h-10 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
              type="submit"
            >
              Agregar
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {canchas.map((cancha) => (
            <span
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
              key={cancha}
            >
              {cancha}
              <button
                className="min-h-10 rounded-md px-2 text-slate-500 transition hover:bg-white hover:text-red-600"
                onClick={() => eliminarCancha(cancha)}
                type="button"
              >
                Eliminar
              </button>
            </span>
          ))}
        </div>
      </section>

      {puedeIniciarTorneo ? (
        <section className="rounded-md border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
                Inicio automatico
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Todo listo para iniciar el torneo
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Se activara automaticamente la primera ronda disponible y el resto del torneo
                avanzara sin intervencion manual.
              </p>
            </div>
            <button
              className="min-h-10 rounded-md bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={guardando}
              onClick={() => iniciarTorneo(subcategoriaIdSeleccionada)}
              type="button"
            >
              {guardando ? 'Iniciando...' : 'Iniciar torneo'}
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Etiqueta htmlFor="categoriaPartidos">Categoria</Etiqueta>
            <CampoSeleccion
              id="categoriaPartidos"
              name="categoriaPartidos"
              onChange={(evento) => {
                setCategoriaId(evento.target.value)
                setSubcategoriaId('')
              }}
              value={categoriaId}
            >
              <option value="">Todas las categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </CampoSeleccion>
          </div>
          <div className="space-y-2">
            <Etiqueta htmlFor="subcategoriaPartidos">Especialidad</Etiqueta>
            <CampoSeleccion
              id="subcategoriaPartidos"
              name="subcategoriaPartidos"
              onChange={(evento) => setSubcategoriaId(evento.target.value)}
              value={subcategoriaIdSeleccionada}
            >
              <option value="">Todas las especialidades</option>
              {subcategoriasFiltradas.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.nombre}
                </option>
              ))}
            </CampoSeleccion>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {pestanas.map((pestana) => (
          <button
            className={`min-h-10 rounded-md px-4 py-2 text-sm font-semibold transition ${
              pestanaActiva === pestana.valor
                ? 'bg-cyan-700 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            key={pestana.valor}
            onClick={() => setPestanaActiva(pestana.valor)}
            type="button"
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-600">Cargando partidos...</p>
        </div>
      ) : (
        <ListaPartidos
          mensajeVacio={mensajesVacios[pestanaActiva]}
          partidos={partidosPorPestana[pestanaActiva]}
        />
      )}
    </section>
  )

  if (esHomologador) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <Sidebar activo="partidos" />
        <main className="flex-1 overflow-y-auto">{contenido}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{contenido}</main>
    </div>
  )
}
