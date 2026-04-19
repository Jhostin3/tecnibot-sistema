import { PartidoFinalizado } from '../components/PartidoFinalizado'
import { TarjetaPartido } from '../components/TarjetaPartido'
import { useJuez } from '../hooks/usarJuez'

function EstadoVacio() {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center shadow-lg">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-600 bg-gray-900 text-4xl text-gray-300">
        !
      </div>
      <h2 className="mt-6 text-2xl font-bold text-white">
        No hay partidos activos en este momento
      </h2>
      <p className="mt-3 text-base leading-7 text-gray-300">
        El organizador debe activar un partido para que aparezca aqui
      </p>
    </div>
  )
}

export function PaginaJuez() {
  const {
    cargando,
    error,
    guardarResultado,
    guardando,
    mensaje,
    partidoFinalizado,
    partidos,
    setPartidoFinalizado,
  } = useJuez()

  async function manejarGuardarResultado(datosResultado) {
    await guardarResultado(datosResultado)
  }

  function cerrarPartidoFinalizado() {
    setPartidoFinalizado(null)
  }

  return (
    <section className="-m-6 min-h-screen bg-gray-900 px-4 py-6 sm:-m-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="space-y-2">
          <p className="text-base font-semibold uppercase tracking-normal text-cyan-300">
            Modulo de jueces
          </p>
          <h1 className="text-3xl font-black text-white">Partidos activos</h1>
          <p className="text-base leading-7 text-gray-300">
            Registra marcadores de forma rapida durante cada encuentro.
          </p>
        </header>

        {mensaje ? (
          <p className="rounded-2xl border border-cyan-500 bg-cyan-950 p-4 text-base font-semibold text-cyan-100">
            {mensaje}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-500 bg-red-900 p-4 text-base font-semibold text-red-300">
            {error}
          </p>
        ) : null}

        {partidoFinalizado ? (
          <PartidoFinalizado
            alCerrar={cerrarPartidoFinalizado}
            partido={partidoFinalizado}
          />
        ) : null}

        {!partidoFinalizado ? (
          <div className="space-y-4">
            {cargando ? (
              <p className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center text-lg font-semibold text-gray-200">
                Cargando partidos activos...
              </p>
            ) : null}

            {!cargando && partidos.length === 0 ? <EstadoVacio /> : null}

            {!cargando && partidos.length > 0
              ? partidos.map((partido) => (
                  <TarjetaPartido
                    alGuardarResultado={manejarGuardarResultado}
                    guardando={guardando}
                    key={partido.id}
                    partido={partido}
                  />
                ))
              : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
