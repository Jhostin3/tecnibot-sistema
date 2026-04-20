import { useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import { ContadoresHomologacion } from '../components/ContadoresHomologacion'
import { FiltrosHomologacion } from '../components/FiltrosHomologacion'
import { PanelCambioHomologacion } from '../components/PanelCambioHomologacion'
import { SidebarHomologador } from '../components/SidebarHomologador'
import { TablaHomologaciones } from '../components/TablaHomologaciones'
import { TabsHomologacion } from '../components/TabsHomologacion'
import { useHomologaciones } from '../hooks/usarHomologaciones'

const estadosPorRevisar = ['pendiente', 'en_revision']
const estadosHomologados = ['aprobado', 'rechazado']

function normalizarTexto(valor = '') {
  return valor.toLowerCase()
}

export function PaginaHomologacion() {
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
  const homologaciones = useHomologaciones()
  const [busqueda, setBusqueda] = useState('')
  const [cambio, setCambio] = useState(null)
  const [tabActivo, setTabActivo] = useState('por_revisar')
  const terminoBusqueda = normalizarTexto(busqueda.trim())
  const equiposFiltrados = homologaciones.equipos.filter((equipo) => {
    if (!terminoBusqueda) return true

    return (
      normalizarTexto(equipo.nombre_equipo).includes(terminoBusqueda) ||
      normalizarTexto(equipo.nombre_robot).includes(terminoBusqueda) ||
      normalizarTexto(equipo.institucion).includes(terminoBusqueda) ||
      normalizarTexto(equipo.representante).includes(terminoBusqueda)
    )
  })
  const equiposPorRevisar = equiposFiltrados.filter((equipo) =>
    estadosPorRevisar.includes(equipo.estado_homologacion),
  )
  const equiposHomologados = equiposFiltrados.filter((equipo) =>
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

  const contenido = (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          className="mb-5 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-blue-600"
          onClick={() => navigate('/')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          Inicio
        </button>
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Control tecnico
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          Homologacion de equipos
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Revisa equipos por subcategoria, aprueba revisiones tecnicas y registra motivos cuando un equipo sea rechazado.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          {homologaciones.equipos.length} de {homologaciones.totalEquipos} equipos visibles.
        </p>
      </div>
      <FiltrosHomologacion
        filtros={homologaciones.filtros}
        onCambiarFiltro={homologaciones.actualizarFiltro}
        subcategorias={homologaciones.subcategorias}
      />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="mb-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-12 text-sm text-slate-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-teal-400"
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por equipo, robot o institución..."
          type="search"
          value={busqueda}
        />
      </div>
      <ContadoresHomologacion equipos={equiposFiltrados} />
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
          {terminoBusqueda && equiposFiltrados.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-white py-8 text-center text-slate-400 shadow-sm">
              No se encontraron equipos con ese criterio
            </p>
          ) : (
            <TablaHomologaciones
              equipos={equiposTab}
              guardando={homologaciones.guardando}
              mensajeVacio={mensajeVacio}
              onSeleccionarCambio={seleccionarCambio}
            />
          )}
        </div>
      )}
    </section>
  )

  if (perfil?.rol === 'homologador') {
    return (
      <div className="flex h-screen bg-slate-100">
        <SidebarHomologador activo="homologacion" />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{contenido}</main>
      </div>
    )
  }

  return contenido
}
