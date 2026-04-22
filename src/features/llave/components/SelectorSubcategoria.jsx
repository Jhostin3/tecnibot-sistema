export function SelectorSubcategoria({
  alSeleccionar,
  estadosSubcategorias = {},
  subcategoriaSeleccionada,
  subcategorias,
}) {
  if (!subcategorias?.length) {
    return (
      <p className="rounded-xl border border-gray-700 bg-gray-900 p-4 text-gray-400">
        No hay subcategorias disponibles.
      </p>
    )
  }

  function obtenerIndicador(estado) {
    if (estado === 'walkover') {
      return <span className="text-amber-400">▲</span>
    }

    if (estado === 'finalizado') {
      return <span className="text-yellow-400">★</span>
    }

    if (estado === 'en_curso') {
      return <span className="animate-pulse text-cyan-400">●</span>
    }

    return <span className="text-gray-600">●</span>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {subcategorias.map((subcategoria) => {
        const seleccionado = subcategoriaSeleccionada === subcategoria.id

        return (
          <button
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition ${
              seleccionado
                ? 'bg-cyan-500 text-black'
                : 'border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            key={subcategoria.id}
            onClick={() => alSeleccionar(subcategoria.id)}
            type="button"
          >
            <span>{subcategoria.nombre}</span>
            {obtenerIndicador(estadosSubcategorias[subcategoria.id])}
          </button>
        )
      })}
    </div>
  )
}
