import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function MembresiaCard({ membresia }) {
  return (
    <div
      id={`membresia-${membresia.nombre.toLowerCase()}`}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 p-7 flex flex-col gap-3 min-w-[220px] transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">
          {membresia.nombre === 'Gold' ? '🥇' : membresia.nombre === 'Premium' ? '💎' : '🥉'}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-300 dark:border-gray-600">
          {membresia.nombre}
        </span>
      </div>

      <p className="text-sm leading-relaxed">
        {membresia.descripcion}
      </p>

      <div className="mt-auto flex justify-between items-end">
        <span className="text-xs">
          {membresia.duracion_meses} mes{membresia.duracion_meses > 1 ? 'es' : ''}
        </span>
        <span className="text-2xl font-bold font-mono tracking-tight">
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
    <section id="lista-membresias" className="py-8">
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-left">
        🏷️ Planes de Membresía
      </h2>

      {loading && (
        <p className="text-sm">Cargando membresías...</p>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 dark:border-red-700 px-4 py-3 text-sm">
          ⚠️ <strong>Error de conexión:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {membresias.map(m => (
            <MembresiaCard key={m.id_membresia} membresia={m} />
          ))}
        </div>
      )}
    </section>
  )
}
