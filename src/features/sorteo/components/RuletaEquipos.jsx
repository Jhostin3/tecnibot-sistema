import { Boton } from '../../../components/atoms/Boton'

const colores = [
  '#0f766e',
  '#0369a1',
  '#7c3aed',
  '#be123c',
  '#ca8a04',
  '#15803d',
  '#c2410c',
  '#475569',
]

function crearFondoRuleta(cantidad) {
  if (!cantidad) return '#e2e8f0'

  const segmento = 100 / cantidad

  return `conic-gradient(${Array.from({ length: cantidad })
    .map((_, indice) => {
      const inicio = segmento * indice
      const fin = segmento * (indice + 1)

      return `${colores[indice % colores.length]} ${inicio}% ${fin}%`
    })
    .join(', ')})`
}

export function RuletaEquipos({
  angulo,
  duracion,
  equipoGirado,
  equipos = [],
  esUltimo,
  girando,
  onAsignarUltimo,
  onGirar,
}) {
  const sinEquipos = !equipos.length
  const ultimoEquipo = equipos[0]

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="flex flex-col items-center gap-5">
          {esUltimo ? (
            <div className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
                Ultima bola
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {ultimoEquipo?.nombre_equipo}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Ya solo queda un equipo pendiente por asignar.
              </p>
              <button
                className="mt-6 h-12 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
                onClick={onAsignarUltimo}
                type="button"
              >
                Asignar última bola → {ultimoEquipo?.nombre_equipo}
              </button>
            </div>
          ) : (
            <>
              <div className="relative flex aspect-square w-full max-w-md items-center justify-center">
                <div className="absolute right-2 top-1/2 z-10 h-0 w-0 -translate-y-1/2 border-y-[14px] border-r-[24px] border-y-transparent border-r-slate-950" />
                <div
                  className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-8 border-white shadow-lg transition-transform ease-out"
                  style={{
                    background: crearFondoRuleta(equipos.length),
                    transform: `rotate(${angulo}deg)`,
                    transitionDuration: girando ? `${duracion}ms` : '300ms',
                  }}
                >
                  {equipos.map((equipo, indice) => {
                    const anguloEquipo = (360 / equipos.length) * indice

                    return (
                      <div
                        className="absolute left-1/2 top-1/2 w-28 origin-center text-center text-xs font-bold leading-4 text-white drop-shadow"
                        key={equipo.id}
                        style={{
                          transform: `translate(-50%, -50%) rotate(${anguloEquipo}deg) translateY(-38%) rotate(-${anguloEquipo}deg)`,
                        }}
                      >
                        <span className="block truncate rounded-md bg-slate-950/50 px-2 py-1">
                          {equipo.nombre_equipo}
                        </span>
                      </div>
                    )
                  })}
                  <div className="z-10 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-950 px-4 text-center text-sm font-bold text-white shadow-md">
                    {girando ? 'Girando...' : `${equipos.length} equipos`}
                  </div>
                </div>
              </div>
              <Boton disabled={girando || sinEquipos} onClick={onGirar}>
                {girando ? 'Girando...' : 'Girar'}
              </Boton>
            </>
          )}
          {equipoGirado ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-800">Equipo seleccionado</p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                {equipoGirado.nombre_equipo}
              </p>
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-950">En la ruleta</h2>
          {sinEquipos ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Ya fueron asignados todos los equipos.
            </p>
          ) : (
            <div className="space-y-2">
              {equipos.map((equipo, indice) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                  key={equipo.id}
                >
                  <p className="font-semibold text-slate-950">
                    {indice + 1}. {equipo.nombre_equipo}
                  </p>
                  <p className="text-xs text-slate-500">
                    {equipo.institucion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
