const tabs = [
  { etiqueta: 'Por revisar', valor: 'por_revisar' },
  { etiqueta: 'Homologados', valor: 'homologados' },
]

export function TabsHomologacion({ onCambiar, tabActivo }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 sm:flex-row">
      {tabs.map((tab) => {
        const activo = tab.valor === tabActivo

        return (
          <button
            className={`min-h-11 rounded-t-md px-4 py-2 text-sm font-semibold transition ${
              activo
                ? 'border-b-2 border-cyan-700 bg-white text-cyan-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            key={tab.valor}
            onClick={() => onCambiar(tab.valor)}
            type="button"
          >
            {tab.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
