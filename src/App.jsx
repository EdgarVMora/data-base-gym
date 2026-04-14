import './App.css'
import ListaMembresias from './components/ListaMembresias'
import ListaPersonas from './components/ListaPersonas'

function App() {
  return (
    <div id="app-root" style={{
      minHeight: '100vh',
      background: '#08090f',
      color: '#e5e7eb',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: '0',
      margin: '0',
    }}>

      {/* ── Header ──────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(180deg, #0d0f1a 0%, #08090f 100%)',
        borderBottom: '1px solid #1e2030',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          💪
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.3px' }}>
            Saiya Gym
          </h1>
          <span style={{
            fontSize: '11px',
            color: '#22c55e',
            background: '#052e16',
            padding: '1px 7px',
            borderRadius: '10px',
            border: '1px solid #16a34a44',
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}>
            ● DB Conectada
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────── */}
      <main style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '32px 24px 64px',
      }}>

        {/* Separador visual */}
        <div style={{
          background: 'linear-gradient(90deg, #6366f111, #8b5cf622, #6366f111)',
          border: '1px solid #6366f133',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '40px',
          fontSize: '13px',
          color: '#818cf8',
        }}>
          🧪 <strong>Prueba de conexión —</strong> Los datos que ves a continuación fueron leídos directamente de tu base de datos local Supabase.
        </div>

        {/* Membresías */}
        <ListaMembresias />

        {/* Divisor */}
        <div style={{ height: '1px', background: '#1e2030', margin: '8px 0 8px' }} />

        {/* Personas */}
        <ListaPersonas />

      </main>
    </div>
  )
}

export default App