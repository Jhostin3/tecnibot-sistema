import { useState } from 'react'

import { Boton } from '../../../components/atoms/Boton'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import {
  equipoInicial,
  estadosHomologacion,
  estadosInscripcion,
  prepararEquipoParaGuardar,
} from '../utils/valoresEquipo'
import { CampoFormularioEquipo } from './CampoFormularioEquipo'

export function FormularioEquipo({ alCancelar, alGuardar, equipo, subcategorias = [] }) {
  const [formulario, setFormulario] = useState(() =>
    equipo ? { ...equipoInicial, ...equipo } : equipoInicial,
  )
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setMensaje('')

    if (!formulario.nombre_equipo || !formulario.representante || !formulario.institucion) {
      setMensaje('Completa nombre del equipo, representante e institución.')
      return
    }

    setCargando(true)

    try {
      await alGuardar({
        datos: prepararEquipoParaGuardar(formulario),
        id: equipo?.id,
      })
      setFormulario(equipoInicial)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="space-y-5 rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={manejarEnvio}>
      <div>
        <h2 className="text-xl font-bold text-slate-950">
          {equipo ? 'Editar equipo' : 'Crear equipo'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Los campos marcados como obligatorios deben coincidir con la inscripción.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CampoFormularioEquipo etiqueta="Nombre del equipo" id="nombre_equipo" onChange={manejarCambio} required value={formulario.nombre_equipo} />
        <CampoFormularioEquipo etiqueta="Nombre del robot" id="nombre_robot" onChange={manejarCambio} value={formulario.nombre_robot || ''} />
        <CampoFormularioEquipo etiqueta="Representante" id="representante" onChange={manejarCambio} required value={formulario.representante} />
        <CampoFormularioEquipo etiqueta="Institución" id="institucion" onChange={manejarCambio} required value={formulario.institucion} />
        <CampoFormularioEquipo etiqueta="Correo" id="correo" onChange={manejarCambio} type="email" value={formulario.correo || ''} />
        <CampoFormularioEquipo etiqueta="Subcategoría" id="subcategoria_id" onChange={manejarCambio} tipo="seleccion" value={formulario.subcategoria_id || ''}>
          <option value="">Sin subcategoría</option>
          {subcategorias.map((subcategoria) => (
            <option key={subcategoria.id} value={subcategoria.id}>
              {subcategoria.nombre}
            </option>
          ))}
        </CampoFormularioEquipo>
        <CampoFormularioEquipo etiqueta="Estado de inscripción" id="estado_inscripcion" onChange={manejarCambio} tipo="seleccion" value={formulario.estado_inscripcion}>
          {estadosInscripcion.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </CampoFormularioEquipo>
        <CampoFormularioEquipo etiqueta="Estado de homologación" id="estado_homologacion" onChange={manejarCambio} tipo="seleccion" value={formulario.estado_homologacion}>
          {estadosHomologacion.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </CampoFormularioEquipo>
      </div>
      <CampoFormularioEquipo etiqueta="Observaciones" id="observaciones" onChange={manejarCambio} tipo="area" value={formulario.observaciones || ''} />
      <MensajeEstado>{mensaje}</MensajeEstado>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Boton onClick={alCancelar} variante="secundario">Cancelar</Boton>
        <Boton disabled={cargando} tipo="submit">
          {cargando ? 'Guardando...' : 'Guardar equipo'}
        </Boton>
      </div>
    </form>
  )
}
