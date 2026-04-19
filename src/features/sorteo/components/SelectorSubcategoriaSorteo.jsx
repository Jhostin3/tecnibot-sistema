import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function SelectorSubcategoriaSorteo({
  onSeleccionar,
  subcategoriaId,
  subcategorias,
}) {
  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <Etiqueta htmlFor="subcategoriaSorteo">Subcategoria</Etiqueta>
      <CampoSeleccion
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
  )
}
