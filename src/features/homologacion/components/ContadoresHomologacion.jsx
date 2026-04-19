const tarjetas = [
  {
    clases: 'border-slate-200 bg-white text-slate-700',
    etiqueta: 'Pendientes',
    estado: 'pendiente',
  },
  {
    clases: 'border-amber-200 bg-amber-50 text-amber-800',
    etiqueta: 'En revision',
    estado: 'en_revision',
  },
  {
    clases: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    etiqueta: 'Aprobados',
    estado: 'aprobado',
  },
  {
    clases: 'border-rose-200 bg-rose-50 text-rose-800',
    etiqueta: 'Rechazados',
    estado: 'rechazado',
  },
]

function contarPorEstado(equipos, estado) {
  return equipos.filter((equipo) => equipo.estado_homologacion === estado).length
}

export function ContadoresHomologacion({ equipos }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((tarjeta) => (
        <article
          className={`rounded-md border p-4 shadow-sm ${tarjeta.clases}`}
          key={tarjeta.estado}
        >
          <p className="text-sm font-semibold">{tarjeta.etiqueta}</p>
          <p className="mt-2 text-3xl font-bold">
            {contarPorEstado(equipos, tarjeta.estado)}
          </p>
        </article>
      ))}
    </div>
  )
}
