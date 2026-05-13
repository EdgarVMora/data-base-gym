import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate, formatTime } from '../utils/format'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaRegistroAcceso() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('registro_acceso')
        .select(`
          id_registro,
          fecha,
          hora_entrada,
          hora_salida,
          clientes (
            personas ( nombre, apellido_paterno, apellido_materno )
          )
        `)
        .order('fecha', { ascending: false })

      if (err) {
        console.error('[Auditor] registro_acceso:', err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Registro de acceso"
        subtitle="Entradas y salidas de clientes en las instalaciones."
        table="registro_acceso → clientes → personas"
      />

      {loading ? <LoadingMessage /> : null}
      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Cliente</th>
                <th className={tableHeadCellClass()}>Fecha</th>
                <th className={tableHeadCellClass()}>Entrada</th>
                <th className={tableHeadCellClass()}>Salida</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay registros de acceso.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const p = row.clientes?.personas
                  const nombre = p
                    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                    : '—'
                  return (
                    <tr key={row.id_registro} className={rowHoverClass()}>
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums font-mono text-xs text-slate-600 dark:text-slate-300">
                        {formatTime(row.hora_entrada)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums font-mono text-xs text-slate-600 dark:text-slate-300">
                        {formatTime(row.hora_salida)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableWrap>
      ) : null}
    </section>
  )
}
