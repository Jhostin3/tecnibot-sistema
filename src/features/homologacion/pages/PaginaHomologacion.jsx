import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { IndicadorEnVivo } from '../../../components/molecules/IndicadorEnVivo'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import { useModoSorteo } from '../../sorteo/hooks/useModoSorteo'
import { modosSorteo } from '../../sorteo/utils/modoSorteo'
import { ContadoresHomologacion } from '../components/ContadoresHomologacion'
import { FiltrosHomologacion } from '../components/FiltrosHomologacion'
import { PanelCambioHomologacion } from '../components/PanelCambioHomologacion'
import { SidebarHomologador } from '../components/SidebarHomologador'
import { TablaHomologaciones } from '../components/TablaHomologaciones'
import { TabsHomologacion } from '../components/TabsHomologacion'
import { useHomologaciones } from '../hooks/usarHomologaciones'
import { verificarDisponibilidadNumeroBola } from '../services/servicioHomologacion'

const estadosPorRevisar = ['pendiente', 'en_revision']
const estadosHomologados = ['aprobado', 'rechazado']

function normalizarTexto(valor = '') {
  return valor.toLowerCase()
}

async function ejecutarManteniendoScroll(accion) {
  const scrollY = window.scrollY

  await accion()

  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: 'instant' })
  })
}

