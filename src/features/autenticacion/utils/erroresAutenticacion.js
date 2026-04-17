const mensajesPorCodigo = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'El correo todavía no ha sido confirmado.',
}

export function obtenerMensajeErrorAutenticacion(error) {
  if (mensajesPorCodigo[error.code]) {
    return mensajesPorCodigo[error.code]
  }

  if (error.message?.toLowerCase().includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  return 'No se pudo iniciar sesión. Revisa tus datos e intenta nuevamente.'
}
