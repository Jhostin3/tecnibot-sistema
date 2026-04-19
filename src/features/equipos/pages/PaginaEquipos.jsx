import { useMemo, useState } from 'react'

import { Boton } from '../../../components/atoms/Boton'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { EncabezadoEquipos } from '../components/EncabezadoEquipos'
import { FormularioEquipo } from '../components/FormularioEquipo'
import { ResumenImportacion } from '../components/ResumenImportacion'
import { SelectorArchivoEquipos } from '../components/SelectorArchivoEquipos'
import { TablaEquipos } from '../components/TablaEquipos'
import { VistaPreviaImportacion } from '../components/VistaPreviaImportacion'
import { useEquipos } from '../hooks/useEquipos'
import { useImportacionEquipos } from '../hooks/useImportacionEquipos'

const equiposPorPagina = 20

export function PaginaEquipos() {
  const equipos = useEquipos()
  const importacion = useImportacionEquipos({
    alFinalizar: equipos.recargarEquipos,
    subcategorias: equipos.subcategorias,
  })
  const [modo, setModo] = useState('importar')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const totalEquipos = equipos.equipos.length
  const totalPaginas = Math.max(1, Math.ceil(totalEquipos / equiposPorPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const inicio = totalEquipos ? (paginaSegura - 1) * equiposPorPagina + 1 : 0
  const fin = Math.min(paginaSegura * equiposPorPagina, totalEquipos)
  const equiposPaginados = useMemo(
    () => equipos.equipos.slice(inicio ? inicio - 1 : 0, fin),
    [equipos.equipos, fin, inicio],
  )

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
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {inicio}-{fin} de {totalEquipos} equipos
            </p>
            <div className="flex gap-3">
              <Boton
                disabled={paginaSegura === 1}
                onClick={() => setPaginaActual((actual) => Math.max(1, actual - 1))}
                variante="secundario"
              >
                Anterior
              </Boton>
              <Boton
                disabled={paginaSegura === totalPaginas}
                onClick={() => setPaginaActual((actual) => Math.min(totalPaginas, actual + 1))}
                variante="secundario"
              >
                Siguiente
              </Boton>
            </div>
          </div>
          <TablaEquipos
            alEditar={abrirEdicion}
            alEliminar={manejarEliminar}
            equipos={equiposPaginados}
          />
        </div>
      )}
    </section>
  )
}
