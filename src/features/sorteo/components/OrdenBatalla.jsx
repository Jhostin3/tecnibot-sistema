import { Boton } from '../../../components/atoms/Boton'

function obtenerNombreAsignacion(asignacion) {
  if (!asignacion) return 'Por definir'
  if (asignacion.tipo === 'bye') return 'BYE'

  return asignacion.equipo.nombre_equipo
}

function crearSlotsBracket(ordenSorteo, tamanoBracket) {
  const slotsEquipos = ordenSorteo.map((asignacion) => ({
    ...asignacion,
    tipo: 'equipo',
  }))
  const slotsBye = Array.from({
    length: Math.max(0, tamanoBracket - slotsEquipos.length),
  }).map((_, indice) => ({
    equipo: null,
    numero_bola: slotsEquipos.length + indice + 1,
    tipo: 'bye',
  }))

  return [...slotsEquipos, ...slotsBye]
}

function obtenerParejasPrimeraRonda(ordenSorteo, tamanoBracket, cantidadByes) {
  const slots = crearSlotsBracket(ordenSorteo, tamanoBracket)

  if (!cantidadByes) {
    return Array.from({ length: slots.length / 2 }).map((_, indice) => ({
      equipoA: slots[indice * 2],
      equipoB: slots[indice * 2 + 1],
      orden: indice + 1,
    }))
  }

  return Array.from({ length: slots.length / 2 }).map((_, indice) => ({
    equipoA: slots[indice],
    equipoB: slots[slots.length - 1 - indice],
    orden: indice + 1,
  }))
}

export function OrdenBatalla({
  cantidadByes = 0,
  compacto = false,
  guardando,
  onConfirmar,
  ordenSorteo = [],
  partidosPrimeraRonda = 0,
  puedeConfirmar,
  tamanoBracket = 2,
}) {
  const totalEquipos = tamanoBracket - cantidadByes
  const parejas = puedeConfirmar
    ? obtenerParejasPrimeraRonda(ordenSorteo, tamanoBracket, cantidadByes)
    : []

  return (
    <aside
      className={
        compacto
          ? 'flex h-full w-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
          : 'space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm'
      }
    >
      <div className={compacto ? 'border-b border-slate-100 p-4' : ''}>
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Orden de batalla
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          {ordenSorteo.length} de {totalEquipos} equipos sorteados
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Bracket de {tamanoBracket} con {cantidadByes} BYEs inferidos.
        </p>
      </div>
      <div className={compacto ? 'flex-1 space-y-2 overflow-y-auto p-4' : 'space-y-2'}>
        {ordenSorteo.length ? (
          ordenSorteo.map((asignacion) => (
            <div
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
              key={asignacion.equipo.id}
            >
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                Bola {asignacion.numero_bola}
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {asignacion.equipo.nombre_equipo}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Gira la ruleta para construir el orden.
          </div>
        )}
      </div>
      {puedeConfirmar ? (
        <div className={compacto ? 'space-y-3 border-t border-slate-200 p-4' : 'space-y-3 border-t border-slate-200 pt-4'}>
          <h3 className="font-bold text-slate-950">Primera ronda generada</h3>
          <p className="text-sm text-slate-600">
            {partidosPrimeraRonda} partidos con BYEs aplicados al final del bracket.
          </p>
          <div className="space-y-2">
            {parejas.map((pareja) => (
              <p className="text-sm text-slate-600" key={pareja.orden}>
                Partido {pareja.orden}: {obtenerNombreAsignacion(pareja.equipoA)} vs{' '}
                {obtenerNombreAsignacion(pareja.equipoB)}
              </p>
            ))}
          </div>
          <Boton className="w-full" disabled={guardando} onClick={onConfirmar}>
            {guardando ? 'Guardando...' : 'Confirmar sorteo'}
          </Boton>
        </div>
      ) : null}
    </aside>
  )
}
