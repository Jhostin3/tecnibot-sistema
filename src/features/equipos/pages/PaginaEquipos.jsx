import { useState } from 'react'

import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { EncabezadoEquipos } from '../components/EncabezadoEquipos'
import { FormularioEquipo } from '../components/FormularioEquipo'
import { TablaEquipos } from '../components/TablaEquipos'
import { useEquipos } from '../hooks/useEquipos'

export function PaginaEquipos() {
  const {
    borrarEquipo,
    cargando,
    equipos,
    guardarEquipo,
    mensaje,
    setMensaje,
    subcategorias,
  } = useEquipos()
  const [formularioVisible, setFormularioVisible] = useState(false)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)

  function abrirCreacion() {
    setEquipoSeleccionado(null)
    setFormularioVisible(true)
    setMensaje('')
  }

  function abrirEdicion(equipo) {
    setEquipoSeleccionado(equipo)
    setFormularioVisible(true)
    setMensaje('')
  }

  async function manejarGuardar(equipo) {
    await guardarEquipo(equipo)
    setFormularioVisible(false)
    setEquipoSeleccionado(null)
  }

  async function manejarEliminar(idEquipo) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este equipo?')

    if (!confirmar) return

    try {
      await borrarEquipo(idEquipo)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <section className="space-y-6">
      <EncabezadoEquipos alCrear={abrirCreacion} />
      <MensajeEstado>{mensaje}</MensajeEstado>
      {formularioVisible ? (
        <FormularioEquipo
          alCancelar={() => setFormularioVisible(false)}
          alGuardar={manejarGuardar}
          equipo={equipoSeleccionado}
          key={equipoSeleccionado?.id || 'nuevo-equipo'}
          subcategorias={subcategorias}
        />
      ) : null}
      {cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando equipos...
        </div>
      ) : (
        <TablaEquipos
          alEditar={abrirEdicion}
          alEliminar={manejarEliminar}
          equipos={equipos}
        />
      )}
    </section>
  )
}
