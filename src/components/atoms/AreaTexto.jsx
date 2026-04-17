export function AreaTexto({ className = '', ...propiedades }) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100 ${className}`}
      {...propiedades}
    />
  )
}
