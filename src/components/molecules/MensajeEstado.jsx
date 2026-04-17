export function MensajeEstado({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {children}
    </p>
  )
}
