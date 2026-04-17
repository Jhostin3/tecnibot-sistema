import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  cerrarSesionConSupabase,
  escucharCambiosSesion,
  iniciarSesionConSupabase,
  obtenerSesionSupabase,
} from '../services/servicioAutenticacion'
import { obtenerPerfilPorId } from '../services/servicioPerfiles'
import { ContextoAutenticacion } from './contextoAutenticacionBase'

export function ProveedorAutenticacion({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  const cargarPerfil = useCallback(async (sesionActual) => {
    if (!sesionActual?.user?.id) {
      setPerfil(null)
      return null
    }

    const perfilActual = await obtenerPerfilPorId(sesionActual.user.id)
    setPerfil(perfilActual)
    return perfilActual
  }, [])

  const limpiarSesion = useCallback(() => {
    setSesion(null)
    setPerfil(null)
  }, [])

  useEffect(() => {
    let componenteActivo = true

    async function prepararSesionInicial() {
      try {
        const sesionActual = await obtenerSesionSupabase()

        if (!componenteActivo) return

        setSesion(sesionActual)
        await cargarPerfil(sesionActual)
      } catch {
        await cerrarSesionConSupabase()
        limpiarSesion()
      } finally {
        if (componenteActivo) {
          setCargandoSesion(false)
        }
      }
    }

    prepararSesionInicial()

    const suscripcion = escucharCambiosSesion(async (nuevaSesion) => {
      setSesion(nuevaSesion)

      try {
        await cargarPerfil(nuevaSesion)
      } catch {
        await cerrarSesionConSupabase()
        limpiarSesion()
      }
    })

    return () => {
      componenteActivo = false
      suscripcion.unsubscribe()
    }
  }, [cargarPerfil, limpiarSesion])

  const iniciarSesion = useCallback(
    async (credenciales) => {
      try {
        const nuevaSesion = await iniciarSesionConSupabase(credenciales)
        const perfilActual = await cargarPerfil(nuevaSesion)

        setSesion(nuevaSesion)
        setPerfil(perfilActual)
        return { perfil: perfilActual, sesion: nuevaSesion }
      } catch (error) {
        try {
          await cerrarSesionConSupabase()
        } catch {
          limpiarSesion()
        }
        limpiarSesion()
        throw error
      }
    },
    [cargarPerfil, limpiarSesion],
  )

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionConSupabase()
    limpiarSesion()
  }, [limpiarSesion])

  const valor = useMemo(
    () => ({
      cargandoSesion,
      cerrarSesion,
      iniciarSesion,
      perfil,
      sesion,
      usuario: sesion?.user ?? null,
      usuarioAutenticado: Boolean(sesion && perfil),
    }),
    [cargandoSesion, cerrarSesion, iniciarSesion, perfil, sesion],
  )

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}
