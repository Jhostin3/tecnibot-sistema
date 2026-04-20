export function SelectorSubcategoria({
  alSeleccionar,
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

  return (
    <div className="flex flex-wrap gap-3">
      {subcategorias.map((subcategoria) => (
        <button
          className={`min-h-11 rounded-xl px-6 py-2 text-sm font-bold transition ${
            subcategoriaSeleccionada === subcategoria.id
              ? 'bg-cyan-500 text-black'
              : 'border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
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
