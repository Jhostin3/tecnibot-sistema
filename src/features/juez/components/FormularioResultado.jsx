import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerClaseMarcador({ golesA, golesB, lado }) {
  if (golesA === golesB) return 'text-slate-400'
  if (lado === 'a' && golesA > golesB) return 'text-blue-200'
  if (lado === 'b' && golesB > golesA) return 'text-cyan-200'

  return 'text-slate-200'
}

function ControlGoles({
  claseNumero,
  color,
  goles,
  nombreEquipo,
  onCambiar,
  onDecrementar,
  onIncrementar,
}) {
  const claseIncrementar =
    color === 'azul'
      ? 'bg-blue-500 active:bg-blue-400'
      : 'bg-cyan-500 active:bg-cyan-400'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <button
          aria-label={`Reducir marcador de ${nombreEquipo}`}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600 bg-slate-800 text-xl font-bold text-slate-300 transition active:border-slate-500 active:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16"
          disabled={goles === 0}
          onClick={onDecrementar}
          type="button"
        >
          <Minus className="h-6 w-6" />
        </button>

        <input
          className={`h-16 w-24 rounded-2xl border border-slate-600 bg-slate-950 px-3 text-center font-mono text-4xl font-bold outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 sm:h-20 sm:w-28 sm:text-5xl ${claseNumero}`}
          inputMode="numeric"
          min="0"
          onChange={(evento) => onCambiar(evento.target.value)}
          pattern="[0-9]*"
          type="number"
          value={goles}
        />

        <button
          aria-label={`Aumentar marcador de ${nombreEquipo}`}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white transition sm:h-16 sm:w-16 ${claseIncrementar}`}
          onClick={onIncrementar}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export function FormularioResultado({
  alCancelar,
  alGuardar,
  esBottomSheet = false,
  guardando,
  mostrarEncabezado = true,
  partido,
}) {
  const [golesA, setGolesA] = useState(0)
  const [golesB, setGolesB] = useState(0)
  const [errorLocal, setErrorLocal] = useState('')

  const hayEmpate = useMemo(
    () => golesA === golesB,
    [golesA, golesB],
  )
  const formularioBloqueado = guardando || hayEmpate

  if (!partido) return null

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrorLocal('')

    if (hayEmpate) {
      setErrorLocal('Debe haber un ganador. Modifica el marcador.')
      return
    }

    try {
      await alGuardar({
        enfrentamiento: partido,
        golesA,
        golesB,
        observacion: '',
      })
    } catch (error) {
      setErrorLocal(error.message)
    }
  }

  function cambiarGolesA(valor) {
    const numero = Number.parseInt(valor, 10)
    setGolesA(Number.isNaN(numero) || numero < 0 ? 0 : numero)
  }

  function cambiarGolesB(valor) {
    const numero = Number.parseInt(valor, 10)
    setGolesB(Number.isNaN(numero) || numero < 0 ? 0 : numero)
  }

  const claseContenedor = esBottomSheet
    ? 'rounded-t-[2rem] border-0 bg-transparent p-0 shadow-none'
    : 'rounded-3xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl shadow-black/20 sm:p-6'

  return (
    <form
      className={claseContenedor}
      onSubmit={manejarEnvio}
    >
      {mostrarEncabezado ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="min-w-0 text-center">
            <p className="break-words text-lg font-bold text-blue-100 sm:text-xl">
              {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
            </p>
            <p className="mt-1 text-sm text-blue-300 sm:text-base">Azul</p>
          </div>
          <span className="pt-2 text-base font-black tracking-[0.18em] text-slate-500">VS</span>
          <div className="min-w-0 text-center">
            <p className="break-words text-lg font-bold text-cyan-100 sm:text-xl">
              {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
            </p>
            <p className="mt-1 text-sm text-cyan-300 sm:text-base">Cian</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base font-black uppercase tracking-[0.18em] text-cyan-200">
            Marcador
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-blue-200 sm:text-base">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <ControlGoles
            claseNumero={obtenerClaseMarcador({
              golesA,
              golesB,
              lado: 'a',
            })}
            color="azul"
            goles={golesA}
            nombreEquipo={obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
            onCambiar={cambiarGolesA}
            onDecrementar={() => setGolesA((actual) => Math.max(0, actual - 1))}
            onIncrementar={() => setGolesA((actual) => actual + 1)}
          />
        </div>

        <span className="hidden text-center text-base font-black tracking-[0.18em] text-slate-300 md:block">
          VS
        </span>

        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-cyan-200 sm:text-base">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <ControlGoles
            claseNumero={obtenerClaseMarcador({
              golesA,
              golesB,
              lado: 'b',
            })}
            color="rojo"
            goles={golesB}
            nombreEquipo={obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
            onCambiar={cambiarGolesB}
            onDecrementar={() => setGolesB((actual) => Math.max(0, actual - 1))}
            onIncrementar={() => setGolesB((actual) => actual + 1)}
          />
        </div>
      </div>

      {hayEmpate || errorLocal ? (
        <p className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200 sm:text-base">
          {errorLocal || 'Debe haber un ganador. Modifica el marcador.'}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        <button
          className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-base font-bold text-slate-950 transition active:from-cyan-400 active:to-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:text-lg"
          disabled={formularioBloqueado}
          type="submit"
        >
          {guardando ? 'Guardando...' : 'Guardar resultado'}
        </button>
        {alCancelar ? (
          <button
            className="min-h-14 rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3 text-base font-bold text-slate-100 transition active:border-cyan-400/30 active:bg-slate-700 sm:text-lg"
            onClick={alCancelar}
            type="button"
          >
            Cerrar marcador
          </button>
        ) : null}
      </div>
    </form>
  )
}
