import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

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
    if (!esTiempoJuego || reparacionesUsadas[equipo]) return

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
    <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-300">
          {partido.subcategoria?.nombre || 'Subcategoria'} - {partido.etiqueta_ronda}
        </p>
        {partido.cancha ? (
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400">
            <MapPin className="h-4 w-4" />
            {partido.cancha}
          </p>
        ) : null}
      </div>

      <h2 className="mt-4 text-2xl font-bold text-white">Partido #{partido.orden}</h2>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="min-w-0 rounded-2xl border border-blue-800 bg-blue-950 p-4 text-center">
          <p className="break-words text-lg font-bold text-blue-400">
            {nombreEquipoA}
          </p>
          <p className="mt-2 break-words text-sm text-gray-400">
            {obtenerNombreRobot(partido.equipo_a)}
          </p>
        </div>

        <span className="pt-5 text-xl font-black text-gray-600">VS</span>

        <div className="min-w-0 rounded-2xl border border-red-800 bg-red-950 p-4 text-center">
          <p className="break-words text-lg font-bold text-red-400">
            {nombreEquipoB}
          </p>
          <p className="mt-2 break-words text-sm text-gray-400">
            {obtenerNombreRobot(partido.equipo_b)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center">
        <p
          className={`text-lg font-black uppercase tracking-normal ${
            timer.estado === estadosTimer.descanso ? 'text-amber-400' : 'text-white'
          }`}
        >
          {tituloTimer}
        </p>

        {timer.estado === estadosTimer.listo ? (
          <button
            className="mt-5 h-12 w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
            onClick={iniciarPrimerTiempo}
            type="button"
          >
            Iniciar primer tiempo
          </button>
        ) : null}

        {timerActivo ? (
          <>
            <p
              className={`mt-4 font-mono font-bold ${
                timer.estado === estadosTimer.descanso
                  ? 'text-amber-400 text-4xl'
                  : 'text-6xl text-cyan-400'
              }`}
            >
              {formatearTiempo(timer.segundos)}
            </p>
            {timer.estado === estadosTimer.descanso ? (
              <p className="mt-3 text-base font-semibold text-gray-400">
                Cambio de cancha
              </p>
            ) : null}
          </>
        ) : null}

        {timer.estado === estadosTimer.primerTiempoFinalizado ? (
          <div className="mt-5 space-y-4">
            <p className="text-base font-semibold text-gray-400">
              Primer tiempo terminado - cambio de cancha
            </p>
            <button
              className="h-12 w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
              onClick={iniciarMedioTiempo}
              type="button"
            >
              Iniciar medio tiempo (30s)
            </button>
          </div>
        ) : null}

        {timer.estado === estadosTimer.descansoFinalizado ? (
          <button
            className="mt-5 h-12 w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
            onClick={iniciarSegundoTiempo}
            type="button"
          >
            Iniciar segundo tiempo
          </button>
        ) : null}

        {timer.estado === estadosTimer.finalizado ? (
          <p className="mt-5 text-base font-semibold text-gray-400">
            Tiempo finalizado
          </p>
        ) : null}

        {esTiempoJuego ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              className="h-12 rounded-xl bg-gray-700 px-5 py-3 font-bold text-white transition hover:bg-gray-600"
              onClick={alternarPausa}
              type="button"
            >
              {timer.pausado ? 'Reanudar' : 'Pausar'}
            </button>
            <button
              className="h-12 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
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
          <div className="mt-5 rounded-2xl border border-amber-700 bg-amber-950 p-4">
            <p className="text-base font-black uppercase tracking-normal text-amber-400">
              Reparacion - {reparacion.nombreEquipo}
            </p>
            <p className="mt-3 font-mono text-4xl font-bold text-amber-400">
              {formatearTiempo(reparacion.segundos)}
            </p>
            <button
              className="mt-4 h-12 w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400"
              onClick={terminarReparacion}
              type="button"
            >
              Terminar reparacion
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          className="min-h-14 rounded-xl border border-amber-700 bg-amber-950 px-5 py-3 text-left text-base font-bold text-amber-400 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:line-through"
          disabled={!esTiempoJuego || reparacion.activa || reparacionesUsadas.equipoA}
          onClick={() => iniciarReparacion('equipoA', nombreEquipoA)}
          type="button"
        >
          {reparacionesUsadas.equipoA
            ? `Reparacion usada - ${nombreEquipoA}`
            : `Reparacion ${nombreEquipoA}`}
        </button>
        <button
          className="min-h-14 rounded-xl border border-amber-700 bg-amber-950 px-5 py-3 text-right text-base font-bold text-amber-400 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:line-through"
          disabled={!esTiempoJuego || reparacion.activa || reparacionesUsadas.equipoB}
          onClick={() => iniciarReparacion('equipoB', nombreEquipoB)}
          type="button"
        >
          {reparacionesUsadas.equipoB
            ? `Reparacion usada - ${nombreEquipoB}`
            : `Reparacion ${nombreEquipoB}`}
        </button>
      </div>

      <div className="mt-6">
        <FormularioResultado
          alGuardar={alGuardarResultado}
          guardando={guardando}
          mostrarEncabezado={false}
          partido={partido}
        />
      </div>
    </article>
  )
}
