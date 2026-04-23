import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { listarSubcategoriasSorteo } from './services/servicioSorteo'
import { useBracketSorteo } from './hooks/usarBracketSorteo'

const ordenRondas = [
  'treintaidosavos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinal',
  'final',
]

const titulosRonda = {
  cuartos: 'Cuartos',
  dieciseisavos: 'Dieciseisavos',
  final: 'Final',
  octavos: 'Octavos',
  semifinal: 'Semifinal',
  treintaidosavos: 'Treintaidosavos',
}

function agruparPorRonda(enfrentamientos = []) {
  return enfrentamientos.reduce((grupos, enfrentamiento) => {
    if (!grupos[enfrentamiento.ronda]) {
      grupos[enfrentamiento.ronda] = []
    }

    grupos[enfrentamiento.ronda].push(enfrentamiento)
    return grupos
  }, {})
}

function obtenerBola(enfrentamiento, lado) {
  const bola = lado === 'a' ? enfrentamiento.bola_a : enfrentamiento.bola_b

  return bola || '-'
}

function FilaEquipo({ equipo, enfrentamiento, lado }) {
  const esBye = enfrentamiento.bye && lado === 'b' && !equipo

  if (!equipo && !esBye) {
    return (
      <div className="flex min-h-14 items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-sm italic text-slate-400">
        Por definir
      </div>
    )
  }

  if (esBye) {
    return (
      <div className="flex min-h-14 items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-sm italic text-slate-400">
        BYE
      </div>
    )
  }

  const esGanador = equipo?.id && equipo.id === enfrentamiento.ganador_id

  return (
    <div
      className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 ${
        esGanador
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600">
        {obtenerBola(enfrentamiento, lado)}
      </span>
      <span
        className={`min-w-0 flex-1 truncate font-semibold ${
          esGanador ? 'text-emerald-700' : 'text-slate-800'
        }`}
      >
        {equipo.nombre_equipo}
      </span>
    </div>
  )
}

function TarjetaBracket({ enfrentamiento }) {
  return (
    <article className="relative min-w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Partido {enfrentamiento.orden}
      </p>
      <div className="space-y-2">
        <FilaEquipo
          enfrentamiento={enfrentamiento}
          equipo={enfrentamiento.equipo_a}
          lado="a"
        />
        <FilaEquipo
          enfrentamiento={enfrentamiento}
          equipo={enfrentamiento.equipo_b}
          lado="b"
        />
      </div>
      <div className="absolute -right-10 top-1/2 hidden h-px w-10 bg-slate-300 xl:block" />
    </article>
  )
}

function ColumnaRonda({ partidos, titulo }) {
  return (
    <section className="flex min-w-64 flex-col gap-6">
      <h2 className="border-b border-slate-200 pb-3 text-center text-sm font-bold uppercase tracking-widest text-slate-500">
        {titulo}
      </h2>
      <div className="flex flex-col gap-8">
        {partidos.map((partido) => (
          <TarjetaBracket enfrentamiento={partido} key={partido.id} />
        ))}
      </div>
    </section>
  )
}

export function PaginaBracketCompleto() {
  const { subcategoriaId } = useParams()
  const navigate = useNavigate()
  const bracket = useBracketSorteo(subcategoriaId)
  const [nombreSubcategoria, setNombreSubcategoria] = useState('Subcategoria')

  useEffect(() => {
    let activo = true

    async function cargarSubcategoria() {
      try {
        const subcategorias = await listarSubcategoriasSorteo()
        const subcategoriaActual = subcategorias.find(
          (subcategoria) => subcategoria.id === subcategoriaId,
        )

        if (activo && subcategoriaActual) {
          setNombreSubcategoria(subcategoriaActual.nombre)
        }
      } catch {
        if (activo) {
          setNombreSubcategoria('Subcategoria')
        }
      }
    }

    cargarSubcategoria()

    return () => {
      activo = false
    }
  }, [subcategoriaId])

  const rondas = useMemo(() => {
    const grupos = agruparPorRonda(bracket.enfrentamientos)

    return ordenRondas
      .filter((ronda) => grupos[ronda]?.length)
      .map((ronda) => ({
        partidos: [...grupos[ronda]].sort((a, b) => a.orden - b.orden),
        ronda,
        titulo: titulosRonda[ronda] || ronda,
      }))
  }, [bracket.enfrentamientos])

  return (
    <section className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white p-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
          onClick={() => navigate('/sorteo')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sorteo
        </button>
        <p className="mt-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          {nombreSubcategoria}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Bracket — {nombreSubcategoria}
        </h1>
      </header>

      <main className="w-full overflow-x-auto overscroll-x-contain p-6 pb-8 [scrollbar-gutter:stable]">
        {bracket.cargando ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando bracket...
          </div>
        ) : null}

        {!bracket.cargando && bracket.mensaje ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-red-600 shadow-sm">
            {bracket.mensaje}
          </div>
        ) : null}

        {!bracket.cargando && !bracket.mensaje ? (
          <div className="flex min-w-[1120px] gap-16 overflow-visible pb-6 sm:min-w-max">
            {rondas.map((ronda) => (
              <ColumnaRonda
                key={ronda.ronda}
                partidos={ronda.partidos}
                titulo={ronda.titulo}
              />
            ))}
          </div>
        ) : null}
      </main>
    </section>
  )
}
