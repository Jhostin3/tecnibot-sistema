import { useMemo, useState } from 'react'

import { ModalActivarPartido } from './components/ModalActivarPartido'
import { TarjetaEnfrentamiento } from './components/TarjetaEnfrentamiento'
import { usePartidos } from './usarPartidos'

const pestanas = [
  { etiqueta: 'Pendientes', valor: 'pendientes' },
  { etiqueta: 'En juego', valor: 'activos' },
  { etiqueta: 'Finalizados', valor: 'finalizados' },
]

const canchasBase = ['Cancha 1', 'Cancha 2', 'Cancha 3']

function crearClaveGrupo(partido) {
  return `${partido.subcategoria?.nombre || 'Subcategoria'} - ${partido.etiqueta_ronda}`
}

function agruparPartidos(partidos) {
  return partidos.reduce((grupos, partido) => {
    const clave = crearClaveGrupo(partido)

    if (!grupos[clave]) {
      grupos[clave] = []
    }

    grupos[clave].push(partido)
    return grupos
  }, {})
}

function ListaPartidos({
  alActivar,
  alDesactivar,
  guardando,
  mensajeVacio,
  partidos,
}) {
  const grupos = useMemo(() => agruparPartidos(partidos || []), [partidos])
  const entradas = Object.entries(grupos)

  if (!partidos?.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-600">{mensajeVacio}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {entradas.map(([grupo, partidosGrupo]) => (
        <section className="space-y-3" key={grupo}>
          <h2 className="text-lg font-bold text-slate-800">{grupo}</h2>
          <div className="grid gap-4">
            {partidosGrupo.map((partido) => (
              <TarjetaEnfrentamiento
                alActivar={alActivar}
                alDesactivar={alDesactivar}
                guardando={guardando}
                key={partido.id}
                partido={partido}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function PaginaPartidos() {
  const {
    activarPartido,
    activos,
    cargando,
    desactivarPartido,
    error,
    finalizados,
    guardando,
    mensaje,
    pendientes,
  } = usePartidos()
  const [pestanaActiva, setPestanaActiva] = useState('pendientes')
  const [partidoParaActivar, setPartidoParaActivar] = useState(null)

  const partidosPorPestana = {
    activos,
    finalizados,
    pendientes,
  }
  const mensajesVacios = {
    activos: 'No hay partidos en juego.',
    finalizados: 'Aun no hay partidos finalizados.',
    pendientes: 'No hay partidos pendientes por activar.',
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Organizador
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Gestionar partidos
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Activa enfrentamientos, asigna cancha y revisa el estado del torneo.
        </p>
      </div>

      {mensaje ? (
        <p className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
          {mensaje}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {pestanas.map((pestana) => (
          <button
            className={`min-h-10 rounded-md px-4 py-2 text-sm font-semibold transition ${
              pestanaActiva === pestana.valor
                ? 'bg-cyan-700 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            key={pestana.valor}
            onClick={() => setPestanaActiva(pestana.valor)}
            type="button"
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-600">Cargando partidos...</p>
        </div>
      ) : (
        <ListaPartidos
          alActivar={setPartidoParaActivar}
          alDesactivar={desactivarPartido}
          guardando={guardando}
          mensajeVacio={mensajesVacios[pestanaActiva]}
          partidos={partidosPorPestana[pestanaActiva]}
        />
      )}

      <ModalActivarPartido
        alCerrar={() => setPartidoParaActivar(null)}
        alConfirmar={activarPartido}
        canchas={canchasBase}
        guardando={guardando}
        partido={partidoParaActivar}
      />
    </section>
  )
}
