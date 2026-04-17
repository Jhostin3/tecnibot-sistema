export const estadosInscripcion = ['pendiente', 'validado']

export const estadosHomologacion = ['pendiente', 'aprobado', 'rechazado']

export const equipoInicial = {
  nombre_equipo: '',
  nombre_robot: '',
  representante: '',
  institucion: '',
  correo: '',
  subcategoria_id: '',
  estado_inscripcion: 'pendiente',
  estado_homologacion: 'pendiente',
  observaciones: '',
}

export function prepararEquipoParaGuardar(equipo) {
  return {
    nombre_equipo: equipo.nombre_equipo.trim(),
    nombre_robot: equipo.nombre_robot.trim() || null,
    representante: equipo.representante.trim(),
    institucion: equipo.institucion.trim(),
    correo: equipo.correo.trim() || null,
    subcategoria_id: equipo.subcategoria_id || null,
    estado_inscripcion: equipo.estado_inscripcion,
    estado_homologacion: equipo.estado_homologacion,
    observaciones: equipo.observaciones.trim() || null,
  }
}
