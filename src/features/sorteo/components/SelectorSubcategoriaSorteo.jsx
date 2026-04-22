import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function SelectorSubcategoriaSorteo({
  categoriaId,
  categorias = [],
  onSeleccionarCategoria,
  onSeleccionar,
  subcategoriaId,
  subcategorias = [],
}) {
  function obtenerBadgeSubcategoria(subcategoria) {
    if (subcategoria.campeonAutomatico) {
      return (
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
          1 equipo — campeon automatico
        </span>
      )
    }

    return (
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
        {subcategoria.equipos_aprobados} equipos aprobados
      </span>
    )
  }

  return (
    <div className="grid w-full gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <div className="space-y-2">
        <Etiqueta htmlFor="categoriaSorteo">Categoria</Etiqueta>
        <CampoSeleccion
          id="categoriaSorteo"
          name="categoriaSorteo"
          onChange={(evento) => onSeleccionarCategoria(evento.target.value)}
          value={categoriaId}
        >
          <option value="">Selecciona una categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </CampoSeleccion>
      </div>
      <div className="space-y-2">
        <Etiqueta htmlFor="subcategoriaSorteo">Subcategoria</Etiqueta>
        <CampoSeleccion
          disabled={!categoriaId}
          id="subcategoriaSorteo"
          name="subcategoriaSorteo"
          onChange={(evento) => onSeleccionar(evento.target.value)}
          value={subcategoriaId}
        >
          <option value="">Selecciona una subcategoria</option>
          {subcategorias.map((subcategoria) => (
            <option key={subcategoria.id} value={subcategoria.id}>
              {subcategoria.nombre} - {subcategoria.equipos_aprobados} equipo{subcategoria.equipos_aprobados === 1 ? '' : 's'}
            </option>
          ))}
        </CampoSeleccion>
        {subcategorias.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {subcategorias.map((subcategoria) => (
              <button
                className={`flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                  subcategoriaId === subcategoria.id
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300'
                }`}
                key={subcategoria.id}
                onClick={() => onSeleccionar(subcategoria.id)}
                type="button"
              >
                <span className="font-semibold">{subcategoria.nombre}</span>
                {obtenerBadgeSubcategoria(subcategoria)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
