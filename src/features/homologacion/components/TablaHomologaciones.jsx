import { Boton } from '../../../components/atoms/Boton'
import { obtenerEtiquetaEstadoHomologacion } from '../hooks/usarHomologaciones'

const accionesPorEstado = {
  aprobado: [{ estado: 'en_revision', etiqueta: 'Revisar otra vez' }],
  en_revision: [
    { estado: 'aprobado', etiqueta: 'Aprobar' },
    { estado: 'rechazado', etiqueta: 'Rechazar' },
  ],
  pendiente: [{ estado: 'en_revision', etiqueta: 'Iniciar revision' }],
  rechazado: [{ estado: 'en_revision', etiqueta: 'Revisar otra vez' }],
}

function obtenerSubcategoria(equipo) {
  return equipo.subcategorias?.nombre || 'Sin subcategoria'
}

function formatearFecha(fecha) {
  if (!fecha) return ''

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function obtenerUltimaHomologacion(equipo) {
  const ultima = equipo.ultima_homologacion

  if (!ultima) {
    return 'Sin registros'
  }

  const homologador = ultima.homologador?.nombre || 'Sin homologador'

  return `${obtenerEtiquetaEstadoHomologacion(ultima.estado)} por ${homologador} - ${formatearFecha(ultima.fecha)}`
}

function obtenerVarianteAccion(estado) {
  if (estado === 'aprobado') return 'exito'
  if (estado === 'rechazado') return 'peligro'

  return 'secundario'
}

export function TablaHomologaciones({ equipos, guardando, onSeleccionarCambio }) {
  if (!equipos.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay equipos que coincidan con los filtros seleccionados.
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
              <th className="px-4 py-3">Institucion</th>
              <th className="px-4 py-3">Subcategoria</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ultima homologacion</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipos.map((equipo) => {
              const acciones = accionesPorEstado[equipo.estado_homologacion] || []

              return (
                <tr className="align-top" key={equipo.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{equipo.nombre_equipo}</p>
                    <p className="text-xs text-slate-500">{equipo.nombre_robot || 'Robot sin nombre'}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{equipo.institucion}</p>
                    <p className="text-xs text-slate-500">{equipo.representante}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{obtenerSubcategoria(equipo)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {obtenerEtiquetaEstadoHomologacion(equipo.estado_homologacion)}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-slate-600">
                    <p>{obtenerUltimaHomologacion(equipo)}</p>
                    {equipo.ultima_homologacion?.observacion ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {equipo.ultima_homologacion.observacion}
                      </p>
                    ) : null}
                  </td>
                  <td className="space-y-2 px-4 py-4">
                    {acciones.map((accion) => (
                      <Boton
                        className="w-full"
                        disabled={guardando}
                        key={accion.estado}
                        onClick={() => onSeleccionarCambio(equipo, accion.estado)}
                        variante={obtenerVarianteAccion(accion.estado)}
                      >
                        {accion.etiqueta}
                      </Boton>
                    ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
