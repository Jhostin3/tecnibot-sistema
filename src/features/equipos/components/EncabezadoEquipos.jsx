import { ChevronLeft } from 'lucide-react'

import { Boton } from '../../../components/atoms/Boton'

export function EncabezadoEquipos({ alCrear, alImportar, alVolverInicio }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        className="mb-5 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-blue-600"
        onClick={alVolverInicio}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
        Inicio
      </button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Gestion de equipos
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Equipos inscritos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Importa equipos desde CSV o registra casos puntuales de forma manual.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Boton onClick={alImportar}>Importar archivo</Boton>
          <Boton onClick={alCrear} variante="secundario">
            Crear equipo
          </Boton>
        </div>
      </div>
    </div>
  )
}
