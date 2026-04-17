const claveSesion = 'sesion_tecnibot'

export function obtenerSesionActual() {
  const sesionGuardada = window.localStorage.getItem(claveSesion)

  if (!sesionGuardada) {
    return null
  }

  return JSON.parse(sesionGuardada)
}

export async function iniciarSesionSimulada({ correo }) {
  const sesion = {
    usuario: {
      correo,
      nombre: 'Coordinador de competencia',
      rol: 'Administrador',
    },
    creadaEn: new Date().toISOString(),
  }

  window.localStorage.setItem(claveSesion, JSON.stringify(sesion))
  return sesion
}

export function cerrarSesionSimulada() {
  window.localStorage.removeItem(claveSesion)
}
