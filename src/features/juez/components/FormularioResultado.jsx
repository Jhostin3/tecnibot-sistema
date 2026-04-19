import { useMemo, useState } from 'react'

function limpiarNumero(valor) {
  return valor.replace(/\D/g, '')
}

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

export function FormularioResultado({ alCancelar, alGuardar, guardando, partido }) {
  const [golesA, setGolesA] = useState('0')
  const [golesB, setGolesB] = useState('0')
  const [observacion, setObservacion] = useState('')
  const [errorLocal, setErrorLocal] = useState('')

  const hayEmpate = useMemo(
    () => Number(golesA || 0) === Number(golesB || 0),
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
        golesA: Number(golesA || 0),
        golesB: Number(golesB || 0),
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

      <div className="mt-8 grid grid-cols-[1fr_1fr] gap-5">
        <label className="flex flex-col items-center gap-3 text-base font-semibold text-blue-400">
          Goles A
          <input
            className="h-24 w-24 rounded-2xl border-2 border-blue-400 bg-gray-700 text-center text-5xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-400/30"
            inputMode="numeric"
            min="0"
            onChange={(evento) => setGolesA(limpiarNumero(evento.target.value) || '0')}
            pattern="[0-9]*"
            type="text"
            value={golesA}
          />
        </label>

        <label className="flex flex-col items-center gap-3 text-base font-semibold text-red-400">
          Goles B
          <input
            className="h-24 w-24 rounded-2xl border-2 border-red-400 bg-gray-700 text-center text-5xl font-bold text-white outline-none focus:ring-4 focus:ring-red-400/30"
            inputMode="numeric"
            min="0"
            onChange={(evento) => setGolesB(limpiarNumero(evento.target.value) || '0')}
            pattern="[0-9]*"
            type="text"
            value={golesB}
          />
        </label>
      </div>

      <label className="mt-8 block text-base font-semibold text-gray-200">
        Observacion
        <textarea
          className="mt-3 min-h-28 w-full rounded-2xl border border-gray-600 bg-gray-700 p-4 text-base text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
          onChange={(evento) => setObservacion(evento.target.value)}
          placeholder="Detalle opcional del partido"
          value={observacion}
        />
      </label>

      {hayEmpate || errorLocal ? (
        <p className="mt-4 rounded-2xl border border-red-500 bg-red-900 p-4 text-base font-semibold text-red-300">
          {errorLocal || 'Debe haber un ganador. Modifica el marcador.'}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        <button
          className="min-h-14 rounded-2xl bg-cyan-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
          disabled={formularioBloqueado}
          type="submit"
        >
          {guardando ? 'Guardando...' : 'Registrar resultado'}
        </button>
        <button
          className="min-h-14 rounded-2xl bg-gray-700 px-5 py-3 text-lg font-bold text-white transition hover:bg-gray-600"
          onClick={alCancelar}
          type="button"
        >
          Volver a partidos
        </button>
      </div>
    </form>
  )
}
