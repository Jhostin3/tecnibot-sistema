import { useNavigate } from 'react-router-dom'

import { EncabezadoSeccion } from '../../../components/molecules/EncabezadoSeccion'
import { PlantillaAutenticacion } from '../../../components/templates/PlantillaAutenticacion'
import { rutas } from '../../../utils/rutas'
import { FormularioInicioSesion } from '../components/FormularioInicioSesion'
import { useAutenticacion } from '../hooks/useAutenticacion'

export function PaginaLogin() {
  const navigate = useNavigate()
  const { iniciarSesion } = useAutenticacion()

  async function manejarInicioSesion(credenciales) {
    await iniciarSesion(credenciales)
    navigate(rutas.panel, { replace: true })
  }

  return (
    <PlantillaAutenticacion>
      <div className="space-y-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <EncabezadoSeccion
          descripcion="Ingresa con tus credenciales institucionales para administrar competencias, equipos y categorías."
          etiqueta="Acceso administrativo"
          titulo="Iniciar sesión"
        />
        <FormularioInicioSesion alEnviar={manejarInicioSesion} />
      </div>
    </PlantillaAutenticacion>
  )
}
