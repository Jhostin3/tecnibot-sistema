function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function claseEquipo(ganador) {
  return ganador
    ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    : 'border-slate-700 bg-slate-800/80 text-slate-200'
}

export function PartidoFinalizado({ alCerrar, partido }) {
  if (!partido) return null

  const ganoA = partido.ganador_id === partido.equipo_a_id
  const ganoB = partido.ganador_id === partido.equipo_b_id

  return (
    <article className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-xl shadow-black/20">
      <p className="text-base font-semibold uppercase tracking-normal text-cyan-200">
        Resultado registrado
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white">
        {partido.subcategoria?.nombre || 'Subcategoria'} - {partido.etiqueta_ronda}
      </h2>

      <div className="mt-6 grid gap-4">
        <div className={`rounded-2xl border p-5 ${claseEquipo(ganoA)}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="break-words text-lg font-bold">
                {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
              </p>
              {ganoA ? <p className="mt-1 text-base font-semibold text-cyan-200">Ganador</p> : null}
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
              {ganoB ? <p className="mt-1 text-base font-semibold text-cyan-200">Ganador</p> : null}
            </div>
            <p className="text-5xl font-black">{partido.goles_b}</p>
          </div>
        </div>
      </div>

      {partido.observacion ? (
        <p className="mt-5 rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-base text-slate-200">
          {partido.observacion}
        </p>
      ) : null}

      <button
        className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 text-lg font-bold text-slate-950 transition hover:from-cyan-400 hover:to-sky-300"
        onClick={alCerrar}
        type="button"
      >
        Volver a partidos activos
      </button>
    </article>
  )
}
