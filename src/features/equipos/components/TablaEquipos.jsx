function obtenerSubcategoria(equipo) {
  return equipo.subcategorias?.nombre || 'Sin subcategoria'
}

const clasesEstadoHomologacion = {
  aprobado: 'bg-emerald-100 text-emerald-700',
  en_revision: 'bg-amber-100 text-amber-700',
  pendiente: 'bg-slate-100 text-slate-600',
  rechazado: 'bg-red-100 text-red-700',
}

function formatearEstadoHomologacion(estado = 'pendiente') {
  return estado.replace('_', ' ')
}

export function TablaEquipos({ alEditar, alEliminar, equipos = [] }) {
  if (!equipos || !equipos.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Todavia no hay equipos registrados.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Institucion</th>
              <th className="px-4 py-3">Subcategoria</th>
              <th className="px-4 py-3">Inscripcion</th>
              <th className="px-4 py-3">Homologacion</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipos.map((equipo) => (
              <tr
                className="border-b border-slate-100 align-top transition-colors hover:bg-blue-50"
                key={equipo.id}
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{equipo.nombre_equipo}</p>
                  <p className="text-xs text-slate-500">
                    {equipo.nombre_robot || 'Robot sin nombre'}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <p>{equipo.representante}</p>
                  <p className="text-xs text-slate-500">{equipo.correo || 'Sin correo'}</p>
                </td>
                <td className="px-4 py-4 text-slate-700">{equipo.institucion}</td>
                <td className="px-4 py-4 text-slate-700">{obtenerSubcategoria(equipo)}</td>
                <td className="px-4 py-4 capitalize text-slate-700">
                  {equipo.estado_inscripcion}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      clasesEstadoHomologacion[equipo.estado_homologacion] ||
                      clasesEstadoHomologacion.pendiente
                    }`}
                  >
                    {formatearEstadoHomologacion(equipo.estado_homologacion)}
                  </span>
                </td>
                <td className="space-y-2 px-4 py-4">
                  <button
                    className="min-h-10 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
                    onClick={() => alEditar(equipo)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="min-h-10 w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    onClick={() => alEliminar(equipo.id)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
