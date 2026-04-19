import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { OrdenBatalla } from '../components/OrdenBatalla'
import { ResumenSorteoExistente } from '../components/ResumenSorteoExistente'
import { RuletaEquipos } from '../components/RuletaEquipos'
import { SelectorSubcategoriaSorteo } from '../components/SelectorSubcategoriaSorteo'
import { useSorteo } from '../hooks/usarSorteo'

function obtenerMensajeValidacion({ equipos, sorteoExistente, subcategoriaId, subcategorias }) {
  if (!subcategorias.length) {
    return 'No hay subcategorías listas para sorteo. Se necesitan exactamente 8 equipos aprobados.'
  }

  if (!subcategoriaId) {
    return 'Selecciona una subcategoría lista para iniciar la ruleta.'
  }

  if (sorteoExistente.length) {
    return 'El sorteo ya fue registrado para esta subcategoría.'
  }

  if (equipos.length !== 8) {
    return `Hay ${equipos.length} equipos aprobados. El sorteo requiere exactamente 8.`
  }

  return 'Gira la ruleta para asignar el orden de batalla.'
}

export function PaginaSorteo() {
  const sorteo = useSorteo()
  const subcategoriasFiltradas = sorteo.categoriaId
    ? sorteo.subcategorias.filter(
        (subcategoria) => subcategoria.categoria_id === sorteo.categoriaId,
      )
    : []
  const mensajeValidacion = obtenerMensajeValidacion({
    equipos: sorteo.equipos,
    sorteoExistente: sorteo.sorteoExistente,
    subcategoriaId: sorteo.subcategoriaId,
    subcategorias: sorteo.subcategorias,
  })

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <EncabezadoSeccion
          descripcion="Selecciona una subcategoría lista, gira la ruleta con los equipos aprobados y genera los cuartos de final."
          etiqueta="Ruleta de homologacion"
          titulo="Sorteo Soccer"
        />
      </div>
      {sorteo.subcategorias.length ? (
        <SelectorSubcategoriaSorteo
          categoriaId={sorteo.categoriaId}
          categorias={sorteo.categorias}
          onSeleccionarCategoria={sorteo.seleccionarCategoria}
          onSeleccionar={sorteo.seleccionarSubcategoria}
          subcategoriaId={sorteo.subcategoriaId}
          subcategorias={subcategoriasFiltradas}
        />
      ) : null}
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
          {sorteo.subcategoriaId && !sorteo.sorteoExistente.length ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <RuletaEquipos
                angulo={sorteo.anguloRuleta}
                duracion={sorteo.duracionGiro}
                equipoGirado={sorteo.equipoGirado}
                equipos={sorteo.equiposDisponibles}
                girando={sorteo.girando}
                onGirar={sorteo.girarRuleta}
              />
              <OrdenBatalla
                guardando={sorteo.guardando}
                onConfirmar={sorteo.guardarSorteo}
                ordenSorteo={sorteo.ordenSorteo}
                puedeConfirmar={sorteo.puedeConfirmar}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
