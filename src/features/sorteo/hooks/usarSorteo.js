import { useCallback, useEffect, useRef, useState } from 'react'

import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  guardarSorteoYGenerarCuartos,
  listarCategoriasSorteo,
  listarEquiposAprobadosPorSubcategoria,
  listarSubcategoriasListasParaSorteo,
  obtenerSorteoPorSubcategoria,
} from '../services/servicioSorteo'

const duracionGiro = 3600

function elegirEquipoAleatorio(equipos) {
  const indice = Math.floor(Math.random() * equipos.length)

  return equipos[indice]
}

function completarOrdenConBye(ordenActual, totalEquipos) {
  if (totalEquipos === 7 && ordenActual.length === 7) {
    return [
      ...ordenActual,
      {
        equipo: null,
        esBye: true,
        numero_bola: 8,
      },
    ]
  }

  return ordenActual
}

export function useSorteo() {
  const { perfil } = useAutenticacion()
  const temporizadorGiro = useRef(null)
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
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
  const [error, setError] = useState(null)
  const [girando, setGirando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarOpciones = useCallback(async () => {
    setCargando(true)
    setError(null)
    setMensaje('')

    try {
      const [categoriasActuales, subcategoriasActuales] = await Promise.all([
        listarCategoriasSorteo(),
        listarSubcategoriasListasParaSorteo(),
      ])
      setCategorias(categoriasActuales)
      setSubcategorias(subcategoriasActuales)
    } catch (error) {
      setError(error.message)
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function prepararOpciones() {
      setCargando(true)
      setError(null)

      try {
        const [categoriasActuales, subcategoriasActuales] = await Promise.all([
          listarCategoriasSorteo(),
          listarSubcategoriasListasParaSorteo(),
        ])

        if (componenteActivo) {
          setCategorias(categoriasActuales)
          setSubcategorias(subcategoriasActuales)
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

    prepararOpciones()

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
    setError(null)
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
      setError(error.message)
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

  async function seleccionarCategoria(idCategoria) {
    setCategoriaId(idCategoria)
    await seleccionarSubcategoria('')
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
        ...completarOrdenConBye(
          [
            ...actual,
            {
              equipo: equipoElegido,
              esBye: false,
              numero_bola: actual.length + 1,
            },
          ],
          equipos.length,
        ),
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
      setMensaje('Completa el sorteo antes de confirmar.')
      return
    }

    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await guardarSorteoYGenerarCuartos({
        asignaciones: ordenSorteo.map((asignacion) => ({
          equipo_id: asignacion.equipo?.id || null,
          numero_bola: asignacion.numero_bola,
        })),
        registradoPor: perfil.id,
        subcategoriaId,
      })
      await cargarDatosSubcategoria(subcategoriaId)
      await cargarOpciones()
      setMensaje('Sorteo guardado y bracket de cuartos generado correctamente.')
    } catch (error) {
      setError(error.message)
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
    categoriaId,
    categorias,
    duracionGiro,
    equipoGirado,
    error,
    equipos,
    equiposDisponibles,
    girando,
    girarRuleta,
    guardarSorteo,
    guardando,
    mensaje,
    ordenSorteo,
    puedeConfirmar: ordenSorteo.length === 8 && !sorteoExistente.length,
    seleccionarCategoria,
    seleccionarSubcategoria,
    sorteoExistente,
    subcategoriaId,
    subcategorias,
  }
}
