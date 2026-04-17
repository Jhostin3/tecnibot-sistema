export function CampoSeleccion({ children, className = '', ...propiedades }) {
  return (
    <select
      className={`min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100 ${className}`}
      {...propiedades}
    >
      {children}
    </select>
  )
}
