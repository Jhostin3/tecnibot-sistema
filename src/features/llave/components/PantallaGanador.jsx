import { Award, Medal, Trophy } from 'lucide-react'
import { obtenerResumenPodio } from '../utils/resumenPodio'

function TarjetaPodio({ colorClase, descripcion, etiqueta, equipos = [], icono }) {
  if (!equipos.length) return null

  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-900/70 p-5 text-left">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClase}`}>
          {icono}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {etiqueta}
          </p>
          <p className="text-sm text-gray-400">
            {descripcion}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {equipos.map((equipo) => (
          <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3" key={equipo.id}>
            <p className="text-lg font-bold text-white">{equipo.nombre_equipo}</p>
            {equipo.nombre_robot ? (
              <p className="mt-1 text-sm text-gray-400">Robot: {equipo.nombre_robot}</p>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  )
}

export function PantallaGanador({
  enfrentamientos = [],
  esWalkover = false,
  ganador,
  subcategoria,
}) {
  if (!ganador) return null

  const { subcampeon, tercerLugar } = obtenerResumenPodio(
    enfrentamientos,
    ganador,
    esWalkover,
  )

  return (
    <section className="space-y-8 rounded-3xl border-2 border-yellow-600 bg-gradient-to-b from-gray-900 to-gray-950 p-8 text-center shadow-xl">
      <Trophy className="mx-auto h-20 w-20 text-yellow-400" />
      <p
        className={`mx-auto mt-5 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-widest ${
          esWalkover
            ? 'bg-amber-900 text-amber-300'
            : 'bg-yellow-900 text-yellow-300'
        }`}
      >
        {esWalkover ? 'CAMPEON POR WALKOVER' : 'CAMPEON'}
      </p>
      <h2 className="mt-4 break-words text-4xl font-black text-white">
        {ganador.nombre_equipo}
      </h2>
      <p className="mt-2 text-lg text-gray-400">
        Campeon de {subcategoria?.nombre || 'esta subcategoria'}
      </p>
      {ganador.nombre_robot ? (
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Robot: {ganador.nombre_robot}
        </p>
      ) : null}
      {esWalkover ? (
        <p className="mt-3 text-sm text-amber-400">
          Unico equipo inscrito en esta categoria
        </p>
      ) : null}
      <p className="mt-6 text-sm text-gray-500">
        TecniBot Cuenca 2026
      </p>

      {!esWalkover ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <TarjetaPodio
            colorClase="bg-slate-200 text-slate-700"
            descripcion="Posicion final"
            equipos={subcampeon ? [subcampeon] : []}
            etiqueta="Segundo lugar"
            icono={<Medal className="h-5 w-5" />}
          />
          <TarjetaPodio
            colorClase="bg-amber-700 text-amber-100"
            descripcion="Posicion final"
            equipos={tercerLugar ? [tercerLugar] : []}
            etiqueta="Tercer lugar"
            icono={<Award className="h-5 w-5" />}
          />
        </div>
      ) : null}

      {!esWalkover && !tercerLugar ? (
        <p className="text-sm text-gray-500">
          El tercer lugar solo se mostrara cuando exista una forma unica de determinarlo.
        </p>
      ) : null}
    </section>
  )
}
