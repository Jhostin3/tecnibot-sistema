import { Award, Medal, Trophy } from 'lucide-react'
import { obtenerResumenPodio } from '../utils/resumenPodio'

function PlataformaPodio({
  alturaPx,
  badge,
  colorBase,
  descripcion,
  equipo,
  icono,
  numero,
  ordenClase = '',
  resaltar = false,
}) {
  return (
    <article
      className={`flex flex-col items-center text-center ${ordenClase}`.trim()}
      style={{ width: '140px' }}
    >
      <div className="mb-4 min-h-20 flex items-end justify-center">
        {resaltar ? (
          <div className="flex flex-col items-center gap-3">
            <Trophy className="h-14 w-14 animate-pulse text-amber-300 drop-shadow-[0_0_16px_rgba(252,211,77,0.5)]" />
            <span className="rounded-full bg-amber-900/80 px-4 py-1 text-xs font-black tracking-[0.24em] text-amber-200">
              {badge}
            </span>
          </div>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900/60 text-white shadow-lg">
            {icono}
          </span>
        )}
      </div>

      <div className="mb-3 w-full space-y-1">
        <p className="text-center text-2xl font-black text-white sm:text-3xl">
          {equipo?.nombre_equipo || 'Por definir'}
        </p>
        <p className="text-center text-sm text-gray-400">
          {equipo?.institucion || descripcion}
        </p>
      </div>

      <div
        className={`flex w-full flex-col justify-between rounded-t-[2rem] border border-white/15 px-5 pb-6 pt-5 shadow-2xl ${colorBase}`}
        style={{ height: alturaPx }}
      >
        <div className="text-4xl font-black text-white/90 sm:text-5xl">
          {numero}
        </div>
        <div className="space-y-2">
          {!resaltar ? (
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/70">
              {badge}
            </p>
          ) : null}
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
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
        <p className="text-sm text-gray-400">
          TecniBot Cuenca 2026
        </p>
      </div>

      {esWalkover ? (
        <div className="mx-auto max-w-xl rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-8">
          <Trophy className="mx-auto h-16 w-16 animate-pulse text-amber-300" />
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
            style={{ alignItems: 'flex-end' }}
          >
            <PlataformaPodio
              alturaPx="160px"
              badge="SEGUNDO LUGAR"
              colorBase="bg-gradient-to-b from-slate-200 to-slate-400"
              descripcion="Institucion por confirmar"
              equipo={subcampeon}
              icono={<Medal className="h-6 w-6 text-slate-700" />}
              numero="2"
              ordenClase="order-2 md:order-1"
            />
            <PlataformaPodio
              alturaPx="220px"
              badge="CAMPEON"
              colorBase="bg-gradient-to-b from-amber-300 to-amber-500"
              descripcion="Institucion por confirmar"
              equipo={ganador}
              icono={<Trophy className="h-6 w-6 text-amber-200" />}
              numero="1"
              ordenClase="order-1 md:order-2"
              resaltar
            />
            <PlataformaPodio
              alturaPx="120px"
              badge={tercerLugar ? 'TERCER LUGAR' : 'POR DEFINIR'}
              colorBase="bg-gradient-to-b from-orange-300 to-orange-500"
              descripcion="Institucion por confirmar"
              equipo={tercerLugar}
              icono={<Award className="h-6 w-6 text-orange-100" />}
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
