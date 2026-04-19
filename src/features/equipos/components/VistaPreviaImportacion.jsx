import { Boton } from '../../../components/atoms/Boton'

export function VistaPreviaImportacion({
  cargando,
  filas = [],
  filasValidas = [],
  onConfirmar,
}) {
  if (!filas || !filas.length) {
    return null
  }

  const filasConError = filas.length - filasValidas.length

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Vista previa</h2>
          <p className="mt-1 text-sm text-slate-600">
            {filasValidas.length} filas válidas y {filasConError} filas con error.
          </p>
        </div>
        <Boton disabled={cargando || !filasValidas.length} onClick={onConfirmar}>
          {cargando ? 'Importando...' : 'Confirmar importación'}
        </Boton>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Fila</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Subcategoría</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map((fila) => (
              <tr key={fila.fila}>
                <td className="px-4 py-3">{fila.fila}</td>
                <td className="px-4 py-3">{fila.original.nombre_equipo}</td>
                <td className="px-4 py-3">{fila.original.representante}</td>
                <td className="px-4 py-3">{fila.original.subcategoria}</td>
                <td className="px-4 py-3">
                  {fila.errores.length ? fila.errores.join(' ') : 'Lista para importar'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
