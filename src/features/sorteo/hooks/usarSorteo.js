import { useCallback, useEffect, useRef, useState } from 'react'

import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  guardarSorteoYGenerarCuartos,
  listarEquiposAprobadosPorSubcategoria,
  listarSubcategoriasListasParaSorteo,
  obtenerSorteoPorSubcategoria,
} from '../services/servicioSorteo'

const duracionGiro = 3600

function elegirEquipoAleatorio(equipos) {
  const indice = Math.floor(Math.random() * equipos.length)

  return equipos[indice]
}

export function useSorteo() {
  const { perfil } = useAutenticacion()
  const temporizadorGiro = useRef(null)
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriaId, setSubcategoriaId] = useState('')
  const [equipos, setEquipos] = useState([])
  const [equiposDisponibles, setEquiposDisponibles] = useState([])
  const [ordenSorteo, setOrdenSorteo] = useState([])
  const [sorteoExistente, setSorteoExistente] = useState([])
  const [equipoGirado, setEquipoGirado] = useState(null)
  const [anguloRuleta, setAnguloRuleta] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [cargandoEquipos, setCargandoEquipos] = useState(false)
  const [girando, setGirando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarSubcategorias = useCallback(async () => {
    setCargando(true)
    setMensaje('')

    try {
      const subcategoriasActuales = await listarSubcategoriasListasParaSorteo()
      setSubcategorias(subcategoriasActuales)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function prepararSubcategorias() {
      setCargando(true)

      try {
        const subcategoriasActuales = await listarSubcategoriasListasParaSorteo()

        if (componenteActivo) {
          setSubcategorias(subcategoriasActuales)
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

    prepararSubcategorias()

    return () => {
      componenteActivo = false
      clearTimeout(temporizadorGiro.current)
    }
  }, [])

  const cargarDatosSubcategoria = useCallback(async (idSubcategoria) => {
    if (!idSubcategoria) {
      setEquipos([])
      setEquiposDisponibles([])
      setOrdenSorteo([])
      setSorteoExistente([])
      setEquipoGirado(null)
      return
    }

    setCargandoEquipos(true)
    setMensaje('')
    setEquipoGirado(null)

    try {
      const [equiposAprobados, sorteoActual] = await Promise.all([
        listarEquiposAprobadosPorSubcategoria(idSubcategoria),
        obtenerSorteoPorSubcategoria(idSubcategoria),
      ])

      setEquipos(equiposAprobados)
      setEquiposDisponibles(equiposAprobados)
      setOrdenSorteo([])
      setSorteoExistente(sorteoActual)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargandoEquipos(false)
    }
  }, [])

  async function seleccionarSubcategoria(idSubcategoria) {
    clearTimeout(temporizadorGiro.current)
    setGirando(false)
    setSubcategoriaId(idSubcategoria)
    await cargarDatosSubcategoria(idSubcategoria)
  }

  function girarRuleta() {
    if (girando || !equiposDisponibles.length) return

    setMensaje('')
    setEquipoGirado(null)
    setGirando(true)
    setAnguloRuleta((anguloActual) => anguloActual + 1440 + Math.floor(Math.random() * 720))

    const equipoElegido = elegirEquipoAleatorio(equiposDisponibles)

    temporizadorGiro.current = setTimeout(() => {
      setEquipoGirado(equipoElegido)
      setEquiposDisponibles((actuales) =>
        actuales.filter((equipo) => equipo.id !== equipoElegido.id),
      )
      setOrdenSorteo((actual) => [
        ...actual,
        {
          equipo: equipoElegido,
          numero_bola: actual.length + 1,
        },
      ])
      setGirando(false)
    }, duracionGiro)
  }

  async function guardarSorteo() {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al homologador actual.')
      return
    }

    if (sorteoExistente.length) {
      setMensaje('Ya existe un sorteo registrado para esta subcategoria.')
      return
    }

    if (ordenSorteo.length !== 8) {
      setMensaje('Completa los 8 giros antes de confirmar el sorteo.')
      return
    }

    setGuardando(true)
    setMensaje('')

    try {
      await guardarSorteoYGenerarCuartos({
        asignaciones: ordenSorteo.map((asignacion) => ({
          equipo_id: asignacion.equipo.id,
          numero_bola: asignacion.numero_bola,
        })),
        registradoPor: perfil.id,
        subcategoriaId,
      })
      await cargarDatosSubcategoria(subcategoriaId)
      await cargarSubcategorias()
      setMensaje('Sorteo guardado y bracket de cuartos generado correctamente.')
    } catch (error) {
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    anguloRuleta,
    cargando,
    cargandoEquipos,
    duracionGiro,
    equipoGirado,
    equipos,
    equiposDisponibles,
    girando,
    girarRuleta,
    guardarSorteo,
    guardando,
    mensaje,
    ordenSorteo,
    puedeConfirmar: ordenSorteo.length === 8 && !sorteoExistente.length,
    seleccionarSubcategoria,
    sorteoExistente,
    subcategoriaId,
    subcategorias,
  }
}
