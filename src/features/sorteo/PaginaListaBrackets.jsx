import { useEffect, useState } from 'react'

import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { SidebarHomologador } from '../homologacion/components/SidebarHomologador'
import { SidebarOrganizador } from '../organizador/components/SidebarOrganizador'
import { GridBrackets } from './components/GridBrackets'
import { listarSubcategoriasConSorteo } from './services/servicioSorteo'

export function PaginaListaBrackets() {
  const { perfil } = useAutenticacion()
  const [brackets, setBrackets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const Sidebar = perfil?.rol === 'homologador' ? SidebarHomologador : SidebarOrganizador

  useEffect(() => {
    let activo = true

    async function cargarBrackets() {
      setCargando(true)
      setError(null)

      try {
        const subcategorias = await listarSubcategoriasConSorteo()

        if (activo) {
          setBrackets(subcategorias)
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message)
          setBrackets([])
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarBrackets()

    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar activo="brackets" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full p-8">
          <header className="mb-6">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              LLAVES
            </span>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              Brackets del torneo
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Toca una subcategoria para ver su llave completa.
            </p>
          </header>

          {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Cargando brackets...
            </div>
          ) : null}

          {!cargando && error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-sm text-red-500">
              {error}
            </div>
          ) : null}

          {!cargando && !error ? <GridBrackets brackets={brackets} /> : null}
        </div>
      </main>
    </div>
  )
}
