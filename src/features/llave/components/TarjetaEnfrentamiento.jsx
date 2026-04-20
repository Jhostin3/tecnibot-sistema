const etiquetasRonda = {
  treintaidosavos: 'Treintaidosavos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semifinal: 'Semifinal',
  final: 'Final',
}

function nombreEquipo(equipo) {
  return equipo?.nombre_equipo || 'Por definir'
}

function claseTarjeta(estado) {
  if (estado === 'activo') return 'border-2 border-cyan-400 animate-pulse'
  if (estado === 'finalizado') return 'border border-blue-700'

  return 'border border-blue-700'
}

function FilaEquipo({ color, equipo, ganador, goles }) {
  const colorPunto = color === 'azul' ? 'text-blue-400' : 'text-red-400'

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${
        ganador
          ? 'bg-emerald-900 font-bold text-emerald-400'
          : equipo
            ? 'text-blue-400 opacity-60'
            : 'text-blue-500 italic'
      }`}
    >
      <span className="min-w-0 truncate">
        <span className={colorPunto}>{'\u25CF'}</span> {nombreEquipo(equipo)}
      </span>
      {goles !== null && goles !== undefined ? (
        <span
          className={`font-mono ${
            ganador
              ? 'text-lg font-bold text-emerald-400'
              : 'text-base font-semibold text-blue-400 opacity-60'
          }`}
        >
          [{goles}]
        </span>
      ) : null}
    </div>
  )
}

function FilaBye({ equipo }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-blue-600 bg-blue-900 px-3 py-2 text-sm">
      <span className="min-w-0 truncate font-semibold text-white">
        {nombreEquipo(equipo)}
      </span>
      <span className="rounded bg-blue-700 px-2 py-1 text-xs font-bold text-blue-200">
        BYE
      </span>
    </div>
  )
}

export function TarjetaEnfrentamiento({ enfrentamiento }) {
  if (!enfrentamiento) {
    return (
      <article className="w-56 rounded-xl border border-dashed border-blue-600 bg-blue-900 p-3 text-sm italic text-blue-500">
        Por definir
      </article>
    )
  }

  const resultadoVisible = enfrentamiento.estado === 'finalizado' && enfrentamiento.resultado
  const ganadorA = enfrentamiento.ganador_id === enfrentamiento.equipo_a_id
  const ganadorB = enfrentamiento.ganador_id === enfrentamiento.equipo_b_id
  const esBye = enfrentamiento.bye && !enfrentamiento.equipo_b

  return (
    <article className={`w-56 rounded-xl bg-blue-800 p-3 ${claseTarjeta(enfrentamiento.estado)}`}>
      {enfrentamiento.estado === 'activo' ? (
        <span className="mb-2 inline-flex rounded-full bg-cyan-500 px-2 py-1 text-xs font-bold text-white">
          EN VIVO
        </span>
      ) : null}
      <div className="space-y-2">
        {esBye ? (
          <FilaBye equipo={enfrentamiento.equipo_a} />
        ) : (
          <>
            <FilaEquipo
              color="azul"
              equipo={enfrentamiento.equipo_a}
              ganador={ganadorA}
              goles={resultadoVisible ? enfrentamiento.resultado.goles_a : null}
            />
            <FilaEquipo
              color="rojo"
              equipo={enfrentamiento.equipo_b}
              ganador={ganadorB}
              goles={resultadoVisible ? enfrentamiento.resultado.goles_b : null}
            />
          </>
        )}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-normal text-blue-300">
        {enfrentamiento.cancha ? `${enfrentamiento.cancha} - ` : ''}
        {etiquetasRonda[enfrentamiento.ronda] || enfrentamiento.ronda}
      </p>
    </article>
  )
}
