import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function FiltrosHomologacion({
  filtros,
  onCambiarFiltro,
  subcategorias = [],
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <Etiqueta htmlFor="subcategoriaId">Subcategoria</Etiqueta>
        <CampoSeleccion
          id="subcategoriaId"
          name="subcategoriaId"
          onChange={(evento) => onCambiarFiltro('subcategoriaId', evento.target.value)}
          value={filtros.subcategoriaId}
        >
          <option value="">Todas las subcategorias</option>
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
