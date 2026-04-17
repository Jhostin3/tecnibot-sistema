import { Boton } from '../../../components/atoms/Boton'

export function EncabezadoEquipos({ alCrear, alImportar }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Gestión de equipos
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
          Equipos inscritos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
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
  )
}
