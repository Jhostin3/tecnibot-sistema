const metricasIniciales = [
  { etiqueta: 'Categorías preparadas', valor: '0' },
  { etiqueta: 'Equipos registrados', valor: '0' },
  { etiqueta: 'Subcategorías definidas', valor: '0' },
]

export function PaginaPanel() {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Panel principal
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
          Sistema de Gestión de Competencias de Robótica
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Base privada inicial lista para conectar módulos, datos y permisos con
          Supabase.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metricasIniciales.map((metrica) => (
          <article
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            key={metrica.etiqueta}
          >
            <p className="text-sm text-slate-500">{metrica.etiqueta}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{metrica.valor}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
