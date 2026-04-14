import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

/**
 * Tarjeta de membresía con diseño premium de acuerdo al tier.
 */
const tierConfig = {
  Classic: { emoji: '🥉', gradient: 'linear-gradient(135deg, #3b3f5c, #2e3250)', accent: '#7c83c8', badge: '#4a4f7a' },
  Gold:    { emoji: '🥇', gradient: 'linear-gradient(135deg, #4a3000, #7a5200)', accent: '#f5b942', badge: '#7a5200' },
  Premium: { emoji: '💎', gradient: 'linear-gradient(135deg, #1a003d, #3d0087)', accent: '#c084fc', badge: '#5b00b5' },
}

function MembresiaCard({ membresia }) {
  const config = tierConfig[membresia.nombre] ?? tierConfig.Classic

  return (
    <div
      id={`membresia-${membresia.nombre.toLowerCase()}`}
      style={{
        background: config.gradient,
        border: `1px solid ${config.accent}44`,
        borderRadius: '16px',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: `0 8px 32px ${config.accent}22`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        minWidth: '220px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 16px 48px ${config.accent}44`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = `0 8px 32px ${config.accent}22`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '28px' }}>{config.emoji}</span>
        <span style={{
          background: config.badge,
          color: config.accent,
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {membresia.nombre}
        </span>
      </div>

      <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
        {membresia.descripcion}
      </p>

      <div style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          {membresia.duracion_meses} mes{membresia.duracion_meses > 1 ? 'es' : ''}
        </span>
        <span style={{
          color: config.accent,
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: '-0.5px',
        }}>
          ${Number(membresia.costo).toLocaleString('es-MX')}
        </span>
      </div>
    </div>
  )
}

export default function ListaMembresias() {
  const [membresias, setMembresias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMembresias() {
      const { data, error } = await supabase
        .from('membresias')
        .select('*')
        .order('costo', { ascending: true })

      if (error) {
        // El Auditor: registrar causa raíz en consola para diagnóstico
        console.error('[Auditor] Error al leer membresías:', error.message, '| code:', error.code)
        setError(error.message)
      } else {
        setMembresias(data)
      }

      setLoading(false)
    }

    fetchMembresias()
  }, [])

  return (
    <section id="lista-membresias" style={{ padding: '32px 0' }}>
      <h2 style={{
        margin: '0 0 24px',
        fontSize: '20px',
        color: '#f3f4f6',
        fontWeight: 600,
        letterSpacing: '-0.3px',
        textAlign: 'left',
      }}>
        🏷️ Planes de Membresía
      </h2>

      {loading && (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando membresías...</p>
      )}

      {error && (
        <div style={{
          background: '#2d1515',
          border: '1px solid #7f1d1d',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#fca5a5',
          fontSize: '13px',
        }}>
          ⚠️ <strong>Error de conexión:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {membresias.map(m => (
            <MembresiaCard key={m.id_membresia} membresia={m} />
          ))}
        </div>
      )}
    </section>
  )
}
