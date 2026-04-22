import { useModoSorteo } from '../../features/sorteo/hooks/useModoSorteo'
import { modosSorteo } from '../../features/sorteo/utils/modoSorteo'

export function BarraSuperiorPrivada({ alCerrarSesion, perfil, usuario }) {
  const modoSorteo = useModoSorteo()
  const badgeModo =
    modoSorteo === modosSorteo.presencial
      ? {
          clase: 'bg-teal-100 text-teal-600',
          texto: 'Sorteo Presencial',
        }
      : {
          clase: 'bg-indigo-100 text-indigo-600',
          texto: 'Sorteo Virtual',
        }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg shadow-blue-900/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <img
            alt="TecniBot"
            className="h-12 w-12 object-contain"
            src="/assets/icono_cuy.png"
          />
          <div>
            <p className="text-xl font-black tracking-normal text-white">TECNIBOT</p>
            <p className="text-xs font-semibold text-cyan-400">Cuenca 2026</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2 border-t border-blue-700 pt-3 lg:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-blue-300">{perfil?.nombre}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeModo.clase}`}>
                {badgeModo.texto}
              </span>
            </div>
            <p className="text-xs text-blue-300/80">{usuario?.email}</p>
          </div>

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
