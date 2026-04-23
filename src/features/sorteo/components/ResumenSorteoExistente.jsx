import { useBracketSorteo } from '../hooks/usarBracketSorteo'
import { obtenerResumenPodio } from '../../llave/utils/resumenPodio'

const ORDEN_RONDAS = [
  { clave: 'treintaidosavos', titulo: 'Treintaidosavos de final' },
  { clave: 'dieciseisavos', titulo: 'Dieciseisavos de final' },
  { clave: 'octavos', titulo: 'Octavos de final' },
  { clave: 'cuartos', titulo: 'Cuartos de final' },
  { clave: 'semifinal', titulo: 'Semifinales' },
  { clave: 'final', titulo: 'Final' },
]

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function ordenarPorRonda(enfrentamientos = [], ronda) {
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

function obtenerPerdedor(enfrentamiento) {
  if (!enfrentamiento?.ganador_id) return null

  if (enfrentamiento.equipo_a?.id === enfrentamiento.ganador_id) {
    return enfrentamiento.equipo_b || null
  }

  if (enfrentamiento.equipo_b?.id === enfrentamiento.ganador_id) {
    return enfrentamiento.equipo_a || null
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

function construirRondas(enfrentamientos = []) {
  const primerIndice = ORDEN_RONDAS.findIndex(({ clave }) =>
    ordenarPorRonda(enfrentamientos, clave).length,
  )

  if (primerIndice === -1) {
    return { rondas: [], tercer_lugar: [] }
  }

  const rondas = []

  ORDEN_RONDAS.slice(primerIndice).forEach(({ clave }, indice) => {
    const existentes = ordenarPorRonda(enfrentamientos, clave)

    if (indice === 0) {
      rondas.push({
        clave,
        partidos: completarRonda(existentes, clave, existentes.length),
        titulo: ORDEN_RONDAS[primerIndice].titulo,
      })
      return
    }

    const rondaAnterior = rondas[indice - 1]
    const totalEsperado = Math.max(1, Math.ceil(rondaAnterior.partidos.length / 2))

    if (existentes.length) {
      rondas.push({
        clave,
        partidos: completarRonda(existentes, clave, totalEsperado),
        titulo: ORDEN_RONDAS[primerIndice + indice].titulo,
      })
      return
    }

    const partidosInferidos = Array.from({ length: totalEsperado }).map((_, partidoIndice) =>
      crearPartidoPendiente(
        partidoIndice + 1,
        clave,
        obtenerGanador(rondaAnterior.partidos[partidoIndice * 2]),
        obtenerGanador(rondaAnterior.partidos[partidoIndice * 2 + 1]),
      ),
    )

    rondas.push({
      clave,
      partidos: partidosInferidos,
      titulo: ORDEN_RONDAS[primerIndice + indice].titulo,
    })
  })

  const semifinales = rondas.find((ronda) => ronda.clave === 'semifinal')?.partidos || []
  const tercerLugarExistente = ordenarPorRonda(enfrentamientos, 'tercer_lugar')
  const tercerLugar = tercerLugarExistente.length
    ? completarRonda(tercerLugarExistente, 'tercer_lugar', 1)
    : semifinales.length === 2 && semifinales.every((partido) => partido.ganador_id)
      ? [
          crearPartidoPendiente(
            1,
            'tercer_lugar',
            obtenerPerdedor(semifinales[0]),
            obtenerPerdedor(semifinales[1]),
          ),
        ]
      : []

  return {
    rondas,
    tercer_lugar: tercerLugar,
  }
}

function obtenerCampeonAutomatico(enfrentamientos = []) {
  if (
    enfrentamientos.length !== 1 ||
    enfrentamientos[0].ronda !== 'final' ||
    !enfrentamientos[0].bye ||
    !enfrentamientos[0].ganador_id
  ) {
    return null
  }

  return enfrentamientos[0].equipo_a?.id === enfrentamientos[0].ganador_id
    ? enfrentamientos[0].equipo_a
    : enfrentamientos[0].equipo_b
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
  const clasificadoPorBye =
    !enfrentamiento.bye &&
    enfrentamiento.estado === 'pendiente' &&
    lado === 'a' &&
    enfrentamiento.equipo_a &&
    !enfrentamiento.equipo_b
  const clases = esBye
    ? 'border-slate-200 bg-slate-100 text-slate-500'
    : ganador
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : enfrentamiento.estado === 'activo'
        ? 'border-cyan-200 bg-cyan-50 text-cyan-900'
        : 'border-slate-200 bg-white text-slate-700'

  return (
    <div className={`flex min-h-12 items-center gap-3 border px-3 py-2 ${clases}`}>
      <span className="w-8 text-xs font-bold uppercase tracking-normal">
        {esBye ? '-' : obtenerBola(enfrentamiento, lado)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {esBye ? 'BYE' : equipo?.nombre_equipo || 'Por definir'}
      </span>
      {clasificadoPorBye ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          BYE
        </span>
      ) : null}
      {enfrentamiento.estado === 'activo' && !marcador ? (
        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
          Activo
        </span>
      ) : null}
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
  const espaciado =
    ronda === 'semifinal'
      ? 'lg:space-y-24'
      : ronda === 'final'
        ? 'lg:pt-32'
        : ''

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

function TarjetaPosicion({ descripcion, equipo, etiqueta }) {
  if (!equipo) return null

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
        {etiqueta}
      </p>
      <p className="mt-3 text-lg font-bold text-slate-950">{equipo.nombre_equipo}</p>
      {equipo.nombre_robot ? (
        <p className="mt-1 text-sm text-slate-500">Robot: {equipo.nombre_robot}</p>
      ) : null}
      <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
    </article>
  )
}

export function ResumenSorteoExistente({ sorteo = [], subcategoriaId }) {
  const bracket = useBracketSorteo(subcategoriaId)

  if (!sorteo || !sorteo.length) {
    return null
  }

  const rondasConstruidas = construirRondas(bracket.enfrentamientos)
  const campeonAutomatico = obtenerCampeonAutomatico(bracket.enfrentamientos)
  const final = rondasConstruidas.rondas.find((ronda) => ronda.clave === 'final')?.partidos?.[0] || null
  const podio = obtenerResumenPodio(
    bracket.enfrentamientos,
    final ? obtenerGanador(final) : null,
    Boolean(campeonAutomatico),
  )
  const partidoTercerLugar = rondasConstruidas.tercer_lugar[0] || null

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
      ) : campeonAutomatico ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-normal text-amber-700">
            Campeon automatico
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-950">
            {campeonAutomatico.nombre_equipo}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Robot: {campeonAutomatico.nombre_robot || 'Sin nombre registrado'}
          </p>
          <p className="mt-3 text-sm text-amber-700">
            Campeon por walkover - unico equipo inscrito
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto overscroll-x-contain rounded-md border border-slate-200 bg-white p-5 pb-6 [scrollbar-gutter:stable]">
            <div className="grid min-w-[980px] grid-flow-col gap-12 sm:min-w-max">
              {rondasConstruidas.rondas.map((ronda) => (
                <ColumnaRonda
                  key={ronda.clave}
                  partidos={ronda.partidos}
                  ronda={ronda.clave}
                  titulo={ronda.titulo}
                />
              ))}
            </div>
          </div>

          {partidoTercerLugar ? (
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-center text-sm font-bold uppercase tracking-normal text-slate-500">
                Tercer lugar
              </h3>
              <div className="mx-auto mt-5 max-w-sm">
                <TarjetaPartido
                  enfrentamiento={partidoTercerLugar}
                  indice={0}
                  ronda="tercer_lugar"
                />
              </div>
              {partidoTercerLugar.estado === 'finalizado' && podio.tercerLugar ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <TarjetaPosicion
                    descripcion="Posicion final"
                    equipo={podio.tercerLugar}
                    etiqueta="Tercer lugar"
                  />
                  <TarjetaPosicion
                    descripcion="Posicion final"
                    equipo={podio.cuartoLugar}
                    etiqueta="Cuarto lugar"
                  />
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
