import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatMoney } from '../utils/format'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage } from './ui/QueryState'

function tierAccent(nombre) {
  const n = nombre?.toLowerCase() ?? ''
  if (n.includes('gold')) return 'from-amber-500/90 to-yellow-600/80'
  if (n.includes('premium')) return 'from-violet-500/85 to-fuchsia-600/75'
  return 'from-slate-400/80 to-slate-600/70'
}

function MembresiaCard({ membresia }) {
  const accent = tierAccent(membresia.nombre)

  return (
    <div
      id={`membresia-${membresia.nombre.toLowerCase()}`}
      className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm p-6 flex flex-col gap-3 min-w-[220px] shadow-sm hover:shadow-md hover:border-amber-200/80 dark:hover:border-amber-900/40 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r ${accent} opacity-90`}
        aria-hidden
      />
      <div className="flex items-center gap-2.5 pt-1">
        <span className="text-2xl leading-none" aria-hidden>
          {membresia.nombre === 'Gold'
            ? '🥇'
            : membresia.nombre === 'Premium'
              ? '💎'
              : '🥉'}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
          {membresia.nombre}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 m-0">
        {membresia.descripcion}
      </p>

      <div className="mt-auto flex justify-between items-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {membresia.duracion_meses} mes{membresia.duracion_meses > 1 ? 'es' : ''}
        </span>
        <span className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
          {formatMoney(membresia.costo)}
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
    <section id="lista-membresias" className="scroll-mt-8">
      <SectionIntro
        title="Planes de membresía"
        subtitle="Catálogo de planes comerciales (duración y precio de lista)."
        table="membresias"
      />

      {loading ? <LoadingMessage>Cargando membresías…</LoadingMessage> : null}

      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {membresias.map(m => (
            <MembresiaCard key={m.id_membresia} membresia={m} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
