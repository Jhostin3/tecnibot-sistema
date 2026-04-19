import { useState } from 'react'

import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { ContadoresHomologacion } from '../components/ContadoresHomologacion'
import { FiltrosHomologacion } from '../components/FiltrosHomologacion'
import { PanelCambioHomologacion } from '../components/PanelCambioHomologacion'
import { TablaHomologaciones } from '../components/TablaHomologaciones'
import { TabsHomologacion } from '../components/TabsHomologacion'
import { useHomologaciones } from '../hooks/usarHomologaciones'

const estadosPorRevisar = ['pendiente', 'en_revision']
const estadosHomologados = ['aprobado', 'rechazado']

export function PaginaHomologacion() {
  const homologaciones = useHomologaciones()
  const [cambio, setCambio] = useState(null)
  const [tabActivo, setTabActivo] = useState('por_revisar')
  const equiposPorRevisar = homologaciones.equipos.filter((equipo) =>
    estadosPorRevisar.includes(equipo.estado_homologacion),
  )
  const equiposHomologados = homologaciones.equipos.filter((equipo) =>
    estadosHomologados.includes(equipo.estado_homologacion),
  )
  const equiposTab =
    tabActivo === 'por_revisar' ? equiposPorRevisar : equiposHomologados
  const mensajeVacio =
    tabActivo === 'por_revisar'
      ? 'Todos los equipos de esta subcategoria han sido revisados.'
      : 'Aun no hay equipos homologados en esta subcategoria.'

  async function seleccionarCambio(equipo, estado) {
    homologaciones.setMensaje('')

    if (estado === 'rechazado') {
      setCambio({ equipo, estado })
      return
    }

    await homologaciones.cambiarEstadoHomologacion({
      equipoId: equipo.id,
      estado,
      observacion: '',
    })
  }

  async function confirmarCambio(datosCambio) {
    await homologaciones.cambiarEstadoHomologacion(datosCambio)
    setCambio(null)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <EncabezadoSeccion
          descripcion="Revisa equipos por subcategoria, aprueba revisiones tecnicas y registra motivos cuando un equipo sea rechazado."
          etiqueta="Control tecnico"
          titulo="Homologacion de equipos"
        />
        <p className="mt-4 text-sm text-slate-500">
          {homologaciones.equipos.length} de {homologaciones.totalEquipos} equipos visibles.
        </p>
      </div>
      <FiltrosHomologacion
        filtros={homologaciones.filtros}
        onCambiarFiltro={homologaciones.actualizarFiltro}
        subcategorias={homologaciones.subcategorias}
      />
      <ContadoresHomologacion equipos={homologaciones.equipos} />
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
        <div className="space-y-4">
          <TabsHomologacion onCambiar={setTabActivo} tabActivo={tabActivo} />
          <TablaHomologaciones
            equipos={equiposTab}
            guardando={homologaciones.guardando}
            mensajeVacio={mensajeVacio}
            onSeleccionarCambio={seleccionarCambio}
          />
        </div>
      )}
    </section>
  )
}
