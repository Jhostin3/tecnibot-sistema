import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerClaseMarcador({ golesA, golesB, lado }) {
  if (golesA === golesB) return 'text-slate-400'
  if (lado === 'a' && golesA > golesB) return 'text-blue-700'
  if (lado === 'b' && golesB > golesA) return 'text-cyan-700'

  return 'text-slate-700'
}

function ControlGoles({
  claseNumero,
  color,
  goles,
  onDecrementar,
  onIncrementar,
}) {
  const claseIncrementar =
    color === 'azul'
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-cyan-500 hover:bg-cyan-600'

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <button
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16"
        disabled={goles === 0}
        onClick={onDecrementar}
        type="button"
      >
        <Minus className="h-6 w-6" />
      </button>
      <span className={`min-w-16 text-center font-mono text-5xl font-bold sm:min-w-20 sm:text-6xl ${claseNumero}`}>
        {goles}
      </span>
      <button
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white transition sm:h-16 sm:w-16 ${claseIncrementar}`}
        onClick={onIncrementar}
        type="button"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

export function FormularioResultado({
  alCancelar,
  alGuardar,
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

  return (
    <form
      className="rounded-3xl border border-blue-100 bg-white/92 p-4 shadow-xl shadow-blue-950/10 sm:p-6"
      onSubmit={manejarEnvio}
    >
      {mostrarEncabezado ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="min-w-0 text-center">
            <p className="break-words text-xl font-bold text-blue-700">
              {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
            </p>
            <p className="mt-1 text-base text-blue-500">Azul</p>
          </div>
          <span className="pt-2 text-lg font-black text-slate-300">VS</span>
          <div className="min-w-0 text-center">
            <p className="break-words text-xl font-bold text-cyan-700">
              {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
            </p>
            <p className="mt-1 text-base text-cyan-600">Cian</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-500 sm:text-base">
            Marcador
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="space-y-3">
          <p className="text-center text-xs font-semibold text-blue-700 sm:text-base">
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
            onDecrementar={() => setGolesA((actual) => Math.max(0, actual - 1))}
            onIncrementar={() => setGolesA((actual) => actual + 1)}
          />
        </div>

        <span className="hidden text-center text-sm font-black tracking-[0.18em] text-slate-300 md:block">
          VS
        </span>

        <div className="space-y-3">
          <p className="text-center text-xs font-semibold text-cyan-700 sm:text-base">
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
            onDecrementar={() => setGolesB((actual) => Math.max(0, actual - 1))}
            onIncrementar={() => setGolesB((actual) => actual + 1)}
          />
        </div>
      </div>

      {hayEmpate || errorLocal ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700 sm:text-base">
          {errorLocal || 'Debe haber un ganador. Modifica el marcador.'}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        <button
          className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-5 py-3 text-base font-bold text-white transition hover:from-blue-800 hover:to-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:text-lg"
          disabled={formularioBloqueado}
          type="submit"
        >
          {guardando ? 'Guardando...' : 'Registrar resultado'}
        </button>
        {alCancelar ? (
          <button
            className="min-h-14 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-base font-bold text-blue-800 transition hover:bg-blue-100 sm:text-lg"
            onClick={alCancelar}
            type="button"
          >
            Volver a partidos
          </button>
        ) : null}
      </div>
    </form>
  )
}
