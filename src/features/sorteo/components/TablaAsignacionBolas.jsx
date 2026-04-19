import { Boton } from '../../../components/atoms/Boton'
import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'

const numerosBolas = ['1', '2', '3', '4', '5', '6', '7', '8']

function obtenerDetalleEquipo(equipo) {
  return [equipo.nombre_robot, equipo.institucion].filter(Boolean).join(' - ')
}

export function TablaAsignacionBolas({
  asignaciones,
  equipos,
  guardando,
  numerosRepetidos,
  onAsignarBola,
  onGuardar,
  puedeGuardar,
}) {
  if (!equipos.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Selecciona una subcategoria con equipos aprobados para iniciar el sorteo.
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Asignacion de bolas</h2>
          <p className="mt-1 text-sm text-slate-600">
            Deben existir exactamente 8 equipos aprobados y cada bola se usa una sola vez.
          </p>
        </div>
        <Boton disabled={guardando || !puedeGuardar} onClick={onGuardar}>
          {guardando ? 'Guardando...' : 'Guardar sorteo'}
        </Boton>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Representante</th>
              <th className="px-4 py-3">Bola</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipos.map((equipo) => {
              const bola = asignaciones[equipo.id] || ''
              const repetida = bola && numerosRepetidos.has(bola)

              return (
                <tr className="align-top" key={equipo.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{equipo.nombre_equipo}</p>
                    <p className="text-xs text-slate-500">
                      {obtenerDetalleEquipo(equipo) || 'Sin detalle adicional'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{equipo.representante}</td>
                  <td className="px-4 py-4">
                    <CampoSeleccion
                      aria-label={`Bola para ${equipo.nombre_equipo}`}
                      className={repetida ? 'border-rose-500 focus:border-rose-700 focus:ring-rose-100' : ''}
                      onChange={(evento) => onAsignarBola(equipo.id, evento.target.value)}
                      value={bola}
                    >
                      <option value="">Sin bola</option>
                      {numerosBolas.map((numero) => (
                        <option key={numero} value={numero}>
                          Bola {numero}
                        </option>
                      ))}
                    </CampoSeleccion>
                    {repetida ? (
                      <p className="mt-2 text-xs font-semibold text-rose-700">
                        Esta bola ya fue asignada.
                      </p>
                    ) : null}
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
