import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate, formatMoney } from '../utils/format'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaNomina() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('nomina')
        .select(`
          id_nomina,
          periodo,
          salario_base,
          bonos,
          deducciones,
          total_a_pagar,
          fecha_pago,
          empleados (
            personas ( nombre, apellido_paterno, apellido_materno )
          )
        `)
        .order('fecha_pago', { ascending: false })

      if (err) {
        console.error('[Auditor] nomina:', err.message, err.code)
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
        title="Nómina"
        subtitle="Periodos de pago, salario base, bonos y deducciones por empleado."
        table="nomina → empleados → personas"
      />

      {loading ? <LoadingMessage /> : null}
      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Empleado</th>
                <th className={tableHeadCellClass()}>Periodo</th>
                <th className={tableHeadCellClass()}>Base</th>
                <th className={tableHeadCellClass()}>Bonos</th>
                <th className={tableHeadCellClass()}>Deducciones</th>
                <th className={tableHeadCellClass()}>Total</th>
                <th className={tableHeadCellClass()}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay registros de nómina.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const p = row.empleados?.personas
                  const nombre = p
                    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                    : '—'
                  return (
                    <tr key={row.id_nomina} className={rowHoverClass()}>
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{row.periodo}</td>
                      <td className="px-4 py-3.5 tabular-nums">{formatMoney(row.salario_base)}</td>
                      <td className="px-4 py-3.5 tabular-nums text-emerald-700 dark:text-emerald-400">
                        {formatMoney(row.bonos)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-red-700 dark:text-red-400">
                        {formatMoney(row.deducciones)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums">
                        {formatMoney(row.total_a_pagar)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha_pago)}
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
