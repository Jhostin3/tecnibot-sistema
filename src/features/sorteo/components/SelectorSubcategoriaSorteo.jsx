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
              {subcategoria.nombre}
            </option>
          ))}
        </CampoSeleccion>
      </div>
    </div>
  )
}
