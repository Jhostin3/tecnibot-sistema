import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { rutas } from '../../../utils/rutas'
import { FormularioInicioSesion } from '../components/FormularioInicioSesion'
import { useAutenticacion } from '../hooks/useAutenticacion'

export function PaginaLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cargandoSesion, iniciarSesion, usuarioAutenticado } = useAutenticacion()
  const [formularioVisible, setFormularioVisible] = useState(false)
  const rutaDestino = location.state?.desde?.pathname || rutas.panel

  useEffect(() => {
    const temporizador = setTimeout(() => setFormularioVisible(true), 50)

    return () => clearTimeout(temporizador)
  }, [])

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
      <section className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-10 text-center md:flex">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-10"
          viewBox="0 0 600 600"
        >
          <g fill="none" stroke="#38bdf8" strokeWidth="2">
            <path d="M60 120h160v80h120" />
            <path d="M120 420h130v-90h180" />
            <path d="M360 90v130h120" />
            <path d="M70 280h180v-70" />
            <path d="M330 500v-120h190" />
            <path d="M220 520h-90V360" />
          </g>
          <g fill="#22d3ee">
            <circle cx="60" cy="120" r="6" />
            <circle cx="340" cy="200" r="6" />
            <circle cx="480" cy="220" r="6" />
            <circle cx="430" cy="330" r="6" />
            <circle cx="520" cy="380" r="6" />
            <circle cx="130" cy="360" r="6" />
          </g>
        </svg>
        <span className="absolute left-10 top-10 text-6xl text-blue-700 opacity-30 animate-pulse">
          ⚙
        </span>
        <span className="absolute right-12 top-20 text-6xl text-blue-700 opacity-30 animate-pulse">
          🤖
        </span>
        <span className="absolute bottom-16 left-14 text-6xl text-blue-700 opacity-30 animate-pulse">
          ⚡
        </span>
        <span className="absolute bottom-10 right-16 text-6xl text-blue-700 opacity-30 animate-pulse">
          🏆
        </span>
        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-normal text-cyan-400">
            ⚡ TECNIBOT
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

      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 px-6 py-10 md:bg-gradient-to-br md:from-slate-50 md:to-blue-50 md:px-8">
        <div
          className={`w-full max-w-sm transition-all duration-500 ${
            formularioVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-6 text-center md:hidden">
            <p className="text-3xl font-black tracking-normal text-white">⚡ TECNIBOT</p>
            <p className="mt-2 text-sm font-semibold text-blue-200">Cuenca 2026</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-blue-950/30 md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
          <div className="mb-8">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              ACCESO AL SISTEMA
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-800">Bienvenido</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ingresa con tus credenciales
            </p>
          </div>

          <div className="[&_button[type='submit']]:h-12 [&_button[type='submit']]:rounded-xl [&_button[type='submit']]:bg-gradient-to-r [&_button[type='submit']]:from-blue-600 [&_button[type='submit']]:to-indigo-600 [&_button[type='submit']]:font-semibold [&_button[type='submit']]:text-white [&_button[type='submit']]:shadow-lg [&_button[type='submit']]:shadow-blue-200 [&_button[type='submit']]:duration-200 [&_button[type='submit']]:hover:from-blue-700 [&_button[type='submit']]:hover:to-indigo-700 [&_form>p]:rounded-xl [&_form>p]:border-red-200 [&_form>p]:bg-red-50 [&_form>p]:p-3 [&_form>p]:text-sm [&_form>p]:font-semibold [&_form>p]:text-red-600 [&_form>p:last-child]:hidden [&_input]:h-12 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:px-4 [&_input]:text-slate-700 [&_input]:shadow-sm [&_input]:placeholder:text-slate-300 [&_input]:focus:border-transparent [&_input]:focus:ring-2 [&_input]:focus:ring-blue-400 [&_label]:mb-1 [&_label]:text-sm [&_label]:font-medium [&_label]:text-slate-600">
            <FormularioInicioSesion alEnviar={manejarInicioSesion} />
          </div>

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
            🏆 Ver llave del torneo · Sin login
          </button>

          <p className="mt-6 text-center text-xs text-slate-300">
            🔒 Acceso seguro con Supabase Auth
          </p>
          </div>
        </div>
      </section>
    </main>
  )
}
