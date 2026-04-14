import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const generoIcon = { Masculino: '♂', Femenino: '♀' }
const generoColor = { Masculino: '#60a5fa', Femenino: '#f472b6' }

function PersonaRow({ persona }) {
  const genero = persona.genero?.descripcion ?? '—'
  const contacto = persona.medios_contacto?.[0]

  return (
    <tr
      id={`persona-row-${persona.id_persona}`}
      style={{ borderBottom: '1px solid #1e2030' }}
      onMouseEnter={e => e.currentTarget.style.background = '#12141f'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Nombre completo */}
      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}>
            {persona.nombre[0]}{persona.apellido_paterno[0]}
          </div>
          <div>
            <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: '14px' }}>
              {persona.nombre} {persona.apellido_paterno} {persona.apellido_materno ?? ''}
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>
              {contacto?.correo_electronico ?? '—'}
            </div>
          </div>
        </div>
      </td>

      {/* Teléfono */}
      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px', textAlign: 'left' }}>
        {contacto?.telefono ?? '—'}
      </td>

      {/* Género */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{
          color: generoColor[genero] ?? '#9ca3af',
          fontSize: '16px',
          title: genero,
        }}>
          {generoIcon[genero] ?? '?'}
        </span>
      </td>
    </tr>
  )
}

export default function ListaPersonas() {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function fetchPersonas() {
      const { data, error } = await supabase
        .from('personas')
        .select(`
          id_persona,
          nombre,
          apellido_paterno,
          apellido_materno,
          genero ( descripcion ),
          medios_contacto ( telefono, correo_electronico )
        `)
        .order('apellido_paterno', { ascending: true })

      if (error) {
        // El Auditor: Causa Raíz documentada en consola
        console.error('[Auditor] Error al leer personas:', error.message, '| code:', error.code)
        setError(error.message)
      } else {
        setPersonas(data)
      }

      setLoading(false)
    }

    fetchPersonas()
  }, [])

  const personasFiltradas = personas.filter(p => {
    const termino = busqueda.toLowerCase()
    const nombre = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.toLowerCase()
    const correo = p.medios_contacto?.[0]?.correo_electronico?.toLowerCase() ?? ''
    return nombre.includes(termino) || correo.includes(termino)
  })

  const totalMasc = personas.filter(p => p.genero?.descripcion === 'Masculino').length
  const totalFem  = personas.filter(p => p.genero?.descripcion === 'Femenino').length

  return (
    <section id="lista-personas" style={{ padding: '32px 0' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#f3f4f6', fontWeight: 600, letterSpacing: '-0.3px', textAlign: 'left' }}>
          👥 Directorio de Personas
        </h2>

        {/* Badges resumen */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: `${personas.length} Total`, color: '#6366f1', bg: '#1e1f3b' },
            { label: `${totalMasc} ♂`, color: '#60a5fa', bg: '#0f1f36' },
            { label: `${totalFem} ♀`, color: '#f472b6', bg: '#2d0f25' },
          ].map(b => (
            <span key={b.label} style={{
              background: b.bg,
              color: b.color,
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              border: `1px solid ${b.color}33`,
            }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <input
        id="busqueda-personas"
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid #2e303a',
          background: '#0f1117',
          color: '#f3f4f6',
          fontSize: '14px',
          marginBottom: '16px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = '#2e303a'}
      />

      {loading && <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando personas...</p>}

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
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #1e2030' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#0d0f1a' }}>
                {['Nombre / Contacto', 'Teléfono', 'Género'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    color: '#6b7280',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: h === 'Género' ? 'center' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', color: '#4b5563', textAlign: 'center', fontSize: '13px' }}>
                    No se encontraron personas con ese criterio.
                  </td>
                </tr>
              ) : (
                personasFiltradas.map(p => <PersonaRow key={p.id_persona} persona={p} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
