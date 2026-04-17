export function Etiqueta({ children, htmlFor }) {
  return (
    <label className="text-sm font-semibold text-slate-700" htmlFor={htmlFor}>
      {children}
    </label>
  )
}
