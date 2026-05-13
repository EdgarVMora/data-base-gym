export default function SectionIntro({ title, subtitle, table, className = '' }) {
  return (
    <header className={`mb-6 ${className}`.trim()}>
      <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {subtitle ? (
        <p className="mt-1 mb-0 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
      {table ? (
        <p className="mt-1 mb-0 text-xs text-slate-500 dark:text-slate-400">
          Fuente:{' '}
          <code className="font-mono text-amber-700 dark:text-amber-400/90">{table}</code>
        </p>
      ) : null}
    </header>
  )
}
