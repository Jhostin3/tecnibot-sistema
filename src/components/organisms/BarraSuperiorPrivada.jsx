import { Boton } from '../atoms/Boton'

export function BarraSuperiorPrivada({ alCerrarSesion, usuario }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-800">
            Sistema de Gestión de Competencias de Robótica
          </p>
          <p className="text-xs text-slate-500">{usuario?.correo}</p>
        </div>
        <Boton variante="secundario" onClick={alCerrarSesion}>
          Cerrar sesión
        </Boton>
      </div>
    </header>
  )
}
