import { obtenerResumenPodio } from '../utils/resumenPodio'

function calcularTamanoNombre(nombre = '', tamanoBase, tamanoReducido) {
  return nombre.length > 16 ? tamanoReducido : tamanoBase
}

function PlataformaPodio({
  alturaPx,
  anchoColumna,
  anchoPlataforma,
  badge,
  colorBase,
  descripcion,
  emoji,
  equipo,
  numero,
  ordenClase = '',
  resaltar = false,
}) {
  const nombreEquipo = equipo?.nombre_equipo || 'Por definir'
  const institucion = equipo?.institucion || descripcion
  const tamanoNombre = calcularTamanoNombre(
    nombreEquipo,
    resaltar ? '20px' : '16px',
    resaltar ? '16px' : '14px',
  )

  return (
    <article
      className={`flex flex-col items-center justify-end text-center ${ordenClase}`.trim()}
      style={{ width: anchoColumna }}
    >
      <div className="mb-3 flex min-h-16 items-end justify-center">
        {resaltar ? (
          <div className="flex flex-col items-center gap-3">
            <span
              className="animate-pulse drop-shadow-[0_0_16px_rgba(252,211,77,0.5)]"
              style={{ alignSelf: 'center', fontSize: '48px' }}
            >
              {emoji}
            </span>
            <span className="rounded-full bg-amber-900/80 px-4 py-1 text-xs font-black tracking-[0.24em] text-amber-200">
              {badge}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '32px' }}>{emoji}</span>
        )}
      </div>

      <div
        className="mb-3 flex w-full flex-col items-center justify-end"
        style={{ minHeight: '92px' }}
      >
        <p
          className="font-black text-white"
          style={{
            fontSize: tamanoNombre,
            lineHeight: '1.3',
            maxWidth: '160px',
            textAlign: 'center',
          }}
        >
          {nombreEquipo}
        </p>
        <p
          className="mt-1 text-gray-400"
          style={{
            fontSize: '11px',
            lineHeight: '1.3',
            maxWidth: '160px',
            textAlign: 'center',
          }}
        >
          {institucion}
        </p>
      </div>

      <div
        className={`flex flex-col items-center justify-center overflow-hidden rounded-t-[2rem] border border-white/15 px-4 py-4 shadow-2xl ${colorBase}`}
        style={{ height: alturaPx, width: anchoPlataforma }}
      >
        <div className="text-4xl font-black text-white/90 sm:text-5xl">{numero}</div>
        <div className="mt-3 space-y-1">
          {!resaltar ? (
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/75">
              {badge}
            </p>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            {resaltar ? 'Campeon' : 'Posicion final'}
          </p>
        </div>
      </div>
    </article>
  )
}

export function PantallaGanador({
  enfrentamientos = [],
  esWalkover = false,
  ganador,
  subcategoria,
}) {
  if (!ganador) return null

  const { subcampeon, tercerLugar } = obtenerResumenPodio(
    enfrentamientos,
    ganador,
    esWalkover,
  )

  return (
    <section className="space-y-8 rounded-[2rem] border border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
      <div className="space-y-3">
        <p className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-black tracking-[0.24em] text-cyan-200">
          PODIO OFICIAL
        </p>
        <h2 className="text-3xl font-black text-white sm:text-4xl">
          {subcategoria?.nombre || 'Gran final'}
        </h2>
        <p className="text-sm text-gray-400">TecniBot Cuenca 2026</p>
      </div>

      {esWalkover ? (
        <div className="mx-auto max-w-xl rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-8">
          <div className="mx-auto animate-pulse text-6xl">🏆</div>
          <p className="mt-4 text-3xl font-black text-white">{ganador.nombre_equipo}</p>
          <p className="mt-2 text-sm text-amber-100/80">
            {ganador.institucion || 'Unico equipo inscrito en esta categoria'}
          </p>
          <p className="mt-4 inline-flex rounded-full bg-amber-900/80 px-4 py-1 text-xs font-black tracking-[0.24em] text-amber-200">
            CAMPEON POR WALKOVER
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            className="flex flex-col gap-5 md:flex-row md:justify-center"
            style={{ alignItems: 'flex-end', gap: '24px' }}
          >
            <PlataformaPodio
              alturaPx="140px"
              anchoColumna="180px"
              anchoPlataforma="160px"
              badge="SEGUNDO LUGAR"
              colorBase="bg-gradient-to-b from-slate-200 to-slate-400"
              descripcion="Institucion por confirmar"
              emoji="🥈"
              equipo={subcampeon}
              numero="2"
              ordenClase="order-2 md:order-1"
            />
            <PlataformaPodio
              alturaPx="200px"
              anchoColumna="200px"
              anchoPlataforma="180px"
              badge="CAMPEON"
              colorBase="bg-gradient-to-b from-amber-300 to-amber-500"
              descripcion="Institucion por confirmar"
              emoji="🏆"
              equipo={ganador}
              numero="1"
              ordenClase="order-1 md:order-2"
              resaltar
            />
            <PlataformaPodio
              alturaPx="100px"
              anchoColumna="180px"
              anchoPlataforma="160px"
              badge={tercerLugar ? 'TERCER LUGAR' : 'POR DEFINIR'}
              colorBase="bg-gradient-to-b from-orange-300 to-orange-500"
              descripcion="Institucion por confirmar"
              emoji="🥉"
              equipo={tercerLugar}
              numero="3"
              ordenClase="order-3"
            />
          </div>

          {!tercerLugar ? (
            <p className="text-sm text-gray-400">
              El tercer lugar aun esta por definirse.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}
