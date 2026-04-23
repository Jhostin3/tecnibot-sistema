import { Clock, MapPin, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { IndicadorEnVivo } from '../../../components/molecules/IndicadorEnVivo'
import { useJuez } from '../hooks/usarJuez'

function EstadoVacio() {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white/90 p-12 text-center shadow-xl shadow-blue-950/10">
      <Clock className="mx-auto mb-4 h-16 w-16 text-blue-200" />
      <h2 className="text-xl font-semibold text-slate-800">No hay partidos activos</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        El organizador debe activar un partido para que aparezca aqui
      </p>
      <p className="mt-6 animate-pulse text-xs font-semibold text-cyan-600">
        Esperando partidos...
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
    <article className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-lg shadow-blue-950/10 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {partido.subcategoria?.nombre || 'Subcategoria'} · {partido.etiqueta_ronda}
        </p>
        {partido.cancha ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <MapPin className="h-3 w-3" />
            {partido.cancha}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
          <p className="break-words text-lg font-bold text-blue-700">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <p className="mt-1 break-words text-xs text-blue-500">
            {obtenerNombreRobot(partido.equipo_a)}
          </p>
        </div>
        <span className="text-xl font-black text-slate-300">VS</span>
        <div className="min-w-0 flex-1 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100 p-4 text-center">
          <p className="break-words text-lg font-bold text-cyan-800">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <p className="mt-1 break-words text-xs text-cyan-600">
            {obtenerNombreRobot(partido.equipo_b)}
          </p>
        </div>
      </div>

      <button
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-5 py-3 font-bold text-white transition-all hover:from-blue-800 hover:to-cyan-600"
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
    realtimeActivo,
  } = useJuez()

  function iniciarPartido(partidoId) {
    navigate(`/juez/${partidoId}`)
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.18),_transparent_26%),linear-gradient(180deg,_#eef4ff_0%,_#dff4f7_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-widest text-blue-700">
              MODULO DE JUECES
            </p>
            <IndicadorEnVivo activo={realtimeActivo} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Partidos activos</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Registra marcadores de forma rapida durante cada encuentro.
          </p>
        </header>

        {mensaje ? (
          <p className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-base font-semibold text-cyan-800">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          {cargando ? (
            <p className="rounded-3xl border border-blue-100 bg-white/90 p-6 text-center text-lg font-semibold text-slate-700 shadow-lg shadow-blue-950/10">
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
