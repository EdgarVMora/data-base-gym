export function LoadingMessage({ children = 'Cargando…' }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{children}</p>
}

export function ErrorNotice({ message }) {
  return (
    <div
      className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/30 px-4 py-3 text-sm text-red-900 dark:text-red-200"
      role="alert"
    >
      <strong className="font-semibold">Error de conexión:</strong> {message}
    </div>
  )
}

export function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
      {children}
    </div>
  )
}

export function FormFieldErrors({ error, className = 'text-red-600 mt-2 text-sm' }) {
  if (!error) return null
  if (Array.isArray(error)) {
    return (
      <div className={className}>
        <div className="font-semibold mb-1">Corrige lo siguiente:</div>
        <ul className="list-disc pl-5 space-y-1">
          {error.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    )
  }
  return <div className={className}>{error}</div>
}
