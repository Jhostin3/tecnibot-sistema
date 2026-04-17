import { CampoTexto } from '../atoms/CampoTexto'
import { Etiqueta } from '../atoms/Etiqueta'

export function CampoFormulario({ etiqueta, id, ...propiedades }) {
  return (
    <div className="space-y-2 text-left">
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <CampoTexto id={id} name={id} {...propiedades} />
    </div>
  )
}
