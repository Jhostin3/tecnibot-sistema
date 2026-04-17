import { Insignia } from '../atoms/Insignia'

export function EncabezadoSeccion({ descripcion, etiqueta, titulo }) {
  return (
    <div className="space-y-4">
      {etiqueta ? <Insignia>{etiqueta}</Insignia> : null}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 md:text-4xl">
          {titulo}
        </h1>
        <p className="max-w-xl text-base leading-7 text-slate-600">{descripcion}</p>
      </div>
    </div>
  )
}
