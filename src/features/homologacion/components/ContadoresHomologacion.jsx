const tarjetas = [
  {
    clases: 'border-slate-200 bg-slate-50',
    etiqueta: 'Pendientes',
    estado: 'pendiente',
    numero: 'text-slate-700',
  },
  {
    clases: 'border-amber-200 bg-amber-50',
    etiqueta: 'En revision',
    estado: 'en_revision',
    numero: 'text-amber-700',
  },
  {
    clases: 'border-emerald-200 bg-emerald-50',
    etiqueta: 'Aprobados',
    estado: 'aprobado',
    numero: 'text-emerald-700',
  },
  {
    clases: 'border-red-200 bg-red-50',
    etiqueta: 'Rechazados',
    estado: 'rechazado',
    numero: 'text-red-700',
  },
]

function contarPorEstado(equipos = [], estado) {
  return equipos.filter((equipo) => equipo.estado_homologacion === estado).length
}

export function ContadoresHomologacion({ equipos = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((tarjeta) => (
        <article
          className={`rounded-2xl border-2 p-6 shadow-sm ${tarjeta.clases}`}
          key={tarjeta.estado}
        >
          <p className="text-sm font-semibold text-slate-500">{tarjeta.etiqueta}</p>
          <p className={`mt-2 text-3xl font-bold ${tarjeta.numero}`}>
            {contarPorEstado(equipos, tarjeta.estado)}
          </p>
        </article>
      ))}
    </div>
  )
}
