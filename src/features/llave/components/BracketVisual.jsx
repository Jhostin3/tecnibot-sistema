import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TarjetaEnfrentamiento } from './TarjetaEnfrentamiento'
import { obtenerResumenPodio } from '../utils/resumenPodio'

const ORDEN_RONDAS = [
  'treintaidosavos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinal',
  'final',
]

const etiquetasRonda = {
  treintaidosavos: 'Treintaidosavos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos',
  cuartos: 'Cuartos',
  semifinal: 'Semifinal',
  final: 'Final',
}

function agruparPorRonda(enfrentamientos) {
  return enfrentamientos.reduce((grupos, enfrentamiento) => {
    if (!grupos[enfrentamiento.ronda]) {
      grupos[enfrentamiento.ronda] = []
    }

    grupos[enfrentamiento.ronda].push(enfrentamiento)
    return grupos
  }, {})
}

function crearTarjetaPendiente(ronda, indice) {
  return {
    enfrentamiento: null,
    id: `${ronda}-pendiente-${indice}`,
  }
}

function crearRondasBracket(grupos) {
  const primeraRonda = ORDEN_RONDAS.findIndex((ronda) => grupos[ronda]?.length)
  const indiceInicial = primeraRonda === -1 ? ORDEN_RONDAS.indexOf('semifinal') : primeraRonda
  let cantidadEsperada = 0

  return ORDEN_RONDAS.slice(indiceInicial).map((ronda) => {
    const partidos = [...(grupos[ronda] || [])].sort((a, b) => a.orden - b.orden)
    const cantidad = partidos.length || Math.max(1, Math.ceil(cantidadEsperada / 2))
    cantidadEsperada = cantidad

    return {
      partidos: partidos.length
        ? partidos.map((enfrentamiento) => ({
            enfrentamiento,
            id: enfrentamiento.id,
          }))
        : Array.from({ length: cantidad }).map((_, indice) =>
            crearTarjetaPendiente(ronda, indice),
          ),
      ronda,
    }
  })
}

function agruparPartidosPorPares(partidos) {
  return partidos.reduce((pares, partido, indice) => {
    if (indice % 2 === 0) {
      pares.push([partido])
      return pares
    }

    pares[pares.length - 1].push(partido)
    return pares
  }, [])
}

function crearRutaConector(origenA, origenB, destino) {
  const xInicioA = origenA.x + origenA.width
  const yA = origenA.y + origenA.height / 2
  const xInicioB = origenB.x + origenB.width
  const yB = origenB.y + origenB.height / 2
  const xMedio = (xInicioA + destino.x) / 2
  const yMedio = (yA + yB) / 2
  const xFin = destino.x
  const yFin = destino.y + destino.height / 2

  return `
    M ${xInicioA} ${yA} H ${xMedio} V ${yMedio}
    M ${xInicioB} ${yB} H ${xMedio} V ${yMedio}
    M ${xMedio} ${yMedio} H ${xFin} V ${yFin}
  `
}

function esCampeonAutomatico(enfrentamientos = []) {
  return (
    enfrentamientos.length === 1 &&
    enfrentamientos[0].ronda === 'final' &&
    enfrentamientos[0].bye &&
    enfrentamientos[0].ganador_id
  )
}

