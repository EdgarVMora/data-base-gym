import './App.css'
import ListaMembresias from './components/ListaMembresias'
import ListaPersonas from './components/ListaPersonas'

function App() {
  return (
    <div id="app-root" className="min-h-screen font-sans p-0 m-0">

      {/* ── Header ──────────────────────────────────── */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-8 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl">
          💪
        </div>
        <div>
          <h1 className="m-0 text-xl font-bold tracking-tight">
            Saiya Gym
          </h1>
          <span className="text-xs font-semibold tracking-wide">
            ● DB Conectada
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-8 pb-16">

        {/* Nota informativa */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-10 text-sm">
          🧪 <strong>Prueba de conexión —</strong> Los datos que ves a continuación fueron leídos directamente de tu base de datos local Supabase.
        </div>

        {/* Membresías */}
        <ListaMembresias />

        {/* Divisor */}
        <hr className="border-gray-200 dark:border-gray-700 my-2" />

        {/* Personas */}
        <ListaPersonas />

      </main>
    </div>
  )
}

export default App