function ModalAprobacionPresencial({
  cambio,
  error,
  feedbackNumero,
  inputRef,
  guardando,
  numeroBola,
  numeroValido,
  onBlurNumero,
  onCancelar,
  onCambiarNumero,
  onConfirmar,
  validandoNumero,
}) {
  if (!cambio) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-950">Aprobar equipo</h2>
        <div className="mt-4 space-y-1 text-sm text-slate-700">
          <p>
            Equipo: <span className="font-bold">{cambio.equipo.nombre_equipo}</span>
          </p>
          <p>
            Robot: <span className="font-bold">{cambio.equipo.nombre_robot || '-'}</span>
          </p>
        </div>
        <label
          className="mt-6 block text-sm font-semibold text-slate-700"
          htmlFor="numeroBolaPresencial"
        >
          Numero de bola del sorteo:
        </label>
        <input
          className="mt-2 h-14 w-full rounded-xl border border-slate-300 px-4 text-2xl font-bold text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          id="numeroBolaPresencial"
          inputMode="numeric"
          min="1"
          onChange={(evento) => onCambiarNumero(evento.target.value)}
          onBlur={onBlurNumero}
          ref={inputRef}
          type="number"
          value={numeroBola}
        />
        {feedbackNumero ? (
          <p
            className={`mt-2 text-xs ${
              feedbackNumero.tipo === 'valido' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedbackNumero.mensaje}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            disabled={guardando}
            onClick={onCancelar}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={guardando || validandoNumero || !numeroValido}
            onClick={onConfirmar}
            type="button"
          >
            {validandoNumero ? 'Validando...' : 'Confirmar aprobacion'}
          </button>
        </div>
      </section>
    </div>
  )
}

export function PaginaHomologacion() {
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
  const modoSorteo = useModoSorteo()
  const homologaciones = useHomologaciones()
  const [busqueda, setBusqueda] = useState('')
  const [aprobacionPresencial, setAprobacionPresencial] = useState(null)
  const [cambio, setCambio] = useState(null)
  const [errorAprobacionPresencial, setErrorAprobacionPresencial] = useState('')
  const [feedbackNumeroBola, setFeedbackNumeroBola] = useState(null)
  const [numeroBolaPresencial, setNumeroBolaPresencial] = useState('')
  const [validandoNumeroBola, setValidandoNumeroBola] = useState(false)
  const [tabActivo, setTabActivo] = useState('por_revisar')
  const inputNumeroBolaRef = useRef(null)
  const validacionNumeroRef = useRef(0)
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
  const numeroBolaNormalizado = Number(numeroBolaPresencial)
  const numeroBolaEsEnteroValido =
    Number.isInteger(numeroBolaNormalizado) && numeroBolaNormalizado >= 1
  const numeroBolaDisponible = feedbackNumeroBola?.tipo === 'valido'
  const numeroBolaDuplicado = feedbackNumeroBola?.tipo === 'duplicado'
  const numeroBolaInvalido = feedbackNumeroBola?.tipo === 'invalido'
  const puedeConfirmarAprobacionPresencial =
    numeroBolaEsEnteroValido &&
    numeroBolaDisponible &&
    !numeroBolaDuplicado &&
    !numeroBolaInvalido &&
    !validandoNumeroBola

  const validarNumeroBolaEnModal = useCallback(async (valor, { forzar = false } = {}) => {
    if (!aprobacionPresencial?.equipo) return false

    const numero = Number(valor)

    if (!valor) {
      return false
    }

    if (!Number.isInteger(numero) || numero < 1) {
      setFeedbackNumeroBola({
        tipo: 'invalido',
        mensaje: 'Ingresa un numero entero positivo.',
      })
      setValidandoNumeroBola(false)
      return false
    }

    const tokenValidacion = Date.now()
    validacionNumeroRef.current = tokenValidacion
    setValidandoNumeroBola(true)

    try {
      const resultado = await verificarDisponibilidadNumeroBola({
        equipo: aprobacionPresencial.equipo,
        numeroBola: numero,
      })

      if (validacionNumeroRef.current !== tokenValidacion) {
        return false
      }

      setFeedbackNumeroBola({
        tipo: resultado.disponible ? 'valido' : 'duplicado',
        mensaje: resultado.disponible
          ? 'Numero disponible'
          : `Numero ocupado por ${resultado.nombreEquipo}`,
      })

      if (!resultado.disponible && forzar) {
        setErrorAprobacionPresencial(resultado.mensaje)
      }

      return resultado.disponible
    } catch (error) {
      if (validacionNumeroRef.current !== tokenValidacion) {
        return false
      }

      setFeedbackNumeroBola({
        tipo: 'invalido',
        mensaje: error.message,
      })

      if (forzar) {
        setErrorAprobacionPresencial(error.message)
      }

      return false
    } finally {
      if (validacionNumeroRef.current === tokenValidacion) {
        setValidandoNumeroBola(false)
      }
    }
  }, [aprobacionPresencial])

  useEffect(() => {
    if (!aprobacionPresencial || !numeroBolaPresencial) return undefined

    const temporizador = window.setTimeout(() => {
      validarNumeroBolaEnModal(numeroBolaPresencial)
    }, 500)

    return () => {
      window.clearTimeout(temporizador)
    }
  }, [aprobacionPresencial, numeroBolaPresencial, validarNumeroBolaEnModal])

  async function seleccionarCambio(equipo, estado) {
    homologaciones.setMensaje('')

    if (estado === 'rechazado') {
      setCambio({ equipo, estado })
      return
    }

    if (estado === 'aprobado' && modoSorteo === modosSorteo.presencial) {
      setNumeroBolaPresencial('')
      setErrorAprobacionPresencial('')
      setFeedbackNumeroBola(null)
      setValidandoNumeroBola(false)
      setAprobacionPresencial({ equipo, estado })
      return
    }

    await ejecutarManteniendoScroll(async () => {
      await homologaciones.cambiarEstadoHomologacion({
        equipoId: equipo.id,
        estado,
        observacion: '',
      })
    })
  }

  async function confirmarCambio(datosCambio) {
    await ejecutarManteniendoScroll(async () => {
      await homologaciones.cambiarEstadoHomologacion(datosCambio)
      setCambio(null)
    })
  }

  async function confirmarAprobacionPresencial() {
    const numero = Number(numeroBolaPresencial)

    if (!Number.isInteger(numero) || numero < 1) {
      setErrorAprobacionPresencial('Ingresa un numero entero positivo.')
      inputNumeroBolaRef.current?.focus()
      setFeedbackNumeroBola({
        tipo: 'invalido',
        mensaje: 'Ingresa un numero entero positivo.',
      })
      return
    }

    try {
      setErrorAprobacionPresencial('')
      const numeroDisponible = await validarNumeroBolaEnModal(numeroBolaPresencial, {
        forzar: true,
      })

      if (!numeroDisponible) {
        inputNumeroBolaRef.current?.focus()
        return
      }

      await ejecutarManteniendoScroll(async () => {
        await homologaciones.cambiarEstadoHomologacion({
          equipo: aprobacionPresencial.equipo,
          equipoId: aprobacionPresencial.equipo.id,
          estado: 'aprobado',
          numeroBola: numero,
          observacion: '',
        })
        setAprobacionPresencial(null)
        setNumeroBolaPresencial('')
        setFeedbackNumeroBola(null)
      })
    } catch (error) {
      setErrorAprobacionPresencial(error.message)
      inputNumeroBolaRef.current?.focus()
    }
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Control tecnico
          </p>
          <IndicadorEnVivo activo={homologaciones.realtimeActivo} />
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          Homologacion de equipos
        </h1>
        <p className="mt-1 w-full text-sm text-slate-500">
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
      <div className="relative w-full">
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
      <ModalAprobacionPresencial
        cambio={aprobacionPresencial}
        error={errorAprobacionPresencial}
        feedbackNumero={feedbackNumeroBola}
        inputRef={inputNumeroBolaRef}
        guardando={homologaciones.guardando}
        numeroBola={numeroBolaPresencial}
        numeroValido={puedeConfirmarAprobacionPresencial}
        onBlurNumero={() => validarNumeroBolaEnModal(numeroBolaPresencial)}
        onCambiarNumero={(valor) => {
          setNumeroBolaPresencial(valor)
          setErrorAprobacionPresencial('')
        }}
        onCancelar={() => {
          setAprobacionPresencial(null)
          setNumeroBolaPresencial('')
          setErrorAprobacionPresencial('')
          setFeedbackNumeroBola(null)
        }}
        onConfirmar={confirmarAprobacionPresencial}
        validandoNumero={validandoNumeroBola}
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
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <SidebarHomologador activo="homologacion" />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-8">{contenido}</div>
        </main>
      </div>
    )
  }

  return <div className="p-6 py-8">{contenido}</div>
}
