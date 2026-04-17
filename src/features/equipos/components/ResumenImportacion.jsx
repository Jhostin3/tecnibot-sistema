export function ResumenImportacion({ resumen }) {
  if (!resumen) {
    return null
  }

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="font-semibold">Importación finalizada</p>
      <p className="mt-1">
        {resumen.importadas} equipos importados correctamente. {resumen.conError}{' '}
        filas con error.
      </p>
    </div>
  )
}
