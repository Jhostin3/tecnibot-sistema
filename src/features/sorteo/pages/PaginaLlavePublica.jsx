import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'
import { ResumenSorteoExistente } from '../components/ResumenSorteoExistente'
import { obtenerSorteoPorSubcategoria } from '../services/servicioSorteo'

export function PaginaLlavePublica() {
  const { subcategoriaId } = useParams()
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [sorteo, setSorteo] = useState([])

  useEffect(() => {
    let componenteActivo = true

    async function cargarSorteo() {
      setCargando(true)
      setMensaje('')

      try {
        const sorteoActual = await obtenerSorteoPorSubcategoria(subcategoriaId)

        if (componenteActivo) {
          setSorteo(sorteoActual)
        }
      } catch (error) {
        if (componenteActivo) {
          setMensaje(error.message)
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarSorteo()

    return () => {
      componenteActivo = false
    }
  }, [subcategoriaId])

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <EncabezadoSeccion
            descripcion="Consulta la llave actualizada de la competencia Soccer."
            etiqueta="Vista publica"
            titulo="Llave del torneo"
          />
        </div>
        <MensajeEstado>{mensaje}</MensajeEstado>
        {cargando ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Cargando llave publica...
          </div>
        ) : sorteo.length ? (
          <ResumenSorteoExistente sorteo={sorteo} subcategoriaId={subcategoriaId} />
        ) : (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Todavia no hay sorteo registrado para esta subcategoria.
          </div>
        )}
      </section>
    </main>
  )
}
