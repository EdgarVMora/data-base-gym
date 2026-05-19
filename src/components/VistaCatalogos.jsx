import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

const tabBtn = active =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    active
      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40'
      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
  }`

function useCatalog(table, orderColumn, ascending = true) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: err } = await supabase.from(table).select('*').order(orderColumn, { ascending })
      if (cancelled) return
      if (err) {
        console.error(`[Auditor] ${table}:`, err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [table, orderColumn, ascending])

  return { rows, loading, error }
}

function TabGenero() {
  const { rows, loading, error } = useCatalog('genero', 'id_genero')
  if (loading) return <LoadingMessage>Cargando géneros…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />
  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>ID</th>
            <th className={tableHeadCellClass()}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id_genero} className={rowHoverClass()}>
              <td className="px-4 py-3.5 tabular-nums text-slate-500">{row.id_genero}</td>
              <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{row.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabTipoContrato() {
  const { rows, loading, error } = useCatalog('tipo_contrato', 'id_tipo_contrato')
  if (loading) return <LoadingMessage>Cargando tipos de contrato…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />
  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>ID</th>
            <th className={tableHeadCellClass()}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id_tipo_contrato} className={rowHoverClass()}>
              <td className="px-4 py-3.5 tabular-nums text-slate-500">{row.id_tipo_contrato}</td>
              <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{row.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabPuesto() {
  const { rows, loading, error } = useCatalog('puesto', 'id_puesto')
  if (loading) return <LoadingMessage>Cargando puestos…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />
  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>ID</th>
            <th className={tableHeadCellClass()}>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id_puesto} className={rowHoverClass()}>
              <td className="px-4 py-3.5 tabular-nums text-slate-500">{row.id_puesto}</td>
              <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{row.nombre_puesto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabTipoIncidencia() {
  const { rows, loading, error } = useCatalog('tipo_incidencia', 'id_tipo_incidencia')
  if (loading) return <LoadingMessage>Cargando tipos de incidencia…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />
  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>ID</th>
            <th className={tableHeadCellClass()}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id_tipo_incidencia} className={rowHoverClass()}>
              <td className="px-4 py-3.5 tabular-nums text-slate-500">{row.id_tipo_incidencia}</td>
              <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{row.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

export default function VistaCatalogos() {
  const [tab, setTab] = useState('genero')

  const tabs = [
    { id: 'genero', label: 'Género' },
    { id: 'tipo_contrato', label: 'Tipo contrato' },
    { id: 'puesto', label: 'Puesto' },
    { id: 'tipo_incidencia', label: 'Tipo incidencia' },
  ]

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Catálogos y referencias"
        subtitle="Consulta técnica de tablas de apoyo (género, contratos, puestos, tipos de incidencia). Uso administrativo."
        table="genero, tipo_contrato, puesto, tipo_incidencia"
      />

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Catálogos">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tabBtn(tab === t.id)}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'genero' ? <TabGenero /> : null}
      {tab === 'tipo_contrato' ? <TabTipoContrato /> : null}
      {tab === 'puesto' ? <TabPuesto /> : null}
      {tab === 'tipo_incidencia' ? <TabTipoIncidencia /> : null}
    </section>
  )
}
