import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { PartidoFinalizado } from './components/PartidoFinalizado'
import { TarjetaPartido } from './components/TarjetaPartido'
import {
  obtenerPartidoActivoPorId,
  registrarResultadoPartido,
} from './services/servicioJuez'

export function PaginaPartidoActivo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { perfil } = useAutenticacion()
  const [partido, setPartido] = useState(null)
  const [partidoFinalizado, setPartidoFinalizado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarPartido = useCallback(async () => {
    setCargando(true)
    setError(null)
    setMensaje('')

    try {
      const partidoActivo = await obtenerPartidoActivoPorId(id)
      setPartido(partidoActivo)
    } catch (errorCarga) {
      setError(errorCarga.message)
      setMensaje(errorCarga.message)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    let componenteActivo = true

    async function cargarInicial() {
      setCargando(true)
      setError(null)

      try {
        const partidoActivo = await obtenerPartidoActivoPorId(id)

        if (componenteActivo) {
          setPartido(partidoActivo)
        }
      } catch (errorCarga) {
        if (componenteActivo) {
          setError(errorCarga.message)
          setMensaje(errorCarga.message)
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarInicial()

    return () => {
      componenteActivo = false
    }
  }, [id])

  async function guardarResultado({ enfrentamiento, golesA, golesB, observacion }) {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al juez actual.')
      return
    }

    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      const resultado = await registrarResultadoPartido({
        enfrentamiento,
        golesA,
        golesB,
        juezId: perfil.id,
        observacion,
      })
      setPartidoFinalizado({
        ...enfrentamiento,
        ...resultado,
        estado: 'finalizado',
        ganador_id: resultado.ganador_id,
        observacion,
      })
      setMensaje('Resultado registrado correctamente.')
    } catch (errorGuardado) {
      setError(errorGuardado.message)
      setMensaje(errorGuardado.message)
      throw errorGuardado
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_20%),radial-gradient(circle_at_20%_0%,_rgba(250,204,21,0.08),_transparent_18%),linear-gradient(180deg,_#020617_0%,_#0f172a_24%,_#111827_100%)] px-4 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-5">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-base font-semibold text-slate-100 shadow-lg shadow-black/20 backdrop-blur transition active:border-cyan-400 active:text-cyan-200"
          onClick={() => navigate('/juez')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a partidos
        </button>

        {mensaje ? (
          <p className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-base font-semibold text-cyan-100">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-base font-semibold text-red-200">
            {error}
          </p>
        ) : null}

        {cargando ? (
          <p className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6 text-center text-base font-semibold text-slate-200 shadow-lg shadow-black/20 sm:text-lg">
            Cargando partido...
          </p>
        ) : null}

        {!cargando && partidoFinalizado ? (
          <PartidoFinalizado
            alCerrar={() => navigate('/juez')}
            partido={partidoFinalizado}
          />
        ) : null}

        {!cargando && partido && !partidoFinalizado ? (
          <TarjetaPartido
            alGuardarResultado={guardarResultado}
            guardando={guardando}
            partido={partido}
          />
        ) : null}

        {!cargando && !partido && !partidoFinalizado ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6 text-center shadow-2xl shadow-black/25">
            <h1 className="text-2xl font-bold text-white">Partido no disponible</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
              Este enfrentamiento no esta activo o ya fue finalizado.
            </p>
            <button
              className="mt-6 min-h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-3 font-bold text-slate-950 transition hover:from-cyan-400 hover:to-sky-300"
              onClick={cargarPartido}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
