import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import { SidebarHomologador } from '../../homologacion/components/SidebarHomologador'
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
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
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

  const contenido = (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          className="mb-5 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-blue-600"
          onClick={() => navigate('/')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          Inicio
        </button>
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Ruleta de homologacion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          Sorteo Soccer
        </h1>
        <p className="mt-1 w-full text-sm text-slate-500">
          Selecciona una subcategoria lista, gira la ruleta con los equipos aprobados y genera la primera ronda del bracket.
        </p>
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
                esUltimo={sorteo.equiposDisponibles.length === 1}
                girando={sorteo.girando}
                onAsignarUltimo={sorteo.asignarUltimoEquipo}
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

  if (perfil?.rol === 'homologador') {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <SidebarHomologador activo="sorteo" />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-8">{contenido}</div>
        </main>
      </div>
    )
  }

  return <div className="p-6 py-8">{contenido}</div>
}
