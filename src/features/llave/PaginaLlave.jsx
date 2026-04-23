import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { IndicadorEnVivo } from '../../components/molecules/IndicadorEnVivo'
import { BracketVisual } from './components/BracketVisual'
import { PantallaGanador } from './components/PantallaGanador'
import { SelectorSubcategoria } from './components/SelectorSubcategoria'
import { obtenerResumenPodio } from './utils/resumenPodio'
import { useLlave } from './usarLlave'

export function PaginaLlave() {
  const navigate = useNavigate()
  const {
    cargando,
    competenciaFinalizada,
    enfrentamientos,
    error,
    esCampeonAutomatico,
    estadosSubcategorias,
    ganadorFinal,
    realtimeActivo,
    seleccionarSubcategoria,
    subcategoriaSeleccionada,
    subcategorias,
    tieneSorteo,
  } = useLlave()
  const subcategoriaActual = subcategorias.find(
    (subcategoria) => subcategoria.id === subcategoriaSeleccionada,
  )
  const podio = obtenerResumenPodio(enfrentamientos, ganadorFinal, esCampeonAutomatico)
  const competenciaEnCurso = !competenciaFinalizada
  const mostrarBracket =
    !cargando &&
    tieneSorteo &&
    (
      competenciaEnCurso ||
      !esCampeonAutomatico
    )
  const mostrarPodio =
    !cargando &&
    competenciaFinalizada &&
    Boolean(ganadorFinal) &&
    podio.podioCompleto

  return (
    <section className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900 px-4 py-6 shadow-xl sm:px-8">
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Llave del Torneo
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-cyan-400">
                  En vivo · TecniBot Cuenca 2026
                </p>
                <IndicadorEnVivo activo={realtimeActivo} />
              </div>
            </div>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white"
            onClick={() => navigate('/login')}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al login
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-8 bg-gray-900 px-4 py-8 sm:px-8">
        <SelectorSubcategoria
          alSeleccionar={seleccionarSubcategoria}
          estadosSubcategorias={estadosSubcategorias}
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

        {!cargando && !tieneSorteo ? (
          <p className="py-12 text-center text-gray-400">
            El sorteo aún no ha sido realizado
          </p>
        ) : null}

        {mostrarPodio ? (
          <PantallaGanador
            enfrentamientos={enfrentamientos}
            esWalkover={esCampeonAutomatico}
            ganador={ganadorFinal}
            subcategoria={subcategoriaActual}
          />
        ) : null}

        {mostrarBracket ? (
          <BracketVisual enfrentamientos={enfrentamientos} />
        ) : null}
      </div>
    </section>
  )
}