function TarjetaPosicion({ colorClase, equipo, etiqueta }) {
  if (!equipo) return null

  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-900/70 p-4">
      <p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${colorClase}`}>
        {etiqueta}
      </p>
      <p className="mt-4 text-lg font-bold text-white">{equipo.nombre_equipo}</p>
      {equipo.nombre_robot ? (
        <p className="mt-1 text-sm text-gray-400">Robot: {equipo.nombre_robot}</p>
      ) : null}
    </article>
  )
}

export function BracketVisual({ enfrentamientos }) {
  const grupos = useMemo(
    () => agruparPorRonda(enfrentamientos || []),
    [enfrentamientos],
  )
  const contenedorRef = useRef(null)
  const tarjetasRef = useRef(new Map())
  const [conectores, setConectores] = useState([])
  const [tamanoSvg, setTamanoSvg] = useState({ alto: 0, ancho: 0 })
  const rondas = useMemo(() => crearRondasBracket(grupos), [grupos])
  const campeonAutomatico = esCampeonAutomatico(enfrentamientos)
  const partidoTercerLugar = useMemo(
    () =>
      [...(grupos.tercer_lugar || [])].sort((a, b) => a.orden - b.orden)[0] || null,
    [grupos],
  )
  const podio = useMemo(
    () => obtenerResumenPodio(enfrentamientos, grupos.final?.[0]?.ganador || null, campeonAutomatico),
    [campeonAutomatico, enfrentamientos, grupos.final],
  )

  const registrarTarjeta = useCallback((clave, nodo) => {
    if (nodo) {
      tarjetasRef.current.set(clave, nodo)
      return
    }

    tarjetasRef.current.delete(clave)
  }, [])

  const medirConectores = useCallback(() => {
    const contenedor = contenedorRef.current

    if (!contenedor) return

    const rectContenedor = contenedor.getBoundingClientRect()
    const posiciones = new Map()

    tarjetasRef.current.forEach((nodo, clave) => {
      const rect = nodo.getBoundingClientRect()

      posiciones.set(clave, {
        height: rect.height,
        width: rect.width,
        x: rect.left - rectContenedor.left,
        y: rect.top - rectContenedor.top,
      })
    })

    const rutas = []

    rondas.slice(0, -1).forEach((ronda, indiceRonda) => {
      const rondaDestino = rondas[indiceRonda + 1]

      rondaDestino.partidos.forEach((destino, indiceDestino) => {
        const origenA = ronda.partidos[indiceDestino * 2]
        const origenB = ronda.partidos[indiceDestino * 2 + 1]

        if (!origenA || !origenB) return

        const rectA = posiciones.get(origenA.id)
        const rectB = posiciones.get(origenB.id)
        const rectDestino = posiciones.get(destino.id)

        if (!rectA || !rectB || !rectDestino) return

        rutas.push(crearRutaConector(rectA, rectB, rectDestino))
      })
    })

    setTamanoSvg({
      alto: contenedor.scrollHeight,
      ancho: contenedor.scrollWidth,
    })
    setConectores(rutas)
  }, [rondas])

  useEffect(() => {
    medirConectores()

    const contenedor = contenedorRef.current
    const observador = new ResizeObserver(medirConectores)

    if (contenedor) {
      observador.observe(contenedor)
    }

    window.addEventListener('resize', medirConectores)

    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medirConectores)
    }
  }, [medirConectores])

  if (campeonAutomatico) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="w-full overflow-x-auto pb-4">
        <div
          className="relative flex min-w-max items-start gap-24 overflow-visible p-8"
          ref={contenedorRef}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0 z-10"
            height={tamanoSvg.alto}
            width={tamanoSvg.ancho}
          >
            {conectores.map((ruta, indice) => (
              <path
                d={ruta}
                fill="none"
                key={`conector-${indice}`}
                stroke="#4b5563"
                strokeWidth="2"
              />
            ))}
          </svg>

          {rondas.map((ronda) => {
            const gruposDePartidos = agruparPartidosPorPares(ronda.partidos)

            return (
              <section className="relative z-20 space-y-4" key={ronda.ronda}>
                <div className="mb-4 border-b border-gray-700 pb-2">
                  <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    {etiquetasRonda[ronda.ronda] || ronda.ronda}
                  </h2>
                </div>
                <div className="flex flex-col gap-8">
                  {gruposDePartidos.map((grupo, indiceGrupo) => (
                    <div
                      className="flex flex-col gap-8"
                      key={`${ronda.ronda}-grupo-${indiceGrupo}`}
                    >
                      {grupo.map((partido) => (
                        <div
                          key={partido.id}
                          ref={(nodo) => registrarTarjeta(partido.id, nodo)}
                        >
                          <TarjetaEnfrentamiento enfrentamiento={partido.enfrentamiento} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {partidoTercerLugar ? (
        <section className="rounded-3xl border border-gray-700 bg-gray-900/70 p-6">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400">
            Tercer lugar
          </h2>
          <div className="mt-5 flex justify-center">
            <TarjetaEnfrentamiento enfrentamiento={partidoTercerLugar} />
          </div>
          {partidoTercerLugar.estado === 'finalizado' && podio.tercerLugar ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TarjetaPosicion
                colorClase="bg-amber-700 text-amber-100"
                equipo={podio.tercerLugar}
                etiqueta="Tercer lugar"
              />
              <TarjetaPosicion
                colorClase="bg-slate-700 text-slate-100"
                equipo={podio.cuartoLugar}
                etiqueta="Cuarto lugar"
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
