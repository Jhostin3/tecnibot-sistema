import { useState } from 'react'

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerTituloRonda(partidos) {
  const primerPartido = partidos[0]

  if (!primerPartido) return 'Ronda'

  return `${primerPartido.subcategoria?.nombre || 'Subcategoria'} · ${primerPartido.etiqueta_ronda}`
}

function crearAsignacionesIniciales(partidos, canchas) {
  return partidos.reduce((asignaciones, partido, indice) => {
    asignaciones[partido.id] = canchas.length ? canchas[indice % canchas.length] : ''
    return asignaciones
  }, {})
}

export function ModalActivarRonda({
  alCerrar,
  alConfirmar,
  canchas,
  guardando,
  partidos,
}) {
  const [asignaciones, setAsignaciones] = useState(() =>
    crearAsignacionesIniciales(partidos || [], canchas || []),
  )
  const [error, setError] = useState('')

  if (!partidos?.length) return null

  const tituloRonda = obtenerTituloRonda(partidos)

  function cambiarCancha(partidoId, cancha) {
    setAsignaciones((actuales) => ({
      ...actuales,
      [partidoId]: cancha,
    }))
  }

  async function confirmarRonda() {
    setError('')

    try {
      await alConfirmar(
        partidos.map((partido) => ({
          cancha: asignaciones[partido.id] || '',
          id: partido.id,
        })),
      )
      alCerrar()
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
              Activar ronda
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Activar ronda - {tituloRonda}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              ¿Activar {partidos.length} partidos de {tituloRonda}?
            </p>
          </div>
          <button
            className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            onClick={alCerrar}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200">
          {partidos.map((partido) => (
            <div className="grid gap-3 bg-white p-4 md:grid-cols-[1fr_220px] md:items-center" key={partido.id}>
              <div>
                <p className="text-base font-bold text-slate-950">
                  Partido #{partido.orden}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')} vs{' '}
                  {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
                </p>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Cancha
                <select
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                  onChange={(evento) => cambiarCancha(partido.id, evento.target.value)}
                  value={asignaciones[partido.id] || ''}
                >
                  <option value="">Sin cancha</option>
                  {canchas.map((cancha) => (
                    <option key={cancha} value={cancha}>
                      {cancha}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

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
            onClick={confirmarRonda}
            type="button"
          >
            {guardando ? 'Activando...' : 'Activar ronda completa'}
          </button>
        </div>
      </div>
    </div>
  )
}
