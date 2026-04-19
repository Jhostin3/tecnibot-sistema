import { Boton } from '../../../components/atoms/Boton'

function obtenerParejas(ordenSorteo) {
  return [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ].map(([bolaA, bolaB], indice) => ({
    bolaA,
    bolaB,
    equipoA: ordenSorteo.find((asignacion) => asignacion.numero_bola === bolaA),
    equipoB: ordenSorteo.find((asignacion) => asignacion.numero_bola === bolaB),
    orden: indice + 1,
  }))
}

function obtenerNombreAsignacion(asignacion) {
  if (!asignacion) return 'Pendiente'
  if (asignacion.esBye) return 'BYE'

  return asignacion.equipo.nombre_equipo
}

export function OrdenBatalla({
  guardando,
  onConfirmar,
  ordenSorteo = [],
  puedeConfirmar,
}) {
  const parejas = obtenerParejas(ordenSorteo)

  return (
    <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Orden de batalla
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          {ordenSorteo.length} de 8 equipos asignados
        </h2>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, indice) => {
          const numero = indice + 1
          const asignacion = ordenSorteo.find((item) => item.numero_bola === numero)

          return (
            <div
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
              key={numero}
            >
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                Bola {numero}
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {obtenerNombreAsignacion(asignacion)}
              </p>
            </div>
          )
        })}
      </div>
      {puedeConfirmar ? (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h3 className="font-bold text-slate-950">Bracket generado</h3>
          <div className="space-y-2">
            {parejas.map((pareja) => (
              <p className="text-sm text-slate-600" key={pareja.orden}>
                Cuartos {pareja.orden}: {obtenerNombreAsignacion(pareja.equipoA)} vs{' '}
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
