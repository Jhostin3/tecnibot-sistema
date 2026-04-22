import { Boton } from '../../../components/atoms/Boton'

function obtenerClaseFila(estado) {
  if (estado === 'error') return 'bg-red-50 text-red-950'
  if (estado === 'categoria-no-encontrada') return 'bg-yellow-50 text-yellow-950'

  return 'bg-green-50 text-green-950'
}

function obtenerEstadoFila(fila) {
  if (fila.errores.length) {
    return fila.errores.join(' ')
  }

  if (fila.advertencias?.length) {
    return fila.advertencias.join(' ')
  }

  return 'Lista para importar'
}

export function VistaPreviaImportacion({
  cargando,
  filas = [],
  filasValidas = [],
  onConfirmar,
}) {
  if (!filas || !filas.length) {
    return null
  }

  const categoriasNoEncontradas = filas.filter(
    (fila) => fila.estado === 'categoria-no-encontrada',
  ).length
  const filasDuplicadas = filas.filter((fila) =>
    fila.errores.some((error) => error === 'Duplicado: mismo robot en la misma categoria'),
  ).length

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Vista previa</h2>
          <p className="mt-1 text-sm text-slate-600">
            {filasValidas.length} listos · {categoriasNoEncontradas} categorias no
            encontradas · {filasDuplicadas} duplicados
          </p>
        </div>
        <Boton disabled={cargando || !filasValidas.length} onClick={onConfirmar}>
          {cargando ? 'Importando...' : 'Confirmar importacion'}
        </Boton>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Robot</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Institucion</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map((fila) => (
              <tr className={obtenerClaseFila(fila.estado)} key={fila.fila}>
                <td className="px-4 py-3 font-medium">
                  {fila.original.nombre_robot || fila.original.nombre_equipo}
                </td>
                <td className="px-4 py-3">{fila.original.representante || '-'}</td>
                <td className="px-4 py-3">{fila.original.institucion || '-'}</td>
                <td className="px-4 py-3">{fila.original.categoria || '-'}</td>
                <td className="px-4 py-3">{fila.original.subcategoria || '-'}</td>
                <td className="px-4 py-3">{fila.original.correo || '-'}</td>
                <td className="px-4 py-3">{obtenerEstadoFila(fila)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
