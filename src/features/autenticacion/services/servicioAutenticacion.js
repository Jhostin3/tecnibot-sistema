import { supabase } from '../../../lib/supabaseCliente'
import { obtenerMensajeErrorAutenticacion } from '../utils/erroresAutenticacion'

export async function iniciarSesionConSupabase({ correo, contrasena }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  })

  if (error) {
    throw new Error(obtenerMensajeErrorAutenticacion(error))
  }

  return data.session
}

export async function cerrarSesionConSupabase() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error('No se pudo cerrar la sesión. Intenta nuevamente.')
  }
}

export async function obtenerSesionSupabase() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error('No se pudo recuperar la sesión actual.')
  }

  return data.session
}

export function escucharCambiosSesion(manejarCambioSesion) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    manejarCambioSesion(sesion)
  })

  return data.subscription
}
