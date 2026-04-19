import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function FiltrosHomologacion({
  estados,
  filtros,
  onCambiarFiltro,
  subcategorias,
}) {
  return (
    <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
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
      <div className="space-y-2">
        <Etiqueta htmlFor="estado">Estado</Etiqueta>
        <CampoSeleccion
          id="estado"
          name="estado"
          onChange={(evento) => onCambiarFiltro('estado', evento.target.value)}
          value={filtros.estado}
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado.valor} value={estado.valor}>
              {estado.etiqueta}
            </option>
          ))}
        </CampoSeleccion>
      </div>
    </div>
  )
}
