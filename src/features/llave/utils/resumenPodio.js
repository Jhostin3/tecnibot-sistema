function obtenerSubcampeon(enfrentamientos = [], ganador) {
  const final = enfrentamientos.find(
    (enfrentamiento) =>
      enfrentamiento.ronda === 'final' &&
      enfrentamiento.estado === 'finalizado' &&
      enfrentamiento.ganador_id,
  )

  if (!final || !ganador) return null

  if (final.equipo_a?.id === ganador.id) return final.equipo_b || null
  if (final.equipo_b?.id === ganador.id) return final.equipo_a || null

  return null
}

function obtenerTercerLugar(enfrentamientos = []) {
  const partidoTercerLugar = enfrentamientos.find(
    (enfrentamiento) =>
      enfrentamiento.ronda === 'tercer_lugar' &&
      enfrentamiento.estado === 'finalizado' &&
      enfrentamiento.ganador_id,
  )

  return partidoTercerLugar?.ganador || null
}

function obtenerCuartoLugar(enfrentamientos = [], tercerLugar) {
  const partidoTercerLugar = enfrentamientos.find(
    (enfrentamiento) =>
      enfrentamiento.ronda === 'tercer_lugar' &&
      enfrentamiento.estado === 'finalizado' &&
      enfrentamiento.ganador_id,
  )

  if (!partidoTercerLugar || !tercerLugar) return null

  if (partidoTercerLugar.equipo_a?.id === tercerLugar.id) {
    return partidoTercerLugar.equipo_b || null
  }

  if (partidoTercerLugar.equipo_b?.id === tercerLugar.id) {
    return partidoTercerLugar.equipo_a || null
  }

  return null
}

export function obtenerResumenPodio(enfrentamientos = [], ganador, esWalkover = false) {
  const subcampeon = obtenerSubcampeon(enfrentamientos, ganador)
  const tercerLugar = esWalkover ? null : obtenerTercerLugar(enfrentamientos)
  const cuartoLugar = esWalkover ? null : obtenerCuartoLugar(enfrentamientos, tercerLugar)

  return {
    cuartoLugar,
    podioCompleto: Boolean(ganador) && (esWalkover || (subcampeon && tercerLugar)),
    subcampeon,
    tercerLugar,
  }
}
