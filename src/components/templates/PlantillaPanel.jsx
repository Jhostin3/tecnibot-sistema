import { BarraSuperiorPrivada } from '../organisms/BarraSuperiorPrivada'

export function PlantillaPanel({ alCerrarSesion, children, usuario }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <BarraSuperiorPrivada alCerrarSesion={alCerrarSesion} usuario={usuario} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
