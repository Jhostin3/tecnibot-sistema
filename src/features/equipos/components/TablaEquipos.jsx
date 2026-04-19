import { Boton } from '../../../components/atoms/Boton'

function obtenerSubcategoria(equipo) {
  return equipo.subcategorias?.nombre || 'Sin subcategoría'
}

export function TablaEquipos({ alEditar, alEliminar, equipos = [] }) {
  if (!equipos || !equipos.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Todavía no hay equipos registrados.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Institución</th>
              <th className="px-4 py-3">Subcategoría</th>
              <th className="px-4 py-3">Inscripción</th>
              <th className="px-4 py-3">Homologación</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipos.map((equipo) => (
              <tr className="align-top" key={equipo.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{equipo.nombre_equipo}</p>
                  <p className="text-xs text-slate-500">{equipo.nombre_robot || 'Robot sin nombre'}</p>
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
                <td className="px-4 py-4 capitalize text-slate-700">
                  {equipo.estado_homologacion}
                </td>
                <td className="space-y-2 px-4 py-4">
                  <Boton className="w-full" onClick={() => alEditar(equipo)} variante="secundario">
                    Editar
                  </Boton>
                  <Boton className="w-full" onClick={() => alEliminar(equipo.id)} variante="peligro">
                    Eliminar
                  </Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
