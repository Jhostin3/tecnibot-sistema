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
  if (estado === 'activo') return 'border-cyan-500 animate-pulse'
  if (estado === 'finalizado') return 'border-gray-600'

  return 'border-gray-700'
}

function FilaEquipo({ color, equipo, ganador, goles, mostrarBye }) {
  if (mostrarBye) {
    return (
      <div className="rounded-md bg-gray-700 px-3 py-2 text-sm italic text-gray-400">
        BYE
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${
        ganador
          ? 'border border-green-500 bg-green-900 font-bold text-green-400'
          : equipo
            ? 'text-gray-300'
            : 'text-gray-500'
      }`}
    >
      <span className="min-w-0 truncate">
        <span className={color}>{color === 'text-blue-400' ? 'Azul' : 'Rojo'}</span>{' '}
        {nombreEquipo(equipo)}
      </span>
      {goles !== null && goles !== undefined ? (
        <span className="font-mono text-base font-bold">[{goles}]</span>
      ) : null}
    </div>
  )
}

export function TarjetaEnfrentamiento({ enfrentamiento }) {
  if (!enfrentamiento) {
    return (
      <article className="w-64 rounded-lg border border-dashed border-gray-700 bg-gray-800 p-3 text-gray-500">
        Por definir
      </article>
    )
  }

  const resultadoVisible = enfrentamiento.estado === 'finalizado' && enfrentamiento.resultado
  const ganadorA = enfrentamiento.ganador_id === enfrentamiento.equipo_a_id
  const ganadorB = enfrentamiento.ganador_id === enfrentamiento.equipo_b_id

  return (
    <article className={`w-64 rounded-lg border bg-gray-800 p-3 ${claseTarjeta(enfrentamiento.estado)}`}>
      <div className="space-y-2">
        <FilaEquipo
          color="text-blue-400"
          equipo={enfrentamiento.equipo_a}
          ganador={ganadorA}
          goles={resultadoVisible ? enfrentamiento.resultado.goles_a : null}
        />
        <FilaEquipo
          color="text-red-400"
          equipo={enfrentamiento.equipo_b}
          ganador={ganadorB}
          goles={resultadoVisible ? enfrentamiento.resultado.goles_b : null}
          mostrarBye={enfrentamiento.bye && !enfrentamiento.equipo_b}
        />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-normal text-gray-500">
        {enfrentamiento.cancha ? `${enfrentamiento.cancha} · ` : ''}
        {etiquetasRonda[enfrentamiento.ronda] || enfrentamiento.ronda}
      </p>
    </article>
  )
}
