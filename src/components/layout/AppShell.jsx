import { NAV_GROUPS } from './navConfig'

export default function AppShell({ activeId, onNavigate, children }) {
  return (
    <div
      id="app-root"
      className="min-h-screen font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,191,36,0.12),transparent),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(148,163,184,0.08),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,191,36,0.06),transparent),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(71,85,105,0.15),transparent)]"
    >
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-600 text-sm shadow-lg shadow-amber-500/25 text-white font-bold">
            SG
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Saiya Gym
            </h1>
            <p className="m-0 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              Panel operativo · datos locales (Supabase)
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/40 px-3 py-1.5 shrink-0">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              aria-hidden
            />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">En línea</span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 py-2 lg:hidden">
          <label htmlFor="nav-movil" className="sr-only">
            Ir a sección
          </label>
          <select
            id="nav-movil"
            value={activeId}
            onChange={e => onNavigate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            {NAV_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-sm min-h-[calc(100vh-3.5rem)] sticky top-[3.5rem] h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-4 flex flex-col gap-6" aria-label="Secciones">
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <p className="m-0 mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
                <ul className="m-0 p-0 list-none flex flex-col gap-0.5">
                  {group.items.map(item => {
                    const active = item.id === activeId
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onNavigate(item.id)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 pb-24 max-w-[1600px]">
          {activeId === 'resumen' ? null : (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm px-4 sm:px-5 py-3 mb-8 shadow-sm">
              <p className="m-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-amber-700 dark:text-amber-400">Entorno local</span>
                {' · '}
                Los datos se leen y escriben contra tu instancia Supabase en Docker; este panel sirve para
                inspeccionar todo el modelo relacional del gimnasio.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
