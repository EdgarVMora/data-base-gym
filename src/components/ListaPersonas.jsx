import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function PersonaRow({ persona }) {
  const genero = persona.genero?.descripcion ?? '—'
  const contacto = persona.medios_contacto?.[0]
  const generoIcon = { Masculino: '♂', Femenino: '♀' }

  return (
    <tr
      id={`persona-row-${persona.id_persona}`}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Nombre completo */}
      <td className="px-4 py-3.5 text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-gray-300 dark:border-gray-600">
            {persona.nombre[0]}{persona.apellido_paterno[0]}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {persona.nombre} {persona.apellido_paterno} {persona.apellido_materno ?? ''}
            </div>
            <div className="text-xs opacity-60">
              {contacto?.correo_electronico ?? '—'}
            </div>
          </div>
        </div>
      </td>

      {/* Teléfono */}
      <td className="px-4 py-3.5 text-left text-sm opacity-70">
        {contacto?.telefono ?? '—'}
      </td>

      {/* Género */}
      <td className="px-4 py-3.5 text-center text-base">
        {generoIcon[genero] ?? '?'}
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
    <section id="lista-personas" className="py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
        <h2 className="m-0 text-xl font-semibold tracking-tight text-left">
          👥 Directorio de Personas
        </h2>

        {/* Badges resumen */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-600">
            {personas.length} Total
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-600">
            {totalMasc} ♂
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-600">
            {totalFem} ♀
          </span>
        </div>
      </div>

      {/* Buscador */}
      <input
        id="busqueda-personas"
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full box-border px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-sm mb-4 outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors"
      />

      {loading && <p className="text-sm">Cargando personas...</p>}

      {error && (
        <div className="rounded-lg border border-red-300 dark:border-red-700 px-4 py-3 text-sm">
          ⚠️ <strong>Error de conexión:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-left">
                  Nombre / Contacto
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-left">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-center">
                  Género
                </th>
              </tr>
            </thead>
            <tbody>
              {personasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-sm opacity-50">
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
