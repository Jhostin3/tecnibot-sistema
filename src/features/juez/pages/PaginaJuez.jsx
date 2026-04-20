import { Clock, MapPin, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useJuez } from '../hooks/usarJuez'

function EstadoVacio() {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-12 text-center shadow-lg">
      <Clock className="mx-auto mb-4 h-16 w-16 text-gray-600" />
      <h2 className="text-xl font-semibold text-white">No hay partidos activos</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        El organizador debe activar un partido para que aparezca aqui
      </p>
      <p className="mt-6 animate-pulse text-xs font-semibold text-cyan-400">
        ● Esperando partidos...
      </p>
    </div>
  )
}

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerNombreRobot(equipo) {
  return equipo?.nombre_robot || 'Robot sin nombre'
}

function TarjetaPartidoSimple({ alIniciar, partido }) {
  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-all hover:border-cyan-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-300">
          {partido.subcategoria?.nombre || 'Subcategoria'} · {partido.etiqueta_ronda}
        </p>
        {partido.cancha ? (
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400">
            <MapPin className="h-3 w-3" />
            {partido.cancha}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 rounded-xl border border-blue-800 bg-gray-900 p-4 text-center">
          <p className="break-words text-lg font-bold text-blue-400">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <p className="mt-1 break-words text-xs text-gray-500">
            {obtenerNombreRobot(partido.equipo_a)}
          </p>
        </div>
        <span className="text-xl font-black text-gray-600">VS</span>
        <div className="min-w-0 flex-1 rounded-xl border border-red-800 bg-gray-900 p-4 text-center">
          <p className="break-words text-lg font-bold text-red-400">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <p className="mt-1 break-words text-xs text-gray-500">
            {obtenerNombreRobot(partido.equipo_b)}
          </p>
        </div>
      </div>

      <button
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition-all hover:bg-cyan-400"
        onClick={() => alIniciar(partido.id)}
        type="button"
      >
        <Play className="mr-2 h-4 w-4" />
        Iniciar partido
      </button>
    </article>
  )
}

export function PaginaJuez() {
  const navigate = useNavigate()
  const {
    cargando,
    error,
    mensaje,
    partidos,
  } = useJuez()

  function iniciarPartido(partidoId) {
    navigate(`/juez/${partidoId}`)
  }

  return (
    <section className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="inline-flex rounded-full bg-cyan-950 px-3 py-1 text-xs font-bold tracking-widest text-cyan-400">
            MODULO DE JUECES
          </p>
          <h1 className="text-3xl font-bold text-white">Partidos activos</h1>
          <p className="text-sm leading-6 text-gray-400">
            Registra marcadores de forma rapida durante cada encuentro.
          </p>
        </header>

        {mensaje ? (
          <p className="rounded-2xl border border-cyan-500 bg-cyan-950 p-4 text-base font-semibold text-cyan-100">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-800 bg-red-950 p-4 text-base font-semibold text-red-400">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          {cargando ? (
            <p className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center text-lg font-semibold text-gray-200">
              Cargando partidos activos...
            </p>
          ) : null}

          {!cargando && partidos.length === 0 ? <EstadoVacio /> : null}

          {!cargando && partidos.length > 0
            ? partidos.map((partido) => (
                <TarjetaPartidoSimple
                  alIniciar={iniciarPartido}
                  key={partido.id}
                  partido={partido}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  )
}
