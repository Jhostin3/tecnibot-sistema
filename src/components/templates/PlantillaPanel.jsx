import { BarraSuperiorPrivada } from '../organisms/BarraSuperiorPrivada'

export function PlantillaPanel({
  alCerrarSesion,
  children,
  mostrarBarraSuperior = true,
  perfil,
  usuario,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {mostrarBarraSuperior ? (
        <BarraSuperiorPrivada
          alCerrarSesion={alCerrarSesion}
          perfil={perfil}
          usuario={usuario}
        />
      ) : null}
      <main className="w-full flex-1">{children}</main>
    </div>
  )
}
