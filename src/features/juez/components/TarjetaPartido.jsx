import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Wrench } from 'lucide-react'

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

function BotonAccion({ children, clase = '', disabled = false, onClick, type = 'button' }) {
  return (
    <button
      className={`h-10 rounded-xl px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${clase}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

function ControlMarcador({ color, goles, nombreEquipo, onDecrementar, onIncrementar }) {
  const claseNumero = color === 'azul' ? 'text-blue-100' : 'text-cyan-100'
  const claseBoton =
    color === 'azul'
      ? 'border-blue-400/30 bg-blue-500/15 text-blue-100 active:bg-blue-500/25'
      : 'border-cyan-400/30 bg-cyan-500/15 text-cyan-100 active:bg-cyan-500/25'

  return (
    <div className="flex flex-col items-center gap-1">
      <p className={`max-w-[7rem] truncate text-xs font-bold ${claseNumero}`}>
        {nombreEquipo}
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label={`Reducir marcador de ${nombreEquipo}`}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${claseBoton} disabled:cursor-not-allowed disabled:opacity-40`}
          disabled={goles === 0}
          onClick={onDecrementar}
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className={`w-14 text-center font-mono text-3xl font-bold ${claseNumero}`}>
          {goles}
        </div>
        <button
          aria-label={`Aumentar marcador de ${nombreEquipo}`}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${claseBoton}`}
          onClick={onIncrementar}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function TarjetaPartido({ alGuardarResultado, guardando, partido }) {
  const [golesA, setGolesA] = useState(0)
  const [golesB, setGolesB] = useState(0)
  const [errorLocal, setErrorLocal] = useState('')
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

  const hayEmpate = useMemo(() => golesA === golesB, [golesA, golesB])
  const nombreEquipoA = obtenerNombreEquipo(partido?.equipo_a, 'Equipo A')
  const nombreEquipoB = obtenerNombreEquipo(partido?.equipo_b, 'Equipo B')
  const timerActivo = [
    estadosTimer.primerTiempo,
    estadosTimer.descanso,
    estadosTimer.segundoTiempo,
  ].includes(timer.estado)
  const puedeSolicitarReparacion = timer.estado !== estadosTimer.finalizado && !reparacion.activa
  const tituloTimer = {
    [estadosTimer.descanso]: 'DESCANSO',
    [estadosTimer.descansoFinalizado]: 'DESCANSO COMPLETO',
    [estadosTimer.finalizado]: 'TIEMPO FINALIZADO',
    [estadosTimer.listo]: 'LISTO PARA INICIAR',
    [estadosTimer.primerTiempoFinalizado]: 'PRIMER TIEMPO TERMINADO',
    [estadosTimer.primerTiempo]: 'PRIMER TIEMPO',
    [estadosTimer.segundoTiempo]: 'SEGUNDO TIEMPO',
  }[timer.estado]

  useEffect(() => {
    if (!timerActivo || timer.pausado) return undefined

    const intervalo = window.setInterval(() => {
      setTimer((actual) => {
        if (actual.segundos > 1) {
          return {
            ...actual,
            segundos: actual.segundos - 1,
          }
        }

        if (actual.estado === estadosTimer.primerTiempo) {
          vibrar([500])
          return { estado: estadosTimer.primerTiempoFinalizado, pausado: false, segundos: 0 }
        }

        if (actual.estado === estadosTimer.descanso) {
          return { estado: estadosTimer.descansoFinalizado, pausado: false, segundos: 0 }
        }

        vibrar([1000, 200, 1000])
        return { estado: estadosTimer.finalizado, pausado: false, segundos: 0 }
      })
    }, 1000)

    return () => window.clearInterval(intervalo)
  }, [timer.pausado, timerActivo])

  useEffect(() => {
    if (!reparacion.activa) return undefined

    const intervalo = window.setInterval(() => {
      setReparacion((actual) => {
        if (actual.segundos > 1) {
          return { ...actual, segundos: actual.segundos - 1 }
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

    return () => window.clearInterval(intervalo)
  }, [reparacion.activa])

  useEffect(() => {
    if (!partido?.id) return

    localStorage.setItem(
      obtenerClaveReparacion(partido.id),
      JSON.stringify(reparacionesUsadas),
    )
  }, [partido?.id, reparacionesUsadas])

  if (!partido) return null

  function iniciarPrimerTiempo() {
    setTimer({ estado: estadosTimer.primerTiempo, pausado: false, segundos: DURACION_TIEMPO })
  }

  function terminarPrimerTiempo() {
    vibrar([500])
    setTimer({ estado: estadosTimer.primerTiempoFinalizado, pausado: false, segundos: 0 })
  }

  function iniciarDescanso() {
    setTimer({ estado: estadosTimer.descanso, pausado: false, segundos: DURACION_DESCANSO })
  }

  function iniciarSegundoTiempo() {
    setTimer({ estado: estadosTimer.segundoTiempo, pausado: false, segundos: DURACION_TIEMPO })
  }

  function finalizarPartido() {
    vibrar([1000, 200, 1000])
    setTimer({ estado: estadosTimer.finalizado, pausado: false, segundos: 0 })
  }

  function alternarPausa() {
    setTimer((actual) => ({ ...actual, pausado: !actual.pausado }))
  }

  function iniciarReparacion(equipo, nombreEquipo) {
    if (!puedeSolicitarReparacion || reparacionesUsadas[equipo]) return

    setTimer((actual) => ({ ...actual, pausado: true }))
    setReparacionesUsadas((actuales) => ({ ...actuales, [equipo]: true }))
    setReparacion({
      activa: true,
      equipo,
      nombreEquipo,
      segundos: DURACION_REPARACION,
    })
  }

  async function registrarResultado() {
    setErrorLocal('')

    if (hayEmpate) {
      setErrorLocal('Debe haber un ganador.')
      return
    }

    try {
      await alGuardarResultado({
        enfrentamiento: partido,
        golesA,
        golesB,
        observacion: '',
      })
    } catch (error) {
      setErrorLocal(error.message)
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/95 px-4 pb-4 pt-3 shadow-2xl shadow-black/30">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-lg font-bold text-blue-100">{nombreEquipoA}</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Azul</p>
        </div>
        <div className="shrink-0 text-sm font-black uppercase tracking-[0.22em] text-slate-500">
          VS
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-lg font-bold text-cyan-100">{nombreEquipoB}</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Cian</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
        <section className="flex max-h-32 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
            {tituloTimer}
          </p>
          <p className="mt-1 font-mono text-4xl font-bold text-white">
            {formatearTiempo(timer.segundos)}
          </p>
          {reparacion.activa ? (
            <p className="mt-1 text-xs font-semibold text-amber-200">
              Reparacion: {reparacion.nombreEquipo} · {formatearTiempo(reparacion.segundos)}
            </p>
          ) : null}
          <div className="mt-3 flex w-full items-center justify-center gap-2">
            {timer.estado === estadosTimer.listo ? (
              <BotonAccion
                clase="w-full bg-cyan-500 text-slate-950 active:bg-cyan-400"
                onClick={iniciarPrimerTiempo}
              >
                Iniciar
              </BotonAccion>
            ) : null}
            {timer.estado === estadosTimer.primerTiempo ? (
              <>
                <BotonAccion
                  clase="flex-1 border border-slate-700 bg-slate-800 text-slate-100 active:bg-slate-700"
                  onClick={alternarPausa}
                >
                  {timer.pausado ? 'Reanudar' : 'Pausar'}
                </BotonAccion>
                <BotonAccion
                  clase="flex-1 bg-amber-400 text-slate-950 active:bg-amber-300"
                  onClick={terminarPrimerTiempo}
                >
                  Terminar
                </BotonAccion>
              </>
            ) : null}
            {timer.estado === estadosTimer.primerTiempoFinalizado ? (
              <BotonAccion
                clase="w-full bg-amber-400 text-slate-950 active:bg-amber-300"
                onClick={iniciarDescanso}
              >
                Medio tiempo
              </BotonAccion>
            ) : null}
            {timer.estado === estadosTimer.descanso ? (
              <>
                <BotonAccion
                  clase="flex-1 border border-slate-700 bg-slate-800 text-slate-100 active:bg-slate-700"
                  onClick={alternarPausa}
                >
                  {timer.pausado ? 'Reanudar' : 'Pausar'}
                </BotonAccion>
                <BotonAccion
                  clase="flex-1 bg-cyan-500 text-slate-950 active:bg-cyan-400"
                  onClick={iniciarSegundoTiempo}
                >
                  Saltar
                </BotonAccion>
              </>
            ) : null}
            {timer.estado === estadosTimer.descansoFinalizado ? (
              <BotonAccion
                clase="w-full bg-cyan-500 text-slate-950 active:bg-cyan-400"
                onClick={iniciarSegundoTiempo}
              >
                Segundo tiempo
              </BotonAccion>
            ) : null}
            {timer.estado === estadosTimer.segundoTiempo ? (
              <>
                <BotonAccion
                  clase="flex-1 border border-slate-700 bg-slate-800 text-slate-100 active:bg-slate-700"
                  onClick={alternarPausa}
                >
                  {timer.pausado ? 'Reanudar' : 'Pausar'}
                </BotonAccion>
                <BotonAccion
                  clase="flex-1 bg-amber-400 text-slate-950 active:bg-amber-300"
                  onClick={finalizarPartido}
                >
                  Terminar
                </BotonAccion>
              </>
            ) : null}
            {timer.estado === estadosTimer.finalizado ? (
              <BotonAccion
                clase="w-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                disabled
              >
                Tiempo finalizado
              </BotonAccion>
            ) : null}
          </div>
        </section>

        <section className="flex h-24 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-2">
          <div className="flex flex-row items-center justify-center gap-8">
            <ControlMarcador
              color="azul"
              goles={golesA}
              nombreEquipo={nombreEquipoA}
              onDecrementar={() => setGolesA((actual) => Math.max(0, actual - 1))}
              onIncrementar={() => setGolesA((actual) => actual + 1)}
            />
            <ControlMarcador
              color="rojo"
              goles={golesB}
              nombreEquipo={nombreEquipoB}
              onDecrementar={() => setGolesB((actual) => Math.max(0, actual - 1))}
              onIncrementar={() => setGolesB((actual) => actual + 1)}
            />
          </div>
        </section>

        <section className="flex h-12 items-center gap-2">
          <button
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition ${
              reparacionesUsadas.equipoA
                ? 'border-slate-800 bg-slate-900 text-slate-500 line-through opacity-50'
                : 'border-blue-400/30 bg-blue-500/10 text-blue-100 active:bg-blue-500/20'
            }`}
            disabled={!puedeSolicitarReparacion || reparacionesUsadas.equipoA}
            onClick={() => iniciarReparacion('equipoA', nombreEquipoA)}
            type="button"
          >
            <Wrench className="h-3.5 w-3.5" />
            {nombreEquipoA}
          </button>
          <button
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition ${
              reparacionesUsadas.equipoB
                ? 'border-slate-800 bg-slate-900 text-slate-500 line-through opacity-50'
                : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100 active:bg-cyan-500/20'
            }`}
            disabled={!puedeSolicitarReparacion || reparacionesUsadas.equipoB}
            onClick={() => iniciarReparacion('equipoB', nombreEquipoB)}
            type="button"
          >
            <Wrench className="h-3.5 w-3.5" />
            {nombreEquipoB}
          </button>
        </section>

        {errorLocal ? (
          <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-200">
            {errorLocal}
          </p>
        ) : null}
      </div>

      <button
        className="mt-auto h-14 w-full rounded-2xl bg-emerald-500 px-4 text-base font-black text-slate-950 transition active:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500"
        disabled={guardando || hayEmpate}
        onClick={registrarResultado}
        type="button"
      >
        {guardando ? 'Guardando...' : 'Registrar resultado'}
      </button>
    </article>
  )
}
