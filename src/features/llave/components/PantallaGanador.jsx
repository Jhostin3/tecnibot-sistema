export function PantallaGanador({ ganador, subcategoria }) {
  if (!ganador) return null

  return (
    <section className="rounded-2xl border border-yellow-700 bg-gradient-to-br from-yellow-900 to-gray-900 p-8 text-center shadow-xl">
      <p className="animate-bounce text-5xl">TROFEO</p>
      <p className="mt-4 text-4xl font-bold uppercase tracking-normal text-yellow-400">
        Campeon
      </p>
      <h2 className="mt-6 break-words text-5xl font-black text-white">
        {ganador.nombre_equipo}
      </h2>
      <p className="mt-3 text-xl font-semibold text-yellow-200">
        Robot: {ganador.nombre_robot || 'Sin nombre registrado'}
      </p>
      <p className="mt-2 text-lg text-gray-200">
        Subcategoria: {subcategoria?.nombre || 'Sin subcategoria'}
      </p>
      <p className="mt-8 text-base font-bold uppercase tracking-normal text-yellow-300">
        TecniBot Cuenca 2026
      </p>
    </section>
  )
}
