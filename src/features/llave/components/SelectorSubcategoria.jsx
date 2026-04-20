export function SelectorSubcategoria({
  alSeleccionar,
  subcategoriaSeleccionada,
  subcategorias,
}) {
  if (!subcategorias?.length) {
    return (
      <p className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-gray-400">
        No hay subcategorias disponibles.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subcategorias.map((subcategoria) => (
        <button
          className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold transition ${
            subcategoriaSeleccionada === subcategoria.id
              ? 'border-cyan-500 bg-cyan-500 text-black'
              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-cyan-500 hover:text-white'
          }`}
          key={subcategoria.id}
          onClick={() => alSeleccionar(subcategoria.id)}
          type="button"
        >
          {subcategoria.nombre}
        </button>
      ))}
    </div>
  )
}
