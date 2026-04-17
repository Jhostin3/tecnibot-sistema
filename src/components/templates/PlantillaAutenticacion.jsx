export function PlantillaAutenticacion({ children }) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="flex flex-col justify-center px-6 py-12 sm:px-10">
          <div className="max-w-2xl">{children}</div>
        </section>
        <aside className="hidden border-l border-slate-200 bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
              TecniBot
            </p>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                Control académico para torneos de robótica
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Acceso seguro para gestionar perfiles, categorías, equipos y
                competencias.
              </p>
            </div>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Autenticación conectada con Supabase Auth y la tabla perfiles.
          </p>
        </aside>
      </div>
    </main>
  )
}
