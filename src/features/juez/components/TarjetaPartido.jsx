import { useEffect, useState } from 'react'
import { MapPin, X } from 'lucide-react'

import { FormularioResultado } from './FormularioResultado'

const DURACION_TIEMPO = 90
const DURACION_DESCANSO = 30
const DURACION_REPARACION = 60
const estadosTimer = {
  descanso: 'descanso',
  descansoFinalizado: 'descanso_finalizado',
  finalizado: 'finalizado',
  listo: 'listo',
  primerTiempoFinalizado: 'primer_tiempo_finalizado',
  primerTiempo: 'primer_tiempo',
  segundoTiempo: 'segundo_tiempo',
}

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerNombreRobot(equipo) {
  return equipo?.nombre_robot || 'Robot sin nombre registrado'
}

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const segundosRestantes = segundos % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`
}

function vibrar(patron) {
  if ('vibrate' in navigator) {
    navigator.vibrate(patron)
  }
}

function obtenerClaveReparacion(partidoId) {
  return `reparacion_${partidoId}`
}

function obtenerReparacionesGuardadas(partidoId) {
  try {
    const reparaciones = JSON.parse(
      localStorage.getItem(obtenerClaveReparacion(partidoId)) || '{}',
    )

    return {
      equipoA: Boolean(reparaciones.equipoA),
      equipoB: Boolean(reparaciones.equipoB),
    }
  } catch {
    return {
      equipoA: false,
      equipoB: false,
    }
  }
}

export function TarjetaPartido({ alGuardarResultado, guardando, partido }) {
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [timer, setTimer] = useState({
    estado: estadosTimer.listo,
    pausado: false,
    segundos: DURACION_TIEMPO,
  })
  const [reparacion, setReparacion] = useState({
    activa: false,
    equipo: null,
    nombreEquipo: '',
    segundos: DURACION_REPARACION,
  })
  const [reparacionesUsadas, setReparacionesUsadas] = useState(() =>
    obtenerReparacionesGuardadas(partido?.id),
  )
  const timerActivo = [
    estadosTimer.primerTiempo,
    estadosTimer.descanso,
    estadosTimer.segundoTiempo,
  ].includes(timer.estado)

  useEffect(() => {
    if (!timerActivo || timer.pausado) return undefined

    const intervalo = setInterval(() => {
      setTimer((actual) => {
        if (actual.segundos > 1) {
          return {
            ...actual,
            segundos: actual.segundos - 1,
          }
        }

        if (actual.estado === estadosTimer.primerTiempo) {
          vibrar([500])

          return {
            estado: estadosTimer.primerTiempoFinalizado,
            pausado: false,
            segundos: 0,
          }
        }

        if (actual.estado === estadosTimer.descanso) {
          return {
            estado: estadosTimer.descansoFinalizado,
            pausado: false,
            segundos: 0,
          }
        }

        vibrar([1000, 200, 1000])

        return {
          estado: estadosTimer.finalizado,
          pausado: false,
          segundos: 0,
        }
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [timer.pausado, timerActivo])

  useEffect(() => {
    if (!reparacion.activa) return undefined

    const intervalo = setInterval(() => {
      setReparacion((actual) => {
        if (actual.segundos > 1) {
          return {
            ...actual,
            segundos: actual.segundos - 1,
          }
        }

        setTimer((timerActual) => ({
          ...timerActual,
          pausado: false,
        }))

        return {
          activa: false,
          equipo: null,
          nombreEquipo: '',
          segundos: DURACION_REPARACION,
        }
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [reparacion.activa])

  useEffect(() => {
    if (!partido?.id) return

    localStorage.setItem(
      obtenerClaveReparacion(partido.id),
      JSON.stringify(reparacionesUsadas),
    )
  }, [partido?.id, reparacionesUsadas])

  useEffect(() => {
    if (!sheetAbierto) return undefined

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflowAnterior
    }
  }, [sheetAbierto])

  if (!partido) return null

  function iniciarPrimerTiempo() {
    setTimer({
      estado: estadosTimer.primerTiempo,
      pausado: false,
      segundos: DURACION_TIEMPO,
    })
  }

  function terminarPrimerTiempo() {
    vibrar([500])
    setTimer({
      estado: estadosTimer.primerTiempoFinalizado,
      pausado: false,
      segundos: 0,
    })
  }

  function iniciarMedioTiempo() {
    setTimer({
      estado: estadosTimer.descanso,
      pausado: false,
      segundos: DURACION_DESCANSO,
    })
  }

  function iniciarSegundoTiempo() {
    setTimer({
      estado: estadosTimer.segundoTiempo,
      pausado: false,
      segundos: DURACION_TIEMPO,
    })
  }

  function finalizarPartido() {
    vibrar([1000, 200, 1000])
    setTimer({
      estado: estadosTimer.finalizado,
      pausado: false,
      segundos: 0,
    })
  }

  function alternarPausa() {
    setTimer((actual) => ({
      ...actual,
      pausado: !actual.pausado,
    }))
  }

  function iniciarReparacion(equipo, nombreEquipo) {
    if (!puedeSolicitarReparacion || reparacionesUsadas[equipo]) return

    setTimer((actual) => ({
      ...actual,
      pausado: true,
    }))
    setReparacionesUsadas((actuales) => ({
      ...actuales,
      [equipo]: true,
    }))
    setReparacion({
      activa: true,
      equipo,
      nombreEquipo,
      segundos: DURACION_REPARACION,
    })
  }

  function terminarReparacion() {
    setReparacion({
      activa: false,
      equipo: null,
      nombreEquipo: '',
      segundos: DURACION_REPARACION,
    })
    setTimer((actual) => ({
      ...actual,
      pausado: false,
    }))
  }

  const esTiempoJuego = [estadosTimer.primerTiempo, estadosTimer.segundoTiempo].includes(
    timer.estado,
  )
  const puedeSolicitarReparacion =
    timer.estado !== estadosTimer.finalizado &&
    !reparacion.activa
  const tituloTimer = {
    [estadosTimer.descanso]: 'Medio tiempo',
    [estadosTimer.descansoFinalizado]: 'Medio tiempo finalizado',
    [estadosTimer.finalizado]: 'Tiempo finalizado',
    [estadosTimer.listo]: 'Listo para iniciar',
    [estadosTimer.primerTiempoFinalizado]: 'Primer tiempo terminado',
    [estadosTimer.primerTiempo]: 'Primer tiempo',
    [estadosTimer.segundoTiempo]: 'Segundo tiempo',
  }[timer.estado]
  const nombreEquipoA = obtenerNombreEquipo(partido.equipo_a, 'Equipo A')
  const nombreEquipoB = obtenerNombreEquipo(partido.equipo_b, 'Equipo B')

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/95 p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-6">
        <div className="sticky -top-1 z-10 -mx-4 border-b border-slate-700 bg-slate-900/95 px-4 pb-4 pt-1 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                {partido.etiqueta_ronda}
              </p>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Partido en curso
                </p>
                <h2 className="mt-1 text-2xl font-black text-white sm:mt-2 sm:text-3xl">
                  Partido #{partido.orden}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-300 sm:text-base">
                  {partido.subcategoria?.nombre || 'Subcategoria'}
                </p>
              </div>
            </div>
            {partido.cancha ? (
              <p className="inline-flex items-center gap-1 self-start rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-200">
                <MapPin className="h-4 w-4" />
                {partido.cancha}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:mt-5 sm:gap-3">
            <div className="min-w-0 rounded-2xl border border-blue-400/40 bg-gradient-to-br from-blue-900/80 to-blue-700/50 p-3 text-center shadow-lg shadow-blue-950/20 sm:rounded-3xl sm:p-5">
              <p className="break-words text-lg font-black text-blue-100 sm:text-xl">
                {nombreEquipoA}
              </p>
              <p className="mt-1 hidden break-words text-sm text-blue-200/75 sm:block">
                {obtenerNombreRobot(partido.equipo_a)}
              </p>
            </div>

            <span className="px-1 py-1 text-center text-base font-black tracking-[0.1em] text-slate-400 sm:pt-3 sm:text-lg">
              VS
            </span>

            <div className="min-w-0 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-900/75 to-cyan-700/45 p-3 text-center shadow-lg shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
              <p className="break-words text-lg font-black text-cyan-100 sm:text-xl">
                {nombreEquipoB}
              </p>
              <p className="mt-1 hidden break-words text-sm text-cyan-200/75 sm:block">
                {obtenerNombreRobot(partido.equipo_b)}
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <div className="sm:hidden">
              <button
                className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-black text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                onClick={() => setSheetAbierto(true)}
                type="button"
              >
                Abrir marcador
              </button>
            </div>

            <div className="hidden sm:block">
              <FormularioResultado
                alGuardar={alGuardarResultado}
                guardando={guardando}
                mostrarEncabezado={false}
                partido={partido}
              />
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-center text-white shadow-lg shadow-black/20 sm:mt-5 sm:p-6">
            <div className="mb-3 flex items-center justify-center sm:hidden">
              <p className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                {partido.etiqueta_ronda} - Partido {partido.orden}
              </p>
            </div>
            <p
              className={`text-sm font-black uppercase tracking-[0.18em] sm:text-lg ${
                timer.estado === estadosTimer.descanso ? 'text-amber-200' : 'text-cyan-100'
              }`}
            >
              {tituloTimer}
            </p>

            {timer.estado === estadosTimer.listo ? (
              <button
                className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                onClick={iniciarPrimerTiempo}
                type="button"
              >
                Iniciar primer tiempo
              </button>
            ) : null}

            {timerActivo ? (
              <>
                <p
                  className={`mt-2 font-mono font-bold ${
                    timer.estado === estadosTimer.descanso
                      ? 'text-amber-200 text-3xl sm:text-5xl'
                      : 'text-cyan-100 text-4xl sm:text-7xl'
                  }`}
                >
                  {formatearTiempo(timer.segundos)}
                </p>
                {timer.estado === estadosTimer.descanso ? (
                  <p className="mt-3 text-sm font-semibold text-amber-200 sm:text-base">
                    Cambio de cancha
                  </p>
                ) : null}
              </>
            ) : null}

            {timer.estado === estadosTimer.primerTiempoFinalizado ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm font-semibold text-amber-100 sm:text-base">
                  Primer tiempo terminado - cambio de cancha
                </p>
                <button
                  className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                  onClick={iniciarMedioTiempo}
                  type="button"
                >
                  Iniciar medio tiempo (30s)
                </button>
              </div>
            ) : null}

            {timer.estado === estadosTimer.descansoFinalizado ? (
              <button
                className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                onClick={iniciarSegundoTiempo}
                type="button"
              >
                Iniciar segundo tiempo
              </button>
            ) : null}

            {timer.estado === estadosTimer.finalizado ? (
              <p className="mt-5 text-sm font-semibold text-cyan-100 sm:text-base">
                Tiempo finalizado
              </p>
            ) : null}

            {esTiempoJuego ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  className="min-h-14 rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3 text-base font-bold text-slate-100 transition active:border-cyan-400/30 active:bg-slate-700"
                  onClick={alternarPausa}
                  type="button"
                >
                  {timer.pausado ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  className="min-h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                  onClick={
                    timer.estado === estadosTimer.primerTiempo
                      ? terminarPrimerTiempo
                      : finalizarPartido
                  }
                  type="button"
                >
                  {timer.estado === estadosTimer.primerTiempo
                    ? 'Terminar primer tiempo'
                    : 'Terminar segundo tiempo'}
                </button>
              </div>
            ) : null}

            {reparacion.activa ? (
              <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-100 sm:text-base">
                  Reparacion - {reparacion.nombreEquipo}
                </p>
                <p className="mt-3 font-mono text-4xl font-bold text-cyan-100 sm:text-5xl">
                  {formatearTiempo(reparacion.segundos)}
                </p>
                <button
                  className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300"
                  onClick={terminarReparacion}
                  type="button"
                >
                  Terminar reparacion
                </button>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2">
              <button
                className="min-h-14 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-left text-sm font-bold text-blue-100 transition active:bg-blue-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:line-through sm:px-5 sm:text-base"
                disabled={!puedeSolicitarReparacion || reparacionesUsadas.equipoA}
                onClick={() => iniciarReparacion('equipoA', nombreEquipoA)}
                type="button"
              >
                {reparacionesUsadas.equipoA
                  ? `Reparacion usada - ${nombreEquipoA}`
                  : `Reparacion ${nombreEquipoA}`}
              </button>
              <button
                className="min-h-14 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-left text-sm font-bold text-cyan-100 transition active:bg-cyan-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:line-through sm:px-5 sm:text-right sm:text-base"
                disabled={!puedeSolicitarReparacion || reparacionesUsadas.equipoB}
                onClick={() => iniciarReparacion('equipoB', nombreEquipoB)}
                type="button"
              >
                {reparacionesUsadas.equipoB
                  ? `Reparacion usada - ${nombreEquipoB}`
                  : `Reparacion ${nombreEquipoB}`}
              </button>
            </div>
          </div>
        </div>
      </article>

      {sheetAbierto ? (
        <div className="sm:hidden">
          <button
            aria-label="Cerrar marcador"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSheetAbierto(false)}
            type="button"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border-t border-slate-700 bg-slate-900 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-20px_60px_rgba(2,6,23,0.8)]">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-700" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-black uppercase tracking-[0.18em] text-cyan-200">
                  Registrar resultado
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {partido.etiqueta_ronda} - Partido #{partido.orden}
                </p>
              </div>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600 bg-slate-800 text-slate-200"
                onClick={() => setSheetAbierto(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FormularioResultado
              alCancelar={() => setSheetAbierto(false)}
              alGuardar={async (payload) => {
                await alGuardarResultado(payload)
                setSheetAbierto(false)
              }}
              esBottomSheet
              guardando={guardando}
              partido={partido}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
