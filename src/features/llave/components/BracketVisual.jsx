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
          <div className="border-r border-t border-blue-600" />
          <div className="border-r border-b border-blue-600" />
          <div className="relative -mt-16 h-0 border-t border-blue-600" />
        </div>
      ))}
    </div>
  )
}

export function BracketVisual({ enfrentamientos }) {
  const grupos = agruparPorRonda(enfrentamientos || [])
  const rondasConDatos = ORDEN_RONDAS.filter((ronda) => grupos[ronda]?.length)
  const rondas = Array.from(new Set([...rondasConDatos, 'semifinal', 'final'])).sort(
    (a, b) => ORDEN_RONDAS.indexOf(a) - ORDEN_RONDAS.indexOf(b),
  )

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {rondas.map((ronda, indiceRonda) => {
          const partidos = [...(grupos[ronda] || [])].sort((a, b) => a.orden - b.orden)
          const tarjetas = partidos.length ? partidos : [null]
          const tieneSiguienteRonda = indiceRonda < rondas.length - 1

          return (
            <div className="flex gap-4" key={ronda}>
              <section className="space-y-4">
                <div className="mb-4 border-b border-blue-700 pb-2">
                  <h2 className="text-center text-xs font-bold uppercase tracking-widest text-cyan-400">
                    {etiquetasRonda[ronda] || ronda}
                  </h2>
                </div>
                <div className="flex flex-col gap-6">
                  {tarjetas.map((enfrentamiento, indice) => (
                    <TarjetaEnfrentamiento
                      enfrentamiento={enfrentamiento}
                      key={enfrentamiento?.id || `${ronda}-pendiente-${indice}`}
                    />
                  ))}
                </div>
              </section>
              <ConectoresRonda cantidad={tarjetas.length} visible={tieneSiguienteRonda} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
