import { useState } from 'react'

import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { EncabezadoEquipos } from '../components/EncabezadoEquipos'
import { FormularioEquipo } from '../components/FormularioEquipo'
import { ResumenImportacion } from '../components/ResumenImportacion'
import { SelectorArchivoEquipos } from '../components/SelectorArchivoEquipos'
import { TablaEquipos } from '../components/TablaEquipos'
import { VistaPreviaImportacion } from '../components/VistaPreviaImportacion'
import { useEquipos } from '../hooks/useEquipos'
import { useImportacionEquipos } from '../hooks/useImportacionEquipos'

export function PaginaEquipos() {
  const equipos = useEquipos()
  const importacion = useImportacionEquipos({
    alFinalizar: equipos.recargarEquipos,
    subcategorias: equipos.subcategorias,
  })
  const [modo, setModo] = useState('importar')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)

  function abrirCreacion() {
    setEquipoSeleccionado(null)
    setModo('crear')
    equipos.setMensaje('')
  }

  function abrirEdicion(equipo) {
    setEquipoSeleccionado(equipo)
    setModo('editar')
    equipos.setMensaje('')
  }

  async function manejarGuardar(equipo) {
    await equipos.guardarEquipo(equipo)
    setModo('importar')
    setEquipoSeleccionado(null)
  }

  async function manejarEliminar(idEquipo) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este equipo?')

    if (!confirmar) return

    try {
      await equipos.borrarEquipo(idEquipo)
    } catch (error) {
      equipos.setMensaje(error.message)
    }
  }

  return (
    <section className="space-y-6">
      <EncabezadoEquipos
        alCrear={abrirCreacion}
        alImportar={() => setModo('importar')}
      />
      <MensajeEstado>{equipos.mensaje}</MensajeEstado>
      {modo === 'importar' ? (
        <>
          <ResumenImportacion resumen={importacion.resumen} />
          <SelectorArchivoEquipos
            archivo={importacion.archivo}
            cargando={importacion.cargando}
            mensaje={importacion.mensaje}
            onProcesar={importacion.procesarArchivo}
            onSeleccionar={importacion.seleccionarArchivo}
          />
          <VistaPreviaImportacion
            cargando={importacion.cargando}
            filas={importacion.filas}
            filasValidas={importacion.filasValidas}
            onConfirmar={importacion.confirmarImportacion}
          />
        </>
      ) : (
        <FormularioEquipo
          alCancelar={() => setModo('importar')}
          alGuardar={manejarGuardar}
          equipo={equipoSeleccionado}
          key={equipoSeleccionado?.id || 'nuevo-equipo'}
          subcategorias={equipos.subcategorias}
        />
      )}
      {equipos.cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando equipos...
        </div>
      ) : (
        <TablaEquipos
          alEditar={abrirEdicion}
          alEliminar={manejarEliminar}
          equipos={equipos.equipos}
        />
      )}
    </section>
  )
}
