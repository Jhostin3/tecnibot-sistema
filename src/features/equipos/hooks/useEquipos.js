import { useCallback, useEffect, useState } from 'react'

import {
  actualizarEquipo,
  crearEquipo,
  eliminarEquipo,
  listarEquipos,
} from '../services/servicioEquipos'
import { listarSubcategorias } from '../services/servicioSubcategorias'

export function useEquipos() {
  const [equipos, setEquipos] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setMensaje('')

    try {
      const [equiposActuales, subcategoriasActuales] = await Promise.all([
        listarEquipos(),
        listarSubcategorias(),
      ])

      setEquipos(equiposActuales)
      setSubcategorias(subcategoriasActuales)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function cargarDatosIniciales() {
      try {
        const [equiposActuales, subcategoriasActuales] = await Promise.all([
          listarEquipos(),
          listarSubcategorias(),
        ])

        if (!componenteActivo) return

        setEquipos(equiposActuales)
        setSubcategorias(subcategoriasActuales)
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

    cargarDatosIniciales()

    return () => {
      componenteActivo = false
    }
  }, [])

  async function guardarEquipo(equipo) {
    if (equipo.id) {
      await actualizarEquipo(equipo.id, equipo.datos)
    } else {
      await crearEquipo(equipo.datos)
    }

    await cargarDatos()
  }

  async function borrarEquipo(idEquipo) {
    await eliminarEquipo(idEquipo)
    await cargarDatos()
  }

  return {
    borrarEquipo,
    cargando,
    equipos,
    guardarEquipo,
    mensaje,
    recargarEquipos: cargarDatos,
    setMensaje,
    subcategorias,
  }
}
