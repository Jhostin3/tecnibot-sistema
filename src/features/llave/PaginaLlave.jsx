import { BracketVisual } from './components/BracketVisual'
import { PantallaGanador } from './components/PantallaGanador'
import { SelectorSubcategoria } from './components/SelectorSubcategoria'
import { useLlave } from './usarLlave'

export function PaginaLlave() {
  const {
    cargando,
    enfrentamientos,
    error,
    ganadorFinal,
    seleccionarSubcategoria,
    subcategoriaSeleccionada,
    subcategorias,
  } = useLlave()
  const subcategoriaActual = subcategorias.find(
    (subcategoria) => subcategoria.id === subcategoriaSeleccionada,
  )

  return (
    <section className="min-h-screen bg-gray-900 px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-3">
          <p className="text-base font-semibold uppercase tracking-normal text-cyan-300">
            TecniBot
          </p>
          <h1 className="text-4xl font-black tracking-normal">
            TecniBot - Llave del torneo
          </h1>
          <p className="max-w-3xl text-base leading-7 text-gray-400">
            Sigue los enfrentamientos en vivo y mira como avanza cada ronda.
          </p>
        </header>

        <SelectorSubcategoria
          alSeleccionar={seleccionarSubcategoria}
          subcategoriaSeleccionada={subcategoriaSeleccionada}
          subcategorias={subcategorias}
        />

        {error ? (
          <p className="rounded-lg border border-red-500 bg-red-900 p-4 text-base font-semibold text-red-200">
            {error}
          </p>
        ) : null}

        {cargando ? (
          <p className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center text-lg font-semibold text-gray-300">
            Cargando llave del torneo...
          </p>
        ) : null}

        {!cargando && ganadorFinal ? (
          <PantallaGanador ganador={ganadorFinal} subcategoria={subcategoriaActual} />
        ) : null}

        {!cargando ? <BracketVisual enfrentamientos={enfrentamientos} /> : null}
      </div>
    </section>
  )
}
