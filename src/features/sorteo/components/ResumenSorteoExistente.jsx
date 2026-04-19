import { useBracketSorteo } from '../hooks/usarBracketSorteo'

const rondas = [
  { clave: 'cuartos', titulo: 'Cuartos de final', total: 4 },
  { clave: 'semifinal', titulo: 'Semifinales', total: 2 },
  { clave: 'final', titulo: 'Final', total: 1 },
]

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function ordenarPorRonda(enfrentamientos, ronda) {
  return enfrentamientos
    .filter((enfrentamiento) => enfrentamiento.ronda === ronda)
    .sort((a, b) => a.orden - b.orden)
}

function crearPartidoPendiente(orden, ronda, equipoA = null, equipoB = null) {
  return {
    equipo_a: equipoA,
    equipo_b: equipoB,
    estado: 'pendiente',
    ganador_id: null,
    id: `${ronda}-${orden}`,
    orden,
    resultado: null,
    ronda,
  }
}

function obtenerGanador(enfrentamiento) {
  if (!enfrentamiento?.ganador_id) return null

  if (enfrentamiento.equipo_a?.id === enfrentamiento.ganador_id) {
    return enfrentamiento.equipo_a
  }

  if (enfrentamiento.equipo_b?.id === enfrentamiento.ganador_id) {
    return enfrentamiento.equipo_b
  }

  return null
}

function completarRonda(enfrentamientos, ronda, total) {
  return Array.from({ length: total }).map((_, indice) => {
    const orden = indice + 1

    return (
      enfrentamientos.find((enfrentamiento) => enfrentamiento.orden === orden) ||
      crearPartidoPendiente(orden, ronda)
    )
  })
}

function construirRondas(enfrentamientos) {
  const cuartos = completarRonda(ordenarPorRonda(enfrentamientos, 'cuartos'), 'cuartos', 4)
  const semifinalesExistentes = ordenarPorRonda(enfrentamientos, 'semifinal')
  const finalExistente = ordenarPorRonda(enfrentamientos, 'final')
  const semifinales = semifinalesExistentes.length
    ? completarRonda(semifinalesExistentes, 'semifinal', 2)
    : [
        crearPartidoPendiente(1, 'semifinal', obtenerGanador(cuartos[0]), obtenerGanador(cuartos[1])),
        crearPartidoPendiente(2, 'semifinal', obtenerGanador(cuartos[2]), obtenerGanador(cuartos[3])),
      ]
  const final = finalExistente.length
    ? completarRonda(finalExistente, 'final', 1)
    : [
        crearPartidoPendiente(
          1,
          'final',
          obtenerGanador(semifinales[0]),
          obtenerGanador(semifinales[1]),
        ),
      ]

  return {
    cuartos,
    final,
    semifinal: semifinales,
  }
}

function obtenerMarcador(enfrentamiento, lado) {
  if (!enfrentamiento.resultado) return null

  return lado === 'a'
    ? enfrentamiento.resultado.goles_a
    : enfrentamiento.resultado.goles_b
}

function obtenerBola(enfrentamiento, lado) {
  const bola = lado === 'a' ? enfrentamiento.bola_a : enfrentamiento.bola_b

  return bola ? `#${bola}` : '-'
}

function FilaEquipo({ enfrentamiento, equipo, esBye = false, lado }) {
  const ganador = equipo?.id && equipo.id === enfrentamiento.ganador_id
  const marcador = obtenerMarcador(enfrentamiento, lado)
  const clases = esBye
    ? 'border-slate-200 bg-slate-100 text-slate-500'
    : ganador
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : 'border-slate-200 bg-white text-slate-700'

  return (
    <div className={`flex min-h-12 items-center gap-3 border px-3 py-2 ${clases}`}>
      <span className="w-8 text-xs font-bold uppercase tracking-normal">
        {esBye ? '-' : obtenerBola(enfrentamiento, lado)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {esBye ? 'BYE' : equipo?.nombre_equipo || 'Por definir'}
      </span>
      <span className="w-8 text-right text-sm font-bold">
        {marcador ?? ''}
      </span>
    </div>
  )
}

function TarjetaPartido({ enfrentamiento, indice, ronda }) {
  const mostrarByeB = enfrentamiento.bye && !enfrentamiento.equipo_b

  return (
    <article className="relative">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
          Partido {indice + 1}
        </p>
        <div className="overflow-hidden rounded-md">
          <FilaEquipo enfrentamiento={enfrentamiento} equipo={enfrentamiento.equipo_a} lado="a" />
          <FilaEquipo
            enfrentamiento={enfrentamiento}
            equipo={enfrentamiento.equipo_b}
            esBye={mostrarByeB}
            lado="b"
          />
        </div>
      </div>
      {ronda !== 'final' ? (
        <div className="absolute -right-6 top-1/2 hidden h-px w-6 bg-slate-300 lg:block" />
      ) : null}
    </article>
  )
}

function ColumnaRonda({ partidos, ronda, titulo }) {
  const espaciado = ronda === 'semifinal' ? 'lg:space-y-24' : ronda === 'final' ? 'lg:pt-32' : ''

  return (
    <section className={`space-y-4 ${espaciado}`}>
      <h2 className="text-center text-sm font-bold uppercase tracking-normal text-slate-500">
        {titulo}
      </h2>
      {partidos.map((partido, indice) => (
        <TarjetaPartido
          enfrentamiento={partido}
          indice={indice}
          key={partido.id}
          ronda={ronda}
        />
      ))}
    </section>
  )
}

export function ResumenSorteoExistente({ sorteo, subcategoriaId }) {
  const bracket = useBracketSorteo(subcategoriaId)

  if (!sorteo.length) {
    return null
  }

  const rondasConstruidas = construirRondas(bracket.enfrentamientos)

  return (
    <div className="space-y-5 rounded-md border border-emerald-200 bg-emerald-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-800">
          Sorteo registrado
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          Llave de eliminacion directa
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fecha: {formatearFecha(sorteo[0]?.fecha)}
        </p>
      </div>
      {bracket.cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Cargando bracket...
        </div>
      ) : bracket.mensaje ? (
        <div className="rounded-md border border-rose-200 bg-white p-5 text-sm text-rose-700">
          {bracket.mensaje}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-5">
          <div className="grid min-w-[980px] grid-cols-3 gap-12">
            {rondas.map((ronda) => (
              <ColumnaRonda
                key={ronda.clave}
                partidos={rondasConstruidas[ronda.clave]}
                ronda={ronda.clave}
                titulo={ronda.titulo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
