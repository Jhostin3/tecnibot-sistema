function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

export function ResumenSorteoExistente({ sorteo }) {
  if (!sorteo.length) {
    return null
  }

  return (
    <div className="space-y-4 rounded-md border border-emerald-200 bg-emerald-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-800">
          Sorteo registrado
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          La subcategoria ya tiene llave inicial
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fecha: {formatearFecha(sorteo[0]?.fecha)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sorteo.map((asignacion) => (
          <article
            className="rounded-md border border-emerald-200 bg-white p-4"
            key={asignacion.id}
          >
            <p className="text-xs font-semibold uppercase tracking-normal text-emerald-800">
              Bola {asignacion.numero_bola}
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {asignacion.equipos?.nombre_equipo || 'Equipo sin nombre'}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
