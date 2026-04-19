import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { OrdenBatalla } from '../components/OrdenBatalla'
import { ResumenSorteoExistente } from '../components/ResumenSorteoExistente'
import { RuletaEquipos } from '../components/RuletaEquipos'
import { SelectorSubcategoriaSorteo } from '../components/SelectorSubcategoriaSorteo'
import { useSorteo } from '../hooks/usarSorteo'

function obtenerMensajeValidacion({
  cantidadByes,
  equipos = [],
  partidosPrimeraRonda,
  sorteoExistente = [],
  subcategoriaId,
  subcategorias = [],
  tamanoBracket,
}) {
  if (!subcategorias || !subcategorias.length) {
    return 'No hay subcategorias listas para sorteo. Se necesitan al menos 2 equipos aprobados.'
  }

  if (!subcategoriaId) {
    return 'Selecciona una subcategoria lista para iniciar la ruleta.'
  }

  if (sorteoExistente.length) {
    return 'El sorteo ya fue registrado para esta subcategoria.'
  }

  if (equipos.length < 2) {
    return `Hay ${equipos.length} equipos aprobados. El sorteo requiere al menos 2.`
  }

  return `Hay ${equipos.length} equipos aprobados. Bracket de ${tamanoBracket}, ${cantidadByes} BYEs y ${partidosPrimeraRonda} partidos en primera ronda.`
}

export function PaginaSorteo() {
  const sorteo = useSorteo()
  const subcategoriasFiltradas = sorteo.categoriaId
    ? sorteo.subcategorias.filter(
        (subcategoria) => subcategoria.categoria_id === sorteo.categoriaId,
      )
    : []
  const mensajeValidacion = obtenerMensajeValidacion({
    cantidadByes: sorteo.cantidadByes,
    equipos: sorteo.equipos,
    partidosPrimeraRonda: sorteo.partidosPrimeraRonda,
    sorteoExistente: sorteo.sorteoExistente,
    subcategoriaId: sorteo.subcategoriaId,
    subcategorias: sorteo.subcategorias,
    tamanoBracket: sorteo.tamanoBracket,
  })

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <EncabezadoSeccion
          descripcion="Selecciona una subcategoria lista, gira la ruleta con los equipos aprobados y genera la primera ronda del bracket."
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
          <ResumenSorteoExistente
            sorteo={sorteo.sorteoExistente}
            subcategoriaId={sorteo.subcategoriaId}
          />
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
                cantidadByes={sorteo.cantidadByes}
                guardando={sorteo.guardando}
                onConfirmar={sorteo.guardarSorteo}
                ordenSorteo={sorteo.ordenSorteo}
                partidosPrimeraRonda={sorteo.partidosPrimeraRonda}
                puedeConfirmar={sorteo.puedeConfirmar}
                tamanoBracket={sorteo.tamanoBracket}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
