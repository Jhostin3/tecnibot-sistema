import { Clock, MapPin, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { IndicadorEnVivo } from '../../../components/molecules/IndicadorEnVivo'
import { useJuez } from '../hooks/usarJuez'

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerNombreRobot(equipo) {
  return equipo?.nombre_robot || 'Robot sin nombre'
}

function EstadoPanel({ cuentaRegresiva, estadoVista }) {
  if (estadoVista === 'preparando_siguiente_ronda') {
    return (
      <div className="rounded-[2rem] border border-amber-400/40 bg-slate-900/95 p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
        <Clock className="mx-auto mb-4 h-14 w-14 text-amber-300" />
        <h2 className="text-2xl font-black text-amber-100">Preparando siguiente ronda...</h2>
        <p className="mt-2 text-base leading-7 text-amber-200/80">
          Ronda completada. Siguiente ronda en {cuentaRegresiva}...
        </p>
      </div>
    )
  }

  if (estadoVista === 'esperando_torneo') {
    return (
      <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/95 p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
        <Clock className="mx-auto mb-4 h-16 w-16 text-cyan-300/70" />
        <h2 className="text-2xl font-bold text-slate-100">Esperando que inicie el torneo</h2>
        <p className="mt-2 text-base leading-7 text-slate-300/75">
          Los partidos de la primera ronda apareceran aqui automaticamente cuando el torneo arranque.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
      <Clock className="mx-auto mb-4 h-16 w-16 text-slate-500" />
      <h2 className="text-2xl font-bold text-slate-100">No hay partidos activos</h2>
      <p className="mt-2 text-base leading-7 text-slate-400">
        Todavia no hay una ronda disponible para arbitrar.
      </p>
    </div>
  )
}

function TarjetaPartidoSimple({ alIniciar, indice, partido, total }) {
  return (
    <article className="w-full rounded-[2rem] border border-slate-700 bg-slate-900/95 p-4 shadow-2xl shadow-black/25 transition-all sm:p-6 sm:hover:-translate-y-0.5 sm:hover:border-cyan-400/50 sm:hover:shadow-cyan-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-cyan-200">
            {partido.etiqueta_ronda}
          </p>
          <p className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
            Partido {indice} de {total}
          </p>
        </div>
        {partido.cancha ? (
          <p className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-200">
            <MapPin className="h-3 w-3" />
            {partido.cancha}
          </p>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          {partido.subcategoria?.nombre || 'Subcategoria'}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 rounded-[1.6rem] border border-blue-400/40 bg-gradient-to-br from-blue-900/80 to-blue-700/50 p-4 text-center shadow-lg shadow-blue-950/20">
          <p className="break-words text-xl font-black text-blue-100">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <p className="mt-1 break-words text-xs text-blue-200/75">
            {obtenerNombreRobot(partido.equipo_a)}
          </p>
        </div>
        <span className="text-lg font-black tracking-[0.18em] text-slate-400">VS</span>
        <div className="min-w-0 flex-1 rounded-[1.6rem] border border-cyan-400/40 bg-gradient-to-br from-cyan-900/75 to-cyan-700/45 p-4 text-center shadow-lg shadow-cyan-950/20">
          <p className="break-words text-xl font-black text-cyan-100">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <p className="mt-1 break-words text-xs text-cyan-200/75">
            {obtenerNombreRobot(partido.equipo_b)}
          </p>
        </div>
      </div>

      <button
        className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-[1.35rem] bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-black text-slate-950 transition-all active:from-cyan-400 active:to-sky-300"
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
    cuentaRegresiva,
    error,
    estadoVista,
    mensaje,
    partidos,
    realtimeActivo,
    rondaActual,
  } = useJuez()

  function iniciarPartido(partidoId) {
    navigate(`/juez/${partidoId}`)
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_20%),radial-gradient(circle_at_20%_0%,_rgba(250,204,21,0.08),_transparent_18%),linear-gradient(180deg,_#020617_0%,_#0f172a_24%,_#111827_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-slate-700/80 bg-slate-900/90 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black tracking-[0.22em] text-cyan-200">
              MODULO DE JUECES
            </p>
            {rondaActual ? (
              <p className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black tracking-[0.22em] text-amber-200">
                {rondaActual.etiqueta_ronda.toUpperCase()}
              </p>
            ) : null}
            </div>
            <IndicadorEnVivo
              activo={realtimeActivo}
              className="border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[1.75rem] font-black leading-tight text-white sm:text-3xl">
                {estadoVista === 'ronda_activa'
                  ? 'Partidos de la ronda activa'
                  : 'Panel de arbitraje'}
              </h1>
              <p className="mt-2 hidden max-w-2xl text-base leading-7 text-slate-300 sm:block">
                Registra marcadores de forma rapida y deja que el avance de rondas se actualice solo.
              </p>
            </div>
            {rondaActual ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center shadow-lg shadow-black/20">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                  Ronda actual
                </p>
                <p className="mt-1 text-base font-black text-amber-100">
                  {rondaActual.etiqueta_ronda}
                </p>
                {partidos.length ? (
                  <p className="mt-1 text-sm text-amber-100/80">
                    Partido 1 de {partidos.length}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        {mensaje ? (
          <p className="rounded-[1.6rem] border border-cyan-400/25 bg-cyan-500/10 p-4 text-base font-semibold text-cyan-100 shadow-lg shadow-cyan-950/10">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-[1.6rem] border border-red-400/25 bg-red-500/10 p-4 text-base font-semibold text-red-200 shadow-lg shadow-red-950/10">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          {cargando ? (
            <p className="rounded-[2rem] border border-slate-700 bg-slate-900/95 p-6 text-center text-lg font-semibold text-slate-200 shadow-2xl shadow-black/25">
              Cargando estado de la ronda...
            </p>
          ) : null}

          {!cargando && partidos.length === 0 ? (
            <EstadoPanel cuentaRegresiva={cuentaRegresiva} estadoVista={estadoVista} />
          ) : null}

          {!cargando && partidos.length > 0
            ? partidos.map((partido, indice) => (
                <TarjetaPartidoSimple
                  alIniciar={iniciarPartido}
                  indice={indice + 1}
                  key={partido.id}
                  partido={partido}
                  total={partidos.length}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  )
}
