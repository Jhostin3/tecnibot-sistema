import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

function calcularSiguientePotenciaDeDos(cantidad) {
  let potencia = 1

  while (potencia < Math.max(2, cantidad)) {
    potencia *= 2
  }

  return potencia
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
  const tamanoBracket = useMemo(
    () => calcularSiguientePotenciaDeDos(equipos.length),
    [equipos.length],
  )
  const cantidadByes = Math.max(0, tamanoBracket - equipos.length)
  const partidosPrimeraRonda = tamanoBracket / 2
  const subcategoriaSeleccionada = subcategorias.find(
    (subcategoria) => subcategoria.id === subcategoriaId,
  )
  const esCampeonAutomatico =
    Boolean(subcategoriaSeleccionada?.campeonAutomatico) || equipos.length === 1
  const equipoCampeon = esCampeonAutomatico ? equipos[0] || null : null

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

      const tieneCampeonAutomatico = equiposAprobados.length === 1

      setEquipos(equiposAprobados)
      setEquiposDisponibles(tieneCampeonAutomatico ? [] : equiposAprobados)
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
    if (esCampeonAutomatico || girando || !equiposDisponibles.length) return

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

  function asignarUltimoEquipo() {
    if (esCampeonAutomatico || girando || equiposDisponibles.length !== 1) return

    const [equipoElegido] = equiposDisponibles

    setMensaje('¡Sorteo completo! Último equipo asignado automáticamente')
    setEquipoGirado(equipoElegido)
    setEquiposDisponibles([])
    setOrdenSorteo((actual) => [
      ...actual,
      {
        equipo: equipoElegido,
        numero_bola: actual.length + 1,
      },
    ])
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

    if (ordenSorteo.length !== equipos.length) {
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

  async function confirmarCampeonAutomatico() {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al homologador actual.')
      return
    }

    if (sorteoExistente.length) {
      setMensaje('Ya existe un sorteo registrado para esta subcategoria.')
      return
    }

    if (!equipoCampeon || equipos.length !== 1) {
      setMensaje('El campeon automatico requiere exactamente 1 equipo aprobado.')
      return
    }

    setGuardando(true)
    setError(null)
    setMensaje('')

    try {
      await guardarSorteoYGenerarCuartos({
        asignaciones: [
          {
            equipo_id: equipoCampeon.id,
            numero_bola: 1,
          },
        ],
        registradoPor: perfil.id,
        subcategoriaId,
      })
      await cargarDatosSubcategoria(subcategoriaId)
      await cargarOpciones()
      setMensaje('Campeon automatico registrado correctamente.')
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
    asignarUltimoEquipo,
    cargando,
    cargandoEquipos,
    cantidadByes,
    campeonAutomatico: esCampeonAutomatico,
    categoriaId,
    categorias,
    duracionGiro,
    equipoGirado,
    equipoCampeon,
    error,
    equipos,
    equiposDisponibles,
    esCampeonAutomatico,
    girando,
    girarRuleta,
    guardarSorteo,
    confirmarCampeonAutomatico,
    guardarCampeonAutomatico: confirmarCampeonAutomatico,
    guardando,
    mensaje,
    ordenSorteo,
    partidosPrimeraRonda,
    puedeConfirmar:
      equipos.length >= 2 &&
      ordenSorteo.length === equipos.length &&
      !sorteoExistente.length,
    seleccionarCategoria,
    seleccionarSubcategoria,
    sorteoExistente,
    subcategoriaId,
    subcategoriaSeleccionada,
    subcategorias,
    tamanoBracket,
  }
}
