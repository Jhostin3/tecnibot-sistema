import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerClaseMarcador({ golesA, golesB, lado }) {
  if (golesA === golesB) return 'text-gray-400'
  if (lado === 'a' && golesA > golesB) return 'text-blue-400'
  if (lado === 'b' && golesB > golesA) return 'text-red-400'

  return 'text-white'
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
      ? 'bg-blue-600 hover:bg-blue-500'
      : 'bg-red-600 hover:bg-red-500'

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-700 text-xl font-bold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={goles === 0}
        onClick={onDecrementar}
        type="button"
      >
        <Minus className="h-6 w-6" />
      </button>
      <span className={`min-w-20 text-center font-mono text-6xl font-bold ${claseNumero}`}>
        {goles}
      </span>
      <button
        className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white transition ${claseIncrementar}`}
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
  const [observacion, setObservacion] = useState('')
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
        observacion,
      })
    } catch (error) {
      setErrorLocal(error.message)
    }
  }

  return (
    <form
      className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl"
      onSubmit={manejarEnvio}
    >
      {mostrarEncabezado ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="min-w-0 text-center">
            <p className="break-words text-xl font-bold text-blue-400">
              {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
            </p>
            <p className="mt-1 text-base text-gray-400">Azul</p>
          </div>
          <span className="pt-2 text-lg font-black text-gray-400">VS</span>
          <div className="min-w-0 text-center">
            <p className="break-words text-xl font-bold text-red-400">
              {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
            </p>
            <p className="mt-1 text-base text-gray-400">Rojo</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base font-black uppercase tracking-normal text-gray-400">
            Marcador
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="space-y-4">
          <p className="text-center text-base font-semibold text-blue-400">
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

        <span className="hidden text-center text-xl font-black text-gray-500 md:block">
          VS
        </span>

        <div className="space-y-4">
          <p className="text-center text-base font-semibold text-red-400">
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

      <label className="mt-8 block text-base font-semibold text-gray-200">
        Observacion
        <textarea
          className="mt-3 min-h-28 w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-base text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
          onChange={(evento) => setObservacion(evento.target.value)}
          placeholder="Detalle opcional del partido"
          value={observacion}
        />
      </label>

      {hayEmpate || errorLocal ? (
        <p className="mt-4 rounded-xl border border-red-800 bg-red-950 p-3 text-base font-semibold text-red-400">
          {errorLocal || 'Debe haber un ganador. Modifica el marcador.'}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        <button
          className="h-14 w-full rounded-xl bg-emerald-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
          disabled={formularioBloqueado}
          type="submit"
        >
          {guardando ? 'Guardando...' : 'Registrar resultado'}
        </button>
        {alCancelar ? (
          <button
            className="h-14 rounded-xl bg-gray-700 px-5 py-3 text-lg font-bold text-white transition hover:bg-gray-600"
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
