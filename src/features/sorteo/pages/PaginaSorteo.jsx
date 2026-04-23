import { ChevronLeft, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import { SidebarHomologador } from '../../homologacion/components/SidebarHomologador'
import { GridBrackets } from '../components/GridBrackets'
import { OrdenBatalla } from '../components/OrdenBatalla'
import { RuletaEquipos } from '../components/RuletaEquipos'
import { SelectorSubcategoriaSorteo } from '../components/SelectorSubcategoriaSorteo'
import { useModoSorteo } from '../hooks/useModoSorteo'
import { useSorteo } from '../hooks/usarSorteo'
import {
  MAX_EQUIPOS_POR_SUBCATEGORIA,
  MIN_EQUIPOS_PARA_SORTEO,
} from '../services/servicioSorteo'
import { listarSubcategoriasConSorteo } from '../services/servicioSorteo'
import { modosSorteo } from '../utils/modoSorteo'

function obtenerMensajeValidacion({
  cantidadByes,
  esCampeonAutomatico,
  equipos = [],
  nombrePrimeraRonda,
  sorteoExistente = [],
  subcategoriaId,
  subcategorias = [],
}) {
  if (!subcategorias || !subcategorias.length) {
    return 'No hay subcategorias listas para sorteo.'
  }

  if (!subcategoriaId) {
    return 'Selecciona una subcategoria lista para iniciar la ruleta.'
  }

  if (sorteoExistente.length) {
    return 'El sorteo ya fue registrado para esta subcategoria.'
  }

  if (esCampeonAutomatico) {
    return 'Hay 1 equipo aprobado. Esta subcategoria se registra como campeon automatico.'
  }

  if (equipos.length > MAX_EQUIPOS_POR_SUBCATEGORIA) {
    return 'El sistema soporta hasta 64 equipos por subcategoría'
  }

  if (equipos.length < MIN_EQUIPOS_PARA_SORTEO) {
    return `Hay ${equipos.length} equipos aprobados. El sorteo requiere al menos 4 equipos.`
  }

  return `${equipos.length} equipos aprobados → se agregarán ${cantidadByes} BYEs → ${nombrePrimeraRonda} de final`
}

function CardCampeonAutomatico({ equipo, guardando, onConfirmar }) {
  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-8">
      <Trophy className="h-16 w-16 text-amber-500" />
      <h2 className="mt-4 text-xl font-bold text-amber-700">
        Campeon automatico
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        Solo hay 1 equipo inscrito en esta subcategoria.
      </p>
      <div className="mt-6 space-y-2 text-sm text-slate-800">
        <p>
          <span className="font-bold">Equipo:</span> {equipo?.nombre_equipo || '-'}
        </p>
        <p>
          <span className="font-bold">Robot:</span> {equipo?.nombre_robot || '-'}
        </p>
        <p>
          <span className="font-bold">Institucion:</span> {equipo?.institucion || '-'}
        </p>
      </div>
      <button
        className="mt-6 h-12 rounded-xl bg-amber-500 px-6 font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={guardando || !equipo}
        onClick={onConfirmar}
        type="button"
      >
        {guardando ? 'Confirmando...' : 'Confirmar campeon y omitir sorteo'}
      </button>
    </section>
  )
}

function BotonVerBracket({ onClick }) {
  return (
    <button
      className="inline-flex h-14 items-center justify-center rounded-xl bg-indigo-600 px-8 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700"
      onClick={onClick}
      type="button"
    >
      <Trophy className="mr-2 h-5 w-5" />
      Ver bracket completo →
    </button>
  )
}

function PanelModoPresencial({ brackets = [] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center text-teal-700">
        Modo presencial activo. Los numeros de bola se asignan al momento de
        aprobar cada equipo en Homologacion.
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Brackets generados</h2>
        <p className="mt-1 text-sm text-slate-500">
          Consulta las llaves que ya completaron el sorteo presencial.
        </p>
        <div className="mt-4">
          <GridBrackets brackets={brackets} />
        </div>
      </section>
    </div>
  )
}

