export function IndicadorEnVivo({ activo, className = '' }) {
  if (!activo) return null

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ${className}`.trim()}
    >
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
      En vivo
    </span>
  )
}
