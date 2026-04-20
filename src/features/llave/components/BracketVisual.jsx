import { TarjetaEnfrentamiento } from './TarjetaEnfrentamiento'

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

function ConectoresRonda({ cantidad, visible }) {
  if (!visible) return null

  const cantidadPares = Math.max(1, Math.ceil(cantidad / 2))

  return (
    <div className="hidden w-12 flex-col gap-6 pt-9 md:flex">
      {Array.from({ length: cantidadPares }).map((_, indice) => (
        <div className="grid h-32 grid-rows-2" key={`conector-${indice}`}>
          <div className="border-r border-t border-gray-600" />
          <div className="border-r border-b border-gray-600" />
          <div className="relative -mt-16 h-0 border-t border-gray-600" />
        </div>
      ))}
    </div>
  )
}

export function BracketVisual({ enfrentamientos }) {
  if (!enfrentamientos?.length) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
        Aun no hay enfrentamientos generados para esta subcategoria.
      </div>
    )
  }

  const grupos = agruparPorRonda(enfrentamientos)
  const rondas = ORDEN_RONDAS.filter((ronda) => grupos[ronda]?.length)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {rondas.map((ronda, indiceRonda) => {
          const partidos = [...grupos[ronda]].sort((a, b) => a.orden - b.orden)
          const tieneSiguienteRonda = indiceRonda < rondas.length - 1

          return (
            <div className="flex gap-4" key={ronda}>
              <section className="space-y-4">
                <h2 className="text-center text-sm font-black uppercase tracking-normal text-gray-400">
                  {etiquetasRonda[ronda] || ronda}
                </h2>
                <div className="flex flex-col gap-6">
                  {partidos.map((enfrentamiento) => (
                    <TarjetaEnfrentamiento
                      enfrentamiento={enfrentamiento}
                      key={enfrentamiento.id}
                    />
                  ))}
                </div>
              </section>
              <ConectoresRonda cantidad={partidos.length} visible={tieneSiguienteRonda} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
