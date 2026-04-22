export const claveModoSorteo = 'tecnibot_modo_sorteo'
export const modosSorteo = {
  presencial: 'presencial',
  virtual: 'virtual',
}
export const eventoModoSorteo = 'tecnibot:modo-sorteo'

export function obtenerModoSorteo() {
  if (typeof window === 'undefined') return modosSorteo.virtual

  const modo = window.localStorage.getItem(claveModoSorteo)

  return modo === modosSorteo.presencial ? modosSorteo.presencial : modosSorteo.virtual
}

export function guardarModoSorteo(modo) {
  if (typeof window === 'undefined') return

  const modoSeguro = modo === modosSorteo.presencial ? modosSorteo.presencial : modosSorteo.virtual

  window.localStorage.setItem(claveModoSorteo, modoSeguro)
  window.dispatchEvent(new CustomEvent(eventoModoSorteo, { detail: modoSeguro }))
}
