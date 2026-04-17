import { AreaTexto } from '../../../components/atoms/AreaTexto'
import { CampoSeleccion } from '../../../components/atoms/CampoSeleccion'
import { CampoTexto } from '../../../components/atoms/CampoTexto'
import { Etiqueta } from '../../../components/atoms/Etiqueta'

export function CampoFormularioEquipo({
  children,
  etiqueta,
  id,
  tipo = 'texto',
  ...propiedades
}) {
  const componente =
    tipo === 'seleccion' ? (
      <CampoSeleccion id={id} name={id} {...propiedades}>
        {children}
      </CampoSeleccion>
    ) : tipo === 'area' ? (
      <AreaTexto id={id} name={id} {...propiedades} />
    ) : (
      <CampoTexto id={id} name={id} {...propiedades} />
    )

  return (
    <div className="space-y-2">
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      {componente}
    </div>
  )
}
