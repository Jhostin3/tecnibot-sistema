import { useEffect, useState } from 'react'

import { useAutenticacion } from '../autenticacion/hooks/useAutenticacion'
import { SidebarHomologador } from '../homologacion/components/SidebarHomologador'
import { SidebarOrganizador } from '../organizador/components/SidebarOrganizador'
import { GridBrackets } from './components/GridBrackets'
import {
  listarSubcategoriasConSorteo,
  regenerarBracketDesdeSorteo,
} from './services/servicioSorteo'

export function PaginaListaBrackets() {
  const { perfil } = useAutenticacion()
  const [brackets, setBrackets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [regenerandoId, setRegenerandoId] = useState('')
  const Sidebar = perfil?.rol === 'homologador' ? SidebarHomologador : SidebarOrganizador

  async function cargarBrackets() {
    setCargando(true)
    setError(null)

    try {
      const subcategorias = await listarSubcategoriasConSorteo()
      setBrackets(subcategorias)
    } catch (errorCarga) {
      setError(errorCarga.message)
      setBrackets([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    async function cargarInicial() {
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

    void cargarInicial()

    return () => {
      activo = false
    }
  }, [])

  async function manejarRegeneracionManual(subcategoria) {
    const confirmacion = window.confirm(
      `¿Regenerar el bracket de ${subcategoria.nombre}? Esto volvera a construir la llave usando el sorteo ya guardado.`,
    )

    if (!confirmacion) {
      return
    }

    setRegenerandoId(subcategoria.id)
    setError(null)

    try {
      await regenerarBracketDesdeSorteo(subcategoria.id)
      await cargarBrackets()
    } catch (errorRegeneracion) {
      setError(errorRegeneracion.message)
    } finally {
      setRegenerandoId('')
    }
  }

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
              Consulta las llaves generadas y fuerza una regeneracion si una
              subcategoria quedo sin enfrentamientos.
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

          {!cargando && !error ? (
            <GridBrackets
              brackets={brackets}
              onRegenerar={manejarRegeneracionManual}
              regenerandoId={regenerandoId}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
