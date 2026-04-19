import { supabase } from '../../../lib/supabaseCliente'
import { obtenerMensajeErrorAutenticacion } from '../utils/erroresAutenticacion'

export async function iniciarSesionConSupabase({ correo, contrasena }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })

    if (error) {
      throw new Error(obtenerMensajeErrorAutenticacion(error))
    }

    return data.session
  } catch (error) {
    throw new Error(error.message || 'No se pudo iniciar sesion.')
  }
}

export async function cerrarSesionConSupabase() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error('No se pudo cerrar la sesion. Intenta nuevamente.')
    }
  } catch (error) {
    throw new Error(error.message || 'No se pudo cerrar la sesion.')
  }
}

export async function obtenerSesionSupabase() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error('No se pudo recuperar la sesion actual.')
    }

    return data.session
  } catch (error) {
    throw new Error(error.message || 'No se pudo recuperar la sesion actual.')
  }
}

export function escucharCambiosSesion(manejarCambioSesion) {
  try {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      manejarCambioSesion(sesion)
    })

    return data.subscription
  } catch {
    throw new Error('No se pudo escuchar los cambios de sesion.')
  }
}
