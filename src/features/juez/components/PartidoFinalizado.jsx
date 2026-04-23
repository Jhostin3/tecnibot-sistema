function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function claseEquipo(ganador) {
  return ganador
    ? 'border-cyan-200 bg-cyan-50 text-cyan-900'
    : 'border-blue-100 bg-blue-50 text-slate-700'
}

export function PartidoFinalizado({ alCerrar, partido }) {
  if (!partido) return null

  const ganoA = partido.ganador_id === partido.equipo_a_id
  const ganoB = partido.ganador_id === partido.equipo_b_id

  return (
    <article className="rounded-3xl border border-blue-100 bg-white/92 p-6 shadow-xl shadow-blue-950/10">
      <p className="text-base font-semibold uppercase tracking-normal text-cyan-700">
        Resultado registrado
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {partido.subcategoria?.nombre || 'Subcategoria'} - {partido.etiqueta_ronda}
      </h2>

      <div className="mt-6 grid gap-4">
        <div className={`rounded-2xl border p-5 ${claseEquipo(ganoA)}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="break-words text-lg font-bold">
                {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
              </p>
              {ganoA ? <p className="mt-1 text-base font-semibold text-cyan-700">Ganador</p> : null}
            </div>
            <p className="text-5xl font-black">{partido.goles_a}</p>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${claseEquipo(ganoB)}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="break-words text-lg font-bold">
                {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
              </p>
              {ganoB ? <p className="mt-1 text-base font-semibold text-cyan-700">Ganador</p> : null}
            </div>
            <p className="text-5xl font-black">{partido.goles_b}</p>
          </div>
        </div>
      </div>

      {partido.observacion ? (
        <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-base text-slate-700">
          {partido.observacion}
        </p>
      ) : null}

      <button
        className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-5 py-3 text-lg font-bold text-white transition hover:from-blue-800 hover:to-cyan-600"
        onClick={alCerrar}
        type="button"
      >
        Volver a partidos activos
      </button>
    </article>
  )
}
