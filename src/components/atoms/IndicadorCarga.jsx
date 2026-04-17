export function IndicadorCarga({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
        {mensaje}
      </div>
    </div>
  )
}
