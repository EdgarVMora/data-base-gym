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

function ListaClasesTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('clases')
        .select(`
          id_clase,
          nombre_clase,
          duracion,
          nivel,
          empleados (
            personas ( nombre, apellido_paterno )
          )
        `)
        .order('nombre_clase', { ascending: true })

      if (err) {
        console.error('[Auditor] clases:', err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando clases…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Clase</th>
            <th className={tableHeadCellClass()}>Duración</th>
            <th className={tableHeadCellClass()}>Nivel</th>
            <th className={tableHeadCellClass()}>Instructor</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                No hay clases registradas.
              </td>
            </tr>
          ) : (
            rows.map(row => {
              const p = row.empleados?.personas
              const instructor = p ? `${p.nombre} ${p.apellido_paterno}` : '—'
              const dur =
                row.duracion == null
                  ? '—'
                  : typeof row.duracion === 'string'
                    ? row.duracion
                    : String(row.duracion)
              return (
                <tr key={row.id_clase} className={rowHoverClass()}>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {row.nombre_clase}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {dur}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{row.nivel ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">{instructor}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

function ListaInscripcionesTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('inscripciones')
        .select(`
          id_inscripcion,
          fecha_inscripcion,
          clientes (
            personas ( nombre, apellido_paterno, apellido_materno )
          ),
          clases ( nombre_clase, nivel )
        `)
        .order('fecha_inscripcion', { ascending: false })

      if (err) {
        console.error('[Auditor] inscripciones:', err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando inscripciones…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Cliente</th>
            <th className={tableHeadCellClass()}>Clase</th>
            <th className={tableHeadCellClass()}>Nivel</th>
            <th className={tableHeadCellClass()}>Fecha inscripción</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                No hay inscripciones.
              </td>
            </tr>
          ) : (
            rows.map(row => {
              const p = row.clientes?.personas
              const nombre = p
                ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                : '—'
              return (
                <tr key={row.id_inscripcion} className={rowHoverClass()}>
                  <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                    {row.clases?.nombre_clase ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {row.clases?.nivel ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                    {formatDate(row.fecha_inscripcion)}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

export default function VistaClasesInscripciones() {
  const [tab, setTab] = useState('clases')

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Clases e inscripciones"
        subtitle="Oferta de sesiones impartidas por empleados y matrícula de clientes."
        table="clases, inscripciones"
      />

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Vista clases o inscripciones">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'clases'}
          className={tabBtn(tab === 'clases')}
          onClick={() => setTab('clases')}
        >
          Clases
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'inscripciones'}
          className={tabBtn(tab === 'inscripciones')}
          onClick={() => setTab('inscripciones')}
        >
          Inscripciones
        </button>
      </div>

      {tab === 'clases' ? <ListaClasesTab /> : <ListaInscripcionesTab />}
    </section>
  )
}
