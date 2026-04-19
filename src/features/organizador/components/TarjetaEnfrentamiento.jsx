const estilosEstado = {
  activo: 'border-green-200 bg-green-50 text-green-700',
  finalizado: 'border-blue-200 bg-blue-50 text-blue-700',
  pendiente: 'border-slate-200 bg-slate-100 text-slate-600',
}

const etiquetasEstado = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  pendiente: 'Pendiente',
}

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerNombreRobot(equipo) {
  return equipo?.nombre_robot || 'Robot sin nombre'
}

function EquipoResumen({ color, equipo, respaldo }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className={`break-words text-lg font-bold ${color}`}>
        {obtenerNombreEquipo(equipo, respaldo)}
      </p>
      <p className="mt-1 break-words text-sm text-slate-500">
        {obtenerNombreRobot(equipo)}
      </p>
    </div>
  )
}

function ResultadoFinal({ partido }) {
  if (partido.estado !== 'finalizado' || !partido.resultado) return null

  return (
    <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4">
      <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">
        Resultado final
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950">
        {partido.resultado.goles_a} - {partido.resultado.goles_b}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Ganador: {partido.ganador?.nombre_equipo || 'Por confirmar'}
      </p>
    </div>
  )
}

export function TarjetaEnfrentamiento({
  alActivar,
  alDesactivar,
  guardando,
  partido,
}) {
  if (!partido) return null

  const estadoClase = estilosEstado[partido.estado] || estilosEstado.pendiente
  const estadoActivo = partido.estado === 'activo'

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
            {partido.subcategoria?.nombre || 'Subcategoria'} - {partido.etiqueta_ronda}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">
            Partido #{partido.orden}
          </h3>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold ${estadoClase} ${
            estadoActivo ? 'animate-pulse' : ''
          }`}
        >
          {etiquetasEstado[partido.estado] || partido.estado}
        </span>
      </div>

      {partido.cancha ? (
        <p className="mt-4 rounded-md border border-cyan-100 bg-cyan-50 px-4 py-3 text-base font-semibold text-cyan-800">
          Cancha: {partido.cancha}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <EquipoResumen color="text-blue-700" equipo={partido.equipo_a} respaldo="Equipo A" />
        <span className="hidden text-sm font-black text-slate-400 md:block">VS</span>
        <EquipoResumen color="text-red-700" equipo={partido.equipo_b} respaldo="Equipo B" />
      </div>

      <ResultadoFinal partido={partido} />

      {partido.estado === 'pendiente' ? (
        <button
          className="mt-5 min-h-10 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={guardando}
          onClick={() => alActivar(partido)}
          type="button"
        >
          Activar partido
        </button>
      ) : null}

      {partido.estado === 'activo' ? (
        <button
          className="mt-5 min-h-10 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={guardando}
          onClick={() => alDesactivar(partido.id)}
          type="button"
        >
          Desactivar
        </button>
      ) : null}
    </article>
  )
}
