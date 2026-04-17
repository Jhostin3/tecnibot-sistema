const variantes = {
  primario: 'bg-cyan-700 text-white hover:bg-cyan-800 focus-visible:ring-cyan-700',
  secundario:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-cyan-700',
}

export function Boton({
  children,
  className = '',
  tipo = 'button',
  variante = 'primario',
  ...propiedades
}) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
      type={tipo}
      {...propiedades}
    >
      {children}
    </button>
  )
}
