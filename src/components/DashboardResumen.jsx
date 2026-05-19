import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const COUNT_SPECS = [
  { key: 'personas', label: 'Personas', table: 'personas', nav: 'personas' },
  { key: 'clientes', label: 'Clientes', table: 'clientes', nav: 'clientes' },
  { key: 'empleados', label: 'Empleados', table: 'empleados', nav: 'empleados' },
  { key: 'membresias', label: 'Planes (catálogo)', table: 'membresias', nav: 'membresias' },
  { key: 'cliente_membresia', label: 'Membresías contratadas', table: 'cliente_membresia', nav: 'cliente_membresia' },
  { key: 'pagos', label: 'Pagos', table: 'pagos', nav: 'pagos' },
  { key: 'detalle_pago', label: 'Líneas de pago', table: 'detalle_pago', nav: 'pagos' },
  { key: 'clases', label: 'Clases', table: 'clases', nav: 'clases' },
  { key: 'inscripciones', label: 'Inscripciones', table: 'inscripciones', nav: 'clases' },
  { key: 'areas', label: 'Áreas', table: 'areas', nav: 'instalaciones' },
  { key: 'equipos', label: 'Equipos', table: 'equipos', nav: 'instalaciones' },
  { key: 'insumos', label: 'Insumos', table: 'insumos', nav: 'instalaciones' },
  { key: 'proveedor', label: 'Proveedores', table: 'proveedor', nav: 'instalaciones' },
  { key: 'incidencias', label: 'Incidencias', table: 'incidencias', nav: 'incidencias' },
  { key: 'nomina', label: 'Registros de nómina', table: 'nomina', nav: 'nomina' },
  { key: 'registro_acceso', label: 'Accesos registrados', table: 'registro_acceso', nav: 'accesos' },
]

function StatCard({ label, count, nav, onNavigate, loading }) {
  const body =
    loading ? '…' : count != null ? count.toLocaleString('es-MX') : '—'

  const className =
    'rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur-sm p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-amber-200/70 dark:hover:border-amber-900/30'

  if (nav && onNavigate) {
    return (
      <button type="button" onClick={() => onNavigate(nav)} className={className}>
        <p className="m-0 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{body}</p>
        <p className="m-0 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="m-0 mt-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400/90">
          Ver sección →
        </p>
      </button>
    )
  }

  return (
    <div className={className}>
      <p className="m-0 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{body}</p>
      <p className="m-0 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

export default function DashboardResumen({ onNavigate }) {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const results = await Promise.all(
        COUNT_SPECS.map(({ table }) =>
          supabase.from(table).select('*', { count: 'exact', head: true }),
        ),
      )

      if (cancelled) return

      const err = results.find(r => r.error)?.error
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const next = {}
      COUNT_SPECS.forEach((spec, i) => {
        next[spec.key] = results[i].count ?? 0
      })
      setCounts(next)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resumen del modelo de datos
        </h2>
        <p className="mt-2 mb-0 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Conteos por tabla según tu base local. Usa las tarjetas para saltar a la vista detallada. Si un
          conteo es cero, es normal mientras amplías el <code className="text-xs font-mono">seed.sql</code>.
        </p>
      </header>

      {error ? (
        <div
          className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/30 px-4 py-3 text-sm text-red-900 dark:text-red-200"
          role="alert"
        >
          <strong className="font-semibold">No se pudieron cargar los conteos:</strong> {error}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:gap-4">
          {COUNT_SPECS.map(spec => (
            <StatCard
              key={spec.key}
              label={spec.label}
              count={counts[spec.key]}
              nav={spec.nav}
              onNavigate={onNavigate}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
