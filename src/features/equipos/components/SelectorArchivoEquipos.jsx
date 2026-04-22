import { Boton } from '../../../components/atoms/Boton'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'

export function SelectorArchivoEquipos({
  archivo,
  cargando,
  mensaje,
  onProcesar,
  onSeleccionar,
}) {
  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Importar archivo CSV</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Acepta el CSV oficial exportado desde el formulario de Google Forms
          de TecniBot 2026. Columnas requeridas: Nombre del Robot, Nombre de
          usuario, Nombre de la Institución, Nombre del Responsable/Coordinador,
          Categoría, Nivel del Robot.
        </p>
      </div>
      <input
        accept=".csv,text/csv"
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        onChange={(evento) => onSeleccionar(evento.target.files?.[0] || null)}
        type="file"
      />
      {archivo ? <p className="text-sm text-slate-600">Archivo: {archivo.name}</p> : null}
      <MensajeEstado>{mensaje}</MensajeEstado>
      <Boton disabled={cargando} onClick={onProcesar}>
        {cargando ? 'Procesando...' : 'Procesar archivo'}
      </Boton>
    </div>
  )
}
