import { useNavigate } from 'react-router-dom'

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

function obtenerNombreEquipo(equipo, respaldo) {
  return equipo?.nombre_equipo || respaldo
}

function TarjetaPartidoSimple({ alIniciar, partido }) {
  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
      <div className="space-y-2">
        <p className="text-base font-semibold uppercase tracking-normal text-gray-400">
          {partido.subcategoria?.nombre || 'Subcategoria'} · {partido.etiqueta_ronda}
        </p>
        {partido.cancha ? (
          <p className="text-lg font-bold text-cyan-200">Cancha: {partido.cancha}</p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="min-w-0 text-center">
          <p className="break-words text-xl font-bold text-blue-400">
            {obtenerNombreEquipo(partido.equipo_a, 'Equipo A')}
          </p>
          <p className="mt-1 text-base text-gray-400">Azul</p>
        </div>
        <span className="pt-1 text-lg font-black text-gray-500">VS</span>
        <div className="min-w-0 text-center">
          <p className="break-words text-xl font-bold text-red-400">
            {obtenerNombreEquipo(partido.equipo_b, 'Equipo B')}
          </p>
          <p className="mt-1 text-base text-gray-400">Rojo</p>
        </div>
      </div>

      <button
        className="mt-6 min-h-14 w-full rounded-2xl bg-cyan-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-cyan-400"
        onClick={() => alIniciar(partido.id)}
        type="button"
      >
        Iniciar partido
      </button>
    </article>
  )
}

export function PaginaJuez() {
  const navigate = useNavigate()
  const {
    cargando,
    error,
    mensaje,
    partidos,
  } = useJuez()

  function iniciarPartido(partidoId) {
    navigate(`/juez/${partidoId}`)
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

        <div className="space-y-4">
          {cargando ? (
            <p className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center text-lg font-semibold text-gray-200">
              Cargando partidos activos...
            </p>
          ) : null}

          {!cargando && partidos.length === 0 ? <EstadoVacio /> : null}

          {!cargando && partidos.length > 0
            ? partidos.map((partido) => (
                <TarjetaPartidoSimple
                  alIniciar={iniciarPartido}
                  key={partido.id}
                  partido={partido}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  )
}
