import { GitBranch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function GridBrackets({
  brackets = [],
  onRegenerar,
  regenerandoId = '',
}) {
  const navigate = useNavigate()

  if (!brackets.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
        Aun no hay brackets generados. Realiza el sorteo para cada subcategoria.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {brackets.map((subcategoria) => (
        <article
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          key={subcategoria.id}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <GitBranch className="h-6 w-6" />
            </span>
            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
                subcategoria.finalizada
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {subcategoria.finalizada ? 'Finalizado' : 'En curso'}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            {subcategoria.nombre}
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="text-sm font-semibold text-indigo-500 transition hover:text-indigo-600"
              onClick={() => navigate(`/bracket/${subcategoria.id}`)}
              type="button"
            >
              Ver bracket completo {'->'}
            </button>
            {onRegenerar ? (
              <button
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={regenerandoId === subcategoria.id}
                onClick={() => onRegenerar(subcategoria)}
                type="button"
              >
                {regenerandoId === subcategoria.id
                  ? 'Regenerando...'
                  : 'Regenerar bracket'}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
