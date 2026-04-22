import { Trophy } from 'lucide-react'

export function PantallaGanador({ esWalkover = false, ganador, subcategoria }) {
  if (!ganador) return null

  return (
    <section className="rounded-3xl border-2 border-yellow-600 bg-gradient-to-b from-gray-900 to-gray-950 p-8 text-center shadow-xl">
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
    </section>
  )
}
