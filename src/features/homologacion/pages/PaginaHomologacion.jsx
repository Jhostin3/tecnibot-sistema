import { useState } from 'react'

import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { FiltrosHomologacion } from '../components/FiltrosHomologacion'
import { PanelCambioHomologacion } from '../components/PanelCambioHomologacion'
import { TablaHomologaciones } from '../components/TablaHomologaciones'
import { useHomologaciones } from '../hooks/usarHomologaciones'

export function PaginaHomologacion() {
  const homologaciones = useHomologaciones()
  const [cambio, setCambio] = useState(null)

  function seleccionarCambio(equipo, estado) {
    homologaciones.setMensaje('')
    setCambio({ equipo, estado })
  }

  async function confirmarCambio(datosCambio) {
    await homologaciones.cambiarEstadoHomologacion(datosCambio)
    setCambio(null)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <EncabezadoSeccion
          descripcion="Revisa equipos por subcategoria, registra observaciones y actualiza el estado de homologacion."
          etiqueta="Control tecnico"
          titulo="Homologacion de equipos"
        />
        <p className="mt-4 text-sm text-slate-500">
          {homologaciones.equipos.length} de {homologaciones.totalEquipos} equipos visibles.
        </p>
      </div>
      <FiltrosHomologacion
        estados={homologaciones.estados}
        filtros={homologaciones.filtros}
        onCambiarFiltro={homologaciones.actualizarFiltro}
        subcategorias={homologaciones.subcategorias}
      />
      <MensajeEstado>{homologaciones.mensaje}</MensajeEstado>
      <PanelCambioHomologacion
        cambio={cambio}
        guardando={homologaciones.guardando}
        onCancelar={() => setCambio(null)}
        onConfirmar={confirmarCambio}
      />
      {homologaciones.cargando ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando equipos para homologacion...
        </div>
      ) : (
        <TablaHomologaciones
          equipos={homologaciones.equipos}
          onSeleccionarCambio={seleccionarCambio}
        />
      )}
    </section>
  )
}
