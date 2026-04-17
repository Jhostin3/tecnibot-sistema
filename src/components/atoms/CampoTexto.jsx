export function CampoTexto({ className = '', ...propiedades }) {
  return (
    <input
      className={`min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100 ${className}`}
      {...propiedades}
    />
  )
}
