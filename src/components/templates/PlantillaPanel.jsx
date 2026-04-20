import { BarraSuperiorPrivada } from '../organisms/BarraSuperiorPrivada'

export function PlantillaPanel({ alCerrarSesion, children, perfil, usuario }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <BarraSuperiorPrivada
        alCerrarSesion={alCerrarSesion}
        perfil={perfil}
        usuario={usuario}
      />
      <main className="w-full flex-1">{children}</main>
    </div>
  )
}
