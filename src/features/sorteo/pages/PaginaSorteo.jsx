import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { ResumenSorteoExistente } from '../components/ResumenSorteoExistente'
import { SelectorSubcategoriaSorteo } from '../components/SelectorSubcategoriaSorteo'
import { TablaAsignacionBolas } from '../components/TablaAsignacionBolas'
import { useSorteo } from '../hooks/usarSorteo'

function obtenerMensajeValidacion({ equipos, sorteoExistente, subcategoriaId }) {
  if (!subcategoriaId) {
    return 'Selecciona una subcategoria para revisar sus equipos aprobados.'
  }

  if (sorteoExistente.length) {
    return 'El sorteo ya fue registrado para esta subcategoria.'
  }

  if (equipos.length !== 8) {
    return `Hay ${equipos.length} equipos aprobados. El sorteo requiere exactamente 8.`
  }

  return 'Todo listo para asignar bolas del 1 al 8.'
}

export function PaginaSorteo() {
  const sorteo = useSorteo()
  const mensajeValidacion = obtenerMensajeValidacion({
    equipos: sorteo.equipos,
    sorteoExistente: sorteo.sorteoExistente,
    subcategoriaId: sorteo.subcategoriaId,
  })

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <EncabezadoSeccion
          descripcion="Selecciona una subcategoria, asigna bolas fisicas a los equipos aprobados y genera los cuartos de final."
          etiqueta="Llave inicial"
          titulo="Sorteo de Soccer"
        />
      </div>
      <SelectorSubcategoriaSorteo
        onSeleccionar={sorteo.seleccionarSubcategoria}
        subcategoriaId={sorteo.subcategoriaId}
        subcategorias={sorteo.subcategorias}
      />
      <MensajeEstado>{sorteo.mensaje}</MensajeEstado>
      {sorteo.cargando || sorteo.cargandoEquipos ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando datos del sorteo...
        </div>
      ) : (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            {mensajeValidacion}
          </div>
          <ResumenSorteoExistente sorteo={sorteo.sorteoExistente} />
          {!sorteo.sorteoExistente.length ? (
            <TablaAsignacionBolas
              asignaciones={sorteo.asignaciones}
              equipos={sorteo.equipos}
              guardando={sorteo.guardando}
              numerosRepetidos={sorteo.numerosRepetidos}
              onAsignarBola={sorteo.asignarBola}
              onGuardar={sorteo.guardarSorteo}
              puedeGuardar={sorteo.puedeGuardar}
            />
          ) : null}
        </>
      )}
    </section>
  )
}
