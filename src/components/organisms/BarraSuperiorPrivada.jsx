export function BarraSuperiorPrivada({ alCerrarSesion }) {
  const iconoTecniBot = `${import.meta.env.BASE_URL}assets/icono_cuy.png`

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg shadow-blue-900/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <img
            alt="TecniBot"
            className="h-12 w-12 object-contain"
            src={iconoTecniBot}
          />
          <div>
            <p className="text-xl font-black tracking-normal text-white">TECNIBOT</p>
            <p className="text-xs font-semibold text-cyan-400">Cuenca 2026</p>
          </div>
        </div>

        <div className="flex lg:justify-end">
          <button
            className="min-h-10 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-200 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
            onClick={alCerrarSesion}
            type="button"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  )
}
