import { useEffect, useState } from 'react'

function obtenerTituloPartido(partido) {
  if (!partido) return ''

  return `${partido.subcategoria?.nombre || 'Subcategoria'} - ${partido.etiqueta_ronda}`
}

export function ModalActivarPartido({
  alCerrar,
  alConfirmar,
  canchas,
  guardando,
  partido,
}) {
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('')
  const [canchaPersonalizada, setCanchaPersonalizada] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setCanchaSeleccionada(canchas[0] || '')
    setCanchaPersonalizada('')
    setError('')
  }, [canchas, partido?.id])

  if (!partido) return null

  async function confirmarActivacion() {
    const canchaFinal = canchaPersonalizada.trim() || canchaSeleccionada.trim()

    if (!canchaFinal) {
      setError('Selecciona o escribe una cancha.')
      return
    }

    setError('')

    try {
      await alConfirmar(partido.id, canchaFinal)
      alCerrar()
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
              Activar partido
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {obtenerTituloPartido(partido)}
            </h2>
          </div>
          <button
            className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            onClick={alCerrar}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6">
          <p className="text-base font-semibold text-slate-700">Selecciona cancha</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canchas.map((cancha) => (
              <button
                className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  canchaSeleccionada === cancha && !canchaPersonalizada
                    ? 'border-cyan-700 bg-cyan-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                key={cancha}
                onClick={() => {
                  setCanchaSeleccionada(cancha)
                  setCanchaPersonalizada('')
                }}
                type="button"
              >
                {cancha}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block text-base font-semibold text-slate-700">
          Cancha personalizada
          <input
            className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
            onChange={(evento) => setCanchaPersonalizada(evento.target.value)}
            placeholder="Dojo A, Ring Central..."
            type="text"
            value={canchaPersonalizada}
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-10 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={alCerrar}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="min-h-10 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={guardando}
            onClick={confirmarActivacion}
            type="button"
          >
            {guardando ? 'Activando...' : 'Confirmar activacion'}
          </button>
        </div>
      </div>
    </div>
  )
}
