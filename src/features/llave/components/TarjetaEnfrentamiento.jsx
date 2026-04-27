const etiquetasRonda = {
  treintaidosavos: 'Treintaidosavos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semifinal: 'Semifinal',
  final: 'Final',
  tercer_lugar: 'Tercer lugar',
}

function nombreEquipo(equipo, respaldo = 'Por definir') {
  return equipo?.nombre_equipo || equipo?.nombre || respaldo
}

function claseTarjeta(estado) {
  if (estado === 'activo') return 'border-2 border-cyan-500'
  if (estado === 'finalizado') return 'border border-gray-600'

  return 'border border-gray-600'
}

function FilaEquipo({
  color,
  equipo,
  ganador,
  goles,
  nombreRespaldo,
  perdedor,
  clasificadoPorBye = false,
}) {
  const colorPunto = color === 'azul' ? 'text-blue-400' : 'text-red-400'

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${
        ganador
          ? 'border-l-4 border-emerald-500 bg-emerald-950 font-bold text-emerald-400'
          : perdedor
            ? 'text-gray-600 line-through'
          : equipo
            ? 'text-gray-300'
            : 'text-gray-600 italic'
      }`}
    >
      <span className="min-w-0 truncate">
        <span className={colorPunto}>{'\u25CF'}</span> {nombreEquipo(equipo, nombreRespaldo)}
      </span>
      {clasificadoPorBye ? (
        <span className="rounded bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
          BYE
        </span>
      ) : null}
      {goles !== null && goles !== undefined ? (
        <span
          className={`font-mono ${
            ganador
              ? 'text-lg font-bold text-emerald-400'
              : 'text-base font-semibold text-gray-600 line-through'
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm">
      <span className="min-w-0 truncate font-semibold text-white">
        {nombreEquipo(equipo)}
      </span>
      <span className="rounded bg-gray-600 px-2 py-1 text-xs font-bold text-gray-300">
        BYE
      </span>
    </div>
  )
}

export function TarjetaEnfrentamiento({ enfrentamiento }) {
  if (!enfrentamiento) {
    return (
      <article className="w-56 rounded-xl border border-dashed border-gray-700 bg-gray-900 p-3 text-sm italic text-gray-600">
        Por definir
      </article>
    )
  }

  const resultadoVisible = enfrentamiento.estado === 'finalizado' && enfrentamiento.resultado
  const ganadorA = enfrentamiento.ganador_id === enfrentamiento.equipo_a_id
  const ganadorB = enfrentamiento.ganador_id === enfrentamiento.equipo_b_id
  const perdedorA = enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id && !ganadorA
  const perdedorB = enfrentamiento.estado === 'finalizado' && enfrentamiento.ganador_id && !ganadorB
  const esBye = enfrentamiento.bye && !enfrentamiento.equipo_b
  const clasificadoPorBye =
    !enfrentamiento.bye &&
    enfrentamiento.estado === 'pendiente' &&
    enfrentamiento.equipo_a &&
    !enfrentamiento.equipo_b
  const nombreA = enfrentamiento.equipo_a?.nombre_equipo
    ?? enfrentamiento.equipo_a_nombre
    ?? (enfrentamiento.equipo_a_id ? 'Equipo clasificado' : 'Por definir')
  const nombreB = enfrentamiento.equipo_b?.nombre_equipo
    ?? enfrentamiento.equipo_b_nombre
    ?? (enfrentamiento.bye ? 'BYE' : enfrentamiento.equipo_b_id ? 'Equipo clasificado' : 'Por definir')

  return (
    <article className={`w-56 rounded-xl bg-gray-800 p-3 ${claseTarjeta(enfrentamiento.estado)}`}>
      {enfrentamiento.estado === 'activo' ? (
        <span className="mb-2 inline-flex animate-pulse rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-bold text-black">
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
              clasificadoPorBye={clasificadoPorBye}
              ganador={ganadorA}
              goles={resultadoVisible ? enfrentamiento.resultado.goles_a : null}
              nombreRespaldo={nombreA}
              perdedor={perdedorA}
            />
            <FilaEquipo
              color="rojo"
              equipo={enfrentamiento.equipo_b}
              ganador={ganadorB}
              goles={resultadoVisible ? enfrentamiento.resultado.goles_b : null}
              nombreRespaldo={nombreB}
              perdedor={perdedorB}
            />
          </>
        )}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-normal text-gray-500">
        {enfrentamiento.cancha ? `${enfrentamiento.cancha} - ` : ''}
        {etiquetasRonda[enfrentamiento.ronda] || enfrentamiento.ronda}
      </p>
    </article>
  )
}
