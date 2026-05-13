import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate } from '../utils/format'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

const tabBtn = active =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    active
      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40'
      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
  }`

function TabAreas() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('areas')
        .select('id_area, nombre_area, descripcion')
        .order('nombre_area', { ascending: true })
      if (err) {
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando áreas…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Área</th>
            <th className={tableHeadCellClass()}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-8 text-center text-slate-500 dark:text-slate-400">
                Sin áreas en la base.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.id_area} className={rowHoverClass()}>
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                  {row.nombre_area}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {row.descripcion ?? '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabEquipos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('equipos')
        .select(`
          id_equipo,
          nombre,
          estado,
          fecha_compra,
          proveedor ( nombre, tipo_provider ),
          areas ( nombre_area )
        `)
        .order('nombre', { ascending: true })
      if (err) {
        console.error('[Auditor] equipos:', err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando equipos…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Equipo</th>
            <th className={tableHeadCellClass()}>Área</th>
            <th className={tableHeadCellClass()}>Proveedor</th>
            <th className={tableHeadCellClass()}>Estado</th>
            <th className={tableHeadCellClass()}>Compra</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                Sin equipos.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.id_equipo} className={rowHoverClass()}>
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {row.areas?.nombre_area ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  <div>{row.proveedor?.nombre ?? '—'}</div>
                  {row.proveedor?.tipo_provider ? (
                    <div className="text-xs text-slate-500">{row.proveedor.tipo_provider}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{row.estado ?? '—'}</td>
                <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                  {formatDate(row.fecha_compra)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabInsumos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('insumos')
        .select(`
          id_insumo,
          nombre,
          cantidad,
          proveedor ( nombre )
        `)
        .order('nombre', { ascending: true })
      if (err) {
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando insumos…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Insumo</th>
            <th className={tableHeadCellClass()}>Proveedor</th>
            <th className={tableHeadCellClass()}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">
                Sin insumos.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.id_insumo} className={rowHoverClass()}>
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {row.proveedor?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3.5 tabular-nums font-medium">{row.cantidad ?? 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

function TabProveedores() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('proveedor')
        .select('id_provider, nombre, tipo_provider')
        .order('nombre', { ascending: true })
      if (err) {
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando proveedores…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Proveedor</th>
            <th className={tableHeadCellClass()}>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-8 text-center text-slate-500 dark:text-slate-400">
                Sin proveedores.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.id_provider} className={rowHoverClass()}>
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{row.nombre}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{row.tipo_provider ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

export default function VistaInstalaciones() {
  const [tab, setTab] = useState('areas')

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Instalaciones e inventario"
        subtitle="Áreas físicas, equipamiento, consumibles y proveedores."
        table="areas, equipos, insumos, proveedor"
      />

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Subsecciones instalaciones">
        {[
          { id: 'areas', label: 'Áreas' },
          { id: 'equipos', label: 'Equipos' },
          { id: 'insumos', label: 'Insumos' },
          { id: 'proveedor', label: 'Proveedores' },
        ].map(t => (
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

      {tab === 'areas' ? <TabAreas /> : null}
      {tab === 'equipos' ? <TabEquipos /> : null}
      {tab === 'insumos' ? <TabInsumos /> : null}
      {tab === 'proveedor' ? <TabProveedores /> : null}
    </section>
  )
}
