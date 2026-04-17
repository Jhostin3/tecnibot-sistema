import { useState } from 'react'

import { Boton } from '../../../components/atoms/Boton'
import { CampoFormulario } from '../../../components/molecules/CampoFormulario'
import { MensajeEstado } from '../../../components/molecules/MensajeEstado'

export function FormularioInicioSesion({ alEnviar }) {
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setCargando(true)
    setMensaje('')

    const datos = new FormData(evento.currentTarget)
    const correo = datos.get('correo')
    const contrasena = datos.get('contrasena')

    if (!correo || !contrasena) {
      setMensaje('Ingresa tu correo institucional y contraseña.')
      setCargando(false)
      return
    }

    await alEnviar({ correo, contrasena })
    setCargando(false)
  }

  return (
    <form className="space-y-5" onSubmit={manejarEnvio}>
      <CampoFormulario
        autoComplete="email"
        etiqueta="Correo institucional"
        id="correo"
        placeholder="coordinador@institucion.edu"
        type="email"
      />
      <CampoFormulario
        autoComplete="current-password"
        etiqueta="Contraseña"
        id="contrasena"
        placeholder="Ingresa tu contraseña"
        type="password"
      />
      <MensajeEstado>{mensaje}</MensajeEstado>
      <Boton className="w-full" disabled={cargando} tipo="submit">
        {cargando ? 'Validando acceso...' : 'Ingresar al sistema'}
      </Boton>
      <p className="text-center text-xs leading-5 text-slate-500">
        Acceso de demostración preparado para conectar Supabase Auth.
      </p>
    </form>
  )
}