export function PaginaSorteo() {
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
  const modoSorteo = useModoSorteo()
  const sorteo = useSorteo()
  const [bracketsPresenciales, setBracketsPresenciales] = useState([])
  const esModoPresencial = modoSorteo === modosSorteo.presencial
  const subcategoriasFiltradas = sorteo.categoriaId
    ? sorteo.subcategorias.filter(
        (subcategoria) => subcategoria.categoria_id === sorteo.categoriaId,
      )
    : []
  const mensajeValidacion = obtenerMensajeValidacion({
    cantidadByes: sorteo.cantidadByes,
    esCampeonAutomatico: sorteo.esCampeonAutomatico,
    equipos: sorteo.equipos,
    nombrePrimeraRonda: sorteo.nombrePrimeraRonda,
    partidosPrimeraRonda: sorteo.partidosPrimeraRonda,
    sorteoExistente: sorteo.sorteoExistente,
    subcategoriaId: sorteo.subcategoriaId,
    subcategorias: sorteo.subcategorias,
    tamanoBracket: sorteo.tamanoBracket,
  })

  useEffect(() => {
    let activo = true

    async function cargarBracketsPresenciales() {
      if (!esModoPresencial) {
        setBracketsPresenciales([])
        return
      }

      try {
        const brackets = await listarSubcategoriasConSorteo()

        if (activo) {
          setBracketsPresenciales(brackets)
        }
      } catch {
        if (activo) {
          setBracketsPresenciales([])
        }
      }
    }

    cargarBracketsPresenciales()

    return () => {
      activo = false
    }
  }, [esModoPresencial])

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
      {esModoPresencial ? (
        <PanelModoPresencial brackets={bracketsPresenciales} />
      ) : sorteo.subcategorias.length ? (
        <SelectorSubcategoriaSorteo
          categoriaId={sorteo.categoriaId}
          categorias={sorteo.categorias}
          onSeleccionarCategoria={sorteo.seleccionarCategoria}
          onSeleccionar={sorteo.seleccionarSubcategoria}
          subcategoriaId={sorteo.subcategoriaId}
          subcategorias={subcategoriasFiltradas}
        />
      ) : null}
      {!esModoPresencial ? <MensajeEstado>{sorteo.mensaje}</MensajeEstado> : null}
      {!esModoPresencial && (sorteo.cargando || sorteo.cargandoEquipos) ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando datos del sorteo...
        </div>
      ) : !esModoPresencial ? (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            {mensajeValidacion}
          </div>
          {sorteo.subcategoriaId && sorteo.sorteoExistente.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <BotonVerBracket
                onClick={() => navigate(`/bracket/${sorteo.subcategoriaId}`)}
              />
            </div>
          ) : null}
          {sorteo.subcategoriaId && !sorteo.sorteoExistente.length ? (
            sorteo.esCampeonAutomatico ? (
              <CardCampeonAutomatico
                equipo={sorteo.equipoCampeon}
                guardando={sorteo.guardando}
                onConfirmar={sorteo.confirmarCampeonAutomatico}
              />
            ) : (
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
                  nombrePrimeraRonda={sorteo.nombrePrimeraRonda}
                  onConfirmar={sorteo.guardarSorteo}
                  ordenSorteo={sorteo.ordenSorteo}
                  partidosPrimeraRonda={sorteo.partidosPrimeraRonda}
                  puedeConfirmar={sorteo.puedeConfirmar}
                  tamanoBracket={sorteo.tamanoBracket}
                />
              </div>
            )
          ) : null}
        </>
      ) : null}
    </section>
  )

  const controlesSorteo = (
    <>
      {esModoPresencial ? (
        <PanelModoPresencial brackets={bracketsPresenciales} />
      ) : sorteo.subcategorias.length ? (
        <SelectorSubcategoriaSorteo
          categoriaId={sorteo.categoriaId}
          categorias={sorteo.categorias}
          onSeleccionarCategoria={sorteo.seleccionarCategoria}
          onSeleccionar={sorteo.seleccionarSubcategoria}
          subcategoriaId={sorteo.subcategoriaId}
          subcategorias={subcategoriasFiltradas}
        />
      ) : null}
      {!esModoPresencial ? <MensajeEstado>{sorteo.mensaje}</MensajeEstado> : null}
      {!esModoPresencial ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          {mensajeValidacion}
        </div>
      ) : null}
    </>
  )

  const tableroSorteo = !esModoPresencial && sorteo.subcategoriaId && !sorteo.sorteoExistente.length ? (
    sorteo.esCampeonAutomatico ? (
      <div className="p-6">
        <CardCampeonAutomatico
          equipo={sorteo.equipoCampeon}
          guardando={sorteo.guardando}
          onConfirmar={sorteo.confirmarCampeonAutomatico}
        />
      </div>
    ) : (
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <RuletaEquipos
          angulo={sorteo.anguloRuleta}
          compacto
          duracion={sorteo.duracionGiro}
          equipoGirado={sorteo.equipoGirado}
          equipos={sorteo.equiposDisponibles}
          esUltimo={sorteo.equiposDisponibles.length === 1}
          girando={sorteo.girando}
          onAsignarUltimo={sorteo.asignarUltimoEquipo}
          onGirar={sorteo.girarRuleta}
        />
      </div>
      <OrdenBatalla
        cantidadByes={sorteo.cantidadByes}
        compacto
        guardando={sorteo.guardando}
        nombrePrimeraRonda={sorteo.nombrePrimeraRonda}
        onConfirmar={sorteo.guardarSorteo}
        ordenSorteo={sorteo.ordenSorteo}
        partidosPrimeraRonda={sorteo.partidosPrimeraRonda}
        puedeConfirmar={sorteo.puedeConfirmar}
        tamanoBracket={sorteo.tamanoBracket}
      />
    </div>
    )
  ) : null

  if (perfil?.rol === 'homologador') {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <SidebarHomologador activo="sorteo" />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-4 p-6 pb-0">
            {controlesSorteo}
            {sorteo.cargando || sorteo.cargandoEquipos ? (
              <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Cargando datos del sorteo...
              </div>
            ) : null}
            {!esModoPresencial && !sorteo.cargando && !sorteo.cargandoEquipos && sorteo.subcategoriaId && sorteo.sorteoExistente.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <BotonVerBracket
                  onClick={() => navigate(`/bracket/${sorteo.subcategoriaId}`)}
                />
              </div>
            ) : null}
          </div>
          {!sorteo.cargando && !sorteo.cargandoEquipos ? tableroSorteo : null}
        </main>
      </div>
    )
  }

  return <div className="p-6 py-8">{contenido}</div>
}
