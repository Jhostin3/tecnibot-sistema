import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function FiltrosHomologacion({
  filtros,
  onCambiarFiltro,
  subcategorias = [],
}) {
  const categorias = Array.from(
    new Map(
      subcategorias
        .filter((subcategoria) => subcategoria.categorias?.id)
        .map((subcategoria) => [subcategoria.categorias.id, subcategoria.categorias]),
    ).values(),
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  const subcategoriasFiltradas = filtros.categoriaId
    ? subcategorias.filter((subcategoria) => subcategoria.categoria_id === filtros.categoriaId)
    : subcategorias

  return (
    <div className="w-full rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Etiqueta htmlFor="categoriaId">Categoria</Etiqueta>
          <CampoSeleccion
            id="categoriaId"
            name="categoriaId"
            onChange={(evento) => {
              onCambiarFiltro('categoriaId', evento.target.value)
              onCambiarFiltro('subcategoriaId', '')
            }}
            value={filtros.categoriaId}
          >
            <option value="">Todas las categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </CampoSeleccion>
        </div>
        <div className="space-y-2">
          <Etiqueta htmlFor="subcategoriaId">Subcategoria</Etiqueta>
          <CampoSeleccion
            id="subcategoriaId"
            name="subcategoriaId"
            onChange={(evento) => onCambiarFiltro('subcategoriaId', evento.target.value)}
            value={filtros.subcategoriaId}
          >
            <option value="">Todas las subcategorias</option>
            {subcategoriasFiltradas.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nombre}
              </option>
            ))}
          </CampoSeleccion>
        </div>
      </div>
    </div>
  )
}
