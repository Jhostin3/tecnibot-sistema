import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'
import { FormularioInicioSesion } from '../components/FormularioInicioSesion'
import { useAutenticacion } from '../hooks/useAutenticacion'

export function PaginaLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cargandoSesion, iniciarSesion, usuarioAutenticado } = useAutenticacion()
  const rutaDestino = location.state?.desde?.pathname || rutas.panel

  useEffect(() => {
    if (!cargandoSesion && usuarioAutenticado) {
      navigate(rutaDestino, { replace: true })
    }
  }, [cargandoSesion, navigate, rutaDestino, usuarioAutenticado])

  async function manejarInicioSesion(credenciales) {
    await iniciarSesion(credenciales)
    navigate(rutaDestino, { replace: true })
  }

  function abrirLlavePublica() {
    navigate(rutas.llave)
  }

  return (
    <main className="grid min-h-screen bg-slate-50 md:grid-cols-2">
      <section className="hidden items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-10 text-center md:flex">
        <div>
          <h1 className="text-5xl font-black tracking-widest text-cyan-400">
            TECNIBOT
          </h1>
          <p className="mt-3 text-xl text-blue-200">Cuenca 2026</p>
          <div className="mx-auto my-4 h-1 w-16 rounded-full bg-cyan-400" />
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-300">
            V Concurso de Robotica
          </p>
          <p className="mt-6 text-2xl font-bold text-white">27 - 04 - 26</p>
          <p className="mt-2 text-xs text-blue-300">
            UETS - Unidad Educativa Tecnico Salesiano
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-8 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              ACCESO AL SISTEMA
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-800">Bienvenido</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ingresa con tus credenciales
            </p>
          </div>

          <FormularioInicioSesion alEnviar={manejarInicioSesion} />

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-300">
              o continua como visitante
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            className="h-12 w-full rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            onClick={abrirLlavePublica}
            type="button"
          >
            Ver llave del torneo - Sin login
          </button>

          <p className="mt-6 text-center text-xs text-slate-300">
            Acceso seguro con Supabase Auth
          </p>
        </div>
      </section>
    </main>
  )
}
