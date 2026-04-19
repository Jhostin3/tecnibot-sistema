import { useEffect, useMemo, useState } from 'react'

import { ModalActivarPartido } from './components/ModalActivarPartido'
import { ModalActivarRonda } from './components/ModalActivarRonda'
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
  alActivar,
  alActivarGrupo,
  alDesactivar,
  guardando,
  mensajeVacio,
  mostrarBotonGrupo = false,
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
          <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
                Grupo de ronda
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">
                {crearTituloGrupo(partidosGrupo[0])}
              </h2>
            </div>
            {mostrarBotonGrupo ? (
              <button
                className="min-h-10 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={guardando}
                onClick={() => alActivarGrupo(partidosGrupo)}
                type="button"
              >
                Activar ronda completa
              </button>
            ) : null}
          </div>
          <div className="grid gap-4">
            {partidosGrupo.map((partido) => (
              <TarjetaEnfrentamiento
                alActivar={alActivar}
                alDesactivar={alDesactivar}
                guardando={guardando}
                key={partido.id}
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
  const {
    activarPartido,
    activarRonda,
    activos,
    cargando,
    desactivarPartido,
    error,
    finalizados,
    guardando,
    mensaje,
    pendientes,
  } = usePartidos()
  const [pestanaActiva, setPestanaActiva] = useState('pendientes')
  const [partidoParaActivar, setPartidoParaActivar] = useState(null)
  const [grupoParaActivar, setGrupoParaActivar] = useState([])
  const [canchas, setCanchas] = useState(obtenerCanchasGuardadas)
  const [nuevaCancha, setNuevaCancha] = useState('')

  const partidosPorPestana = {
    activos,
    finalizados,
    pendientes,
  }
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

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Organizador
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Gestionar partidos
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Activa enfrentamientos, asigna cancha y revisa el estado del torneo.
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
          alActivar={setPartidoParaActivar}
          alActivarGrupo={setGrupoParaActivar}
          alDesactivar={desactivarPartido}
          guardando={guardando}
          mensajeVacio={mensajesVacios[pestanaActiva]}
          mostrarBotonGrupo={pestanaActiva === 'pendientes'}
          partidos={partidosPorPestana[pestanaActiva]}
        />
      )}

      {partidoParaActivar ? (
        <ModalActivarPartido
          alCerrar={() => setPartidoParaActivar(null)}
          alConfirmar={activarPartido}
          canchas={canchas}
          guardando={guardando}
          partido={partidoParaActivar}
        />
      ) : null}

      {grupoParaActivar.length ? (
        <ModalActivarRonda
          alCerrar={() => setGrupoParaActivar([])}
          alConfirmar={activarRonda}
          canchas={canchas}
          guardando={guardando}
          partidos={grupoParaActivar}
        />
      ) : null}
    </section>
  )
}
