import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate, formatMoney } from '../utils/format'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaClienteMembresia() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('cliente_membresia')
        .select(`
          id_cliente_membresia,
          fecha_inicio,
          fecha_fin,
          estado,
          clientes (
            personas ( nombre, apellido_paterno, apellido_materno )
          ),
          membresias ( nombre, costo, duracion_meses )
        `)
        .order('fecha_inicio', { ascending: false })

      if (err) {
        console.error('[Auditor] cliente_membresia:', err.message, err.code)
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
        title="Membresías asignadas a clientes"
        subtitle="Contratos vigentes o históricos entre clientes y planes del catálogo."
        table="cliente_membresia → clientes → personas, membresias"
      />

      {loading ? <LoadingMessage /> : null}
      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Cliente</th>
                <th className={tableHeadCellClass()}>Plan</th>
                <th className={tableHeadCellClass()}>Inicio</th>
                <th className={tableHeadCellClass()}>Fin</th>
                <th className={tableHeadCellClass()}>Estado</th>
                <th className={tableHeadCellClass()}>Precio plan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay registros en <code className="font-mono text-xs">cliente_membresia</code>.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const p = row.clientes?.personas
                  const nombre = p
                    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                    : '—'
                  return (
                    <tr key={row.id_cliente_membresia} className={rowHoverClass()}>
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                        {row.membresias?.nombre ?? '—'}
                        {row.membresias?.duracion_meses != null ? (
                          <span className="block text-xs text-slate-500">
                            {row.membresias.duracion_meses} mes
                            {row.membresias.duracion_meses === 1 ? '' : 'es'}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha_inicio)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha_fin)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {row.estado ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums">
                        {formatMoney(row.membresias?.costo)}
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
