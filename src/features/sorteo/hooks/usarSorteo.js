import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAutenticacion } from '../../autenticacion/hooks/useAutenticacion'
import {
  guardarSorteoYGenerarCuartos,
  listarEquiposAprobadosPorSubcategoria,
  listarSubcategoriasSorteo,
  obtenerSorteoPorSubcategoria,
} from '../services/servicioSorteo'

function crearAsignacionesIniciales(equipos) {
  return Object.fromEntries(equipos.map((equipo) => [equipo.id, '']))
}

function obtenerNumerosRepetidos(asignaciones) {
  const conteo = new Map()

  Object.values(asignaciones)
    .filter(Boolean)
    .forEach((numero) => {
      conteo.set(numero, (conteo.get(numero) || 0) + 1)
    })

  return new Set(
    Array.from(conteo.entries())
      .filter(([, cantidad]) => cantidad > 1)
      .map(([numero]) => numero),
  )
}

export function useSorteo() {
  const { perfil } = useAutenticacion()
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriaId, setSubcategoriaId] = useState('')
  const [equipos, setEquipos] = useState([])
  const [sorteoExistente, setSorteoExistente] = useState([])
  const [asignaciones, setAsignaciones] = useState({})
  const [cargando, setCargando] = useState(true)
  const [cargandoEquipos, setCargandoEquipos] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let componenteActivo = true

    async function cargarSubcategorias() {
      setCargando(true)

      try {
        const subcategoriasActuales = await listarSubcategoriasSorteo()

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

    cargarSubcategorias()

    return () => {
      componenteActivo = false
    }
  }, [])

  const cargarDatosSubcategoria = useCallback(async (idSubcategoria) => {
    if (!idSubcategoria) {
      setEquipos([])
      setSorteoExistente([])
      setAsignaciones({})
      return
    }

    setCargandoEquipos(true)
    setMensaje('')

    try {
      const [equiposAprobados, sorteoActual] = await Promise.all([
        listarEquiposAprobadosPorSubcategoria(idSubcategoria),
        obtenerSorteoPorSubcategoria(idSubcategoria),
      ])

      setEquipos(equiposAprobados)
      setSorteoExistente(sorteoActual)
      setAsignaciones(crearAsignacionesIniciales(equiposAprobados))
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargandoEquipos(false)
    }
  }, [])

  async function seleccionarSubcategoria(idSubcategoria) {
    setSubcategoriaId(idSubcategoria)
    await cargarDatosSubcategoria(idSubcategoria)
  }

  function asignarBola(equipoId, numeroBola) {
    setMensaje('')
    setAsignaciones((actuales) => ({
      ...actuales,
      [equipoId]: numeroBola,
    }))
  }

  const numerosRepetidos = useMemo(
    () => obtenerNumerosRepetidos(asignaciones),
    [asignaciones],
  )

  const puedeGuardar = useMemo(() => {
    const numerosAsignados = Object.values(asignaciones).filter(Boolean)

    return (
      subcategoriaId &&
      equipos.length === 8 &&
      !sorteoExistente.length &&
      numerosAsignados.length === 8 &&
      numerosRepetidos.size === 0
    )
  }, [asignaciones, equipos.length, numerosRepetidos.size, sorteoExistente.length, subcategoriaId])

  async function guardarSorteo() {
    if (!perfil?.id) {
      setMensaje('No se pudo identificar al organizador actual.')
      return
    }

    if (equipos.length !== 8) {
      setMensaje('La subcategoria debe tener exactamente 8 equipos aprobados.')
      return
    }

    if (sorteoExistente.length) {
      setMensaje('Ya existe un sorteo registrado para esta subcategoria.')
      return
    }

    if (!puedeGuardar) {
      setMensaje('Asigna una bola unica del 1 al 8 para cada equipo.')
      return
    }

    setGuardando(true)
    setMensaje('')

    try {
      await guardarSorteoYGenerarCuartos({
        asignaciones: equipos.map((equipo) => ({
          equipo_id: equipo.id,
          numero_bola: asignaciones[equipo.id],
        })),
        registradoPor: perfil.id,
        subcategoriaId,
      })
      await cargarDatosSubcategoria(subcategoriaId)
      setMensaje('Sorteo guardado y cuartos de final generados.')
    } catch (error) {
      setMensaje(error.message)
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    asignaciones,
    asignarBola,
    cargando,
    cargandoEquipos,
    equipos,
    guardarSorteo,
    guardando,
    mensaje,
    numerosRepetidos,
    puedeGuardar,
    seleccionarSubcategoria,
    sorteoExistente,
    subcategoriaId,
    subcategorias,
  }
}
