import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { BracketVisual } from './components/BracketVisual'
import { PantallaGanador } from './components/PantallaGanador'
import { SelectorSubcategoria } from './components/SelectorSubcategoria'
import { useLlave } from './usarLlave'

export function PaginaLlave() {
  const navigate = useNavigate()
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
    <section className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-6 shadow-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800">
              <img
                alt="TecniBot"
                className="h-10 w-10 object-contain"
                src="/assets/icono_cuy.png"
              />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                Llave del Torneo
              </h1>
              <p className="text-sm font-semibold text-cyan-400">
                En vivo - TecniBot Cuenca 2026
              </p>
            </div>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-800 hover:text-white"
            onClick={() => navigate('/login')}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al login
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8">
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
