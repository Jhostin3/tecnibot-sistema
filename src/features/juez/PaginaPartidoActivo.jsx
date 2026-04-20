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
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
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
      } catch (error) {
        if (componenteActivo) {
          setError(error.message)
          setMensaje(error.message)
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
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-400 transition hover:text-white"
          onClick={() => navigate('/juez')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a partidos
        </button>

        {mensaje ? (
          <p className="rounded-2xl border border-emerald-500 bg-emerald-900 p-4 text-base font-semibold text-emerald-400">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-800 bg-red-950 p-4 text-base font-semibold text-red-400">
            {error}
          </p>
        ) : null}

        {cargando ? (
          <p className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center text-lg font-semibold text-gray-200">
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
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-white">Partido no disponible</h1>
            <p className="mt-3 text-base leading-7 text-gray-500">
              Este enfrentamiento no esta activo o ya fue finalizado.
            </p>
            <button
              className="mt-6 h-12 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
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
