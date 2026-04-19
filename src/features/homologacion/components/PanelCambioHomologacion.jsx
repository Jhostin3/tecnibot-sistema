import { useState } from 'react'

import { AreaTexto } from '../../../components/atoms/AreaTexto'
import { Boton } from '../../../components/atoms/Boton'
import { Etiqueta } from '../../../components/atoms/Etiqueta'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { obtenerEtiquetaEstadoHomologacion } from '../hooks/usarHomologaciones'

export function PanelCambioHomologacion({
  cambio,
  guardando,
  onCancelar,
  onConfirmar,
}) {
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')

  if (!cambio) {
    return null
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setMensaje('')

    try {
      await onConfirmar({
        equipoId: cambio.equipo.id,
        estado: cambio.estado,
        observacion,
      })
      setObservacion('')
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <form className="space-y-4 rounded-md border border-cyan-200 bg-cyan-50 p-5" onSubmit={manejarEnvio}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-cyan-800">
          Cambio de homologacion
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          {cambio.equipo.nombre_equipo}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Nuevo estado: {obtenerEtiquetaEstadoHomologacion(cambio.estado)}
        </p>
      </div>
      <div className="space-y-2">
        <Etiqueta htmlFor="observacion">Observaciones</Etiqueta>
        <AreaTexto
          id="observacion"
          name="observacion"
          onChange={(evento) => setObservacion(evento.target.value)}
          placeholder="Registra detalles de la revision realizada."
          value={observacion}
        />
      </div>
      <MensajeEstado>{mensaje}</MensajeEstado>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Boton disabled={guardando} onClick={onCancelar} variante="secundario">
          Cancelar
        </Boton>
        <Boton disabled={guardando} tipo="submit">
          {guardando ? 'Guardando...' : 'Guardar cambio'}
        </Boton>
      </div>
    </form>
  )
}
