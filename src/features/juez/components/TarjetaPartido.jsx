function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function obtenerNombreRobot(equipo) {
  return equipo?.nombre_robot || 'Robot sin nombre registrado'
}

export function TarjetaPartido({ alRegistrar, partido }) {
  if (!partido) return null

  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
      <div className="space-y-2">
        <p className="text-base font-semibold uppercase tracking-normal text-gray-400">
          {partido.subcategoria?.nombre || 'Subcategoria'} - {partido.etiqueta_ronda}
        </p>
        <h2 className="text-2xl font-bold text-white">Partido #{partido.orden}</h2>
      </div>

      {partido.cancha ? (
        <p className="mt-5 rounded-2xl border border-cyan-400 bg-gray-900 p-4 text-lg font-bold text-cyan-200">
          Cancha: {partido.cancha}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="min-w-0 rounded-2xl border border-blue-400 bg-gray-900 p-4 text-center">
          <p className="break-words text-lg font-bold text-blue-400">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <p className="mt-2 break-words text-base text-gray-300">
            {obtenerNombreRobot(partido.equipo_a)}
          </p>
        </div>

        <span className="pt-5 text-lg font-black text-gray-400">VS</span>

        <div className="min-w-0 rounded-2xl border border-red-400 bg-gray-900 p-4 text-center">
          <p className="break-words text-lg font-bold text-red-400">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <p className="mt-2 break-words text-base text-gray-300">
            {obtenerNombreRobot(partido.equipo_b)}
          </p>
        </div>
      </div>

      <button
        className="mt-6 min-h-14 w-full rounded-2xl bg-cyan-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
        onClick={() => alRegistrar(partido)}
        type="button"
      >
        Registrar resultado
      </button>
    </article>
  )
}
