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

function obtenerSubcategoriasConUnEquipo(equipos = []) {
  const conteos = new Map()

  equipos.forEach((equipo) => {
    if (!equipo.subcategoria_id) return

    const actual = conteos.get(equipo.subcategoria_id) || {
      id: equipo.subcategoria_id,
      nombre: equipo.subcategorias?.nombre || 'Sin subcategoria',
      total: 0,
    }

    conteos.set(equipo.subcategoria_id, {
      ...actual,
      total: actual.total + 1,
    })
  })

  return Array.from(conteos.values()).filter((subcategoria) => subcategoria.total === 1)
}

export function ContadoresHomologacion({ equipos = [] }) {
  const subcategoriasConUnEquipo = obtenerSubcategoriasConUnEquipo(equipos)

  return (
    <div className="space-y-3">
      <div className="grid w-full grid-cols-4 gap-4">
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
      {subcategoriasConUnEquipo.length ? (
        <div className="flex flex-wrap gap-2">
          {subcategoriasConUnEquipo.map((subcategoria) => (
            <span
              className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"
              key={subcategoria.id}
            >
              {subcategoria.nombre}: 1 equipo — Campeón automático al aprobar
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
