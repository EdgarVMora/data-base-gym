import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate, formatTime } from '../utils/format'
import { nowLocalDateInputMax } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

function fechaHoy() {
  return nowLocalDateInputMax()
}

function horaActual() {
  return new Date().toTimeString().slice(0, 8)
}

export default function ListaRegistroAcceso() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [clientes, setClientes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [idCliente, setIdCliente] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  async function loadRegistros() {
    setLoading(true)
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
      .order('hora_entrada', { ascending: false })

    if (err) {
      console.error('[Auditor] registro_acceso:', err.message, err.code)
      setError(err.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }

  async function loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select(`
        id_cliente,
        personas ( nombre, apellido_paterno, apellido_materno )
      `)
    setClientes(data ?? [])
  }

  useEffect(() => {
    loadRegistros()
    loadClientes()
  }, [])

  async function registrarEntrada(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    if (!idCliente) {
      setFormError('Selecciona un cliente.')
      setFormLoading(false)
      return
    }

    const { error: err } = await supabase
      .from('registro_acceso')
      .insert({
        id_cliente: idCliente,
        fecha: fechaHoy(),
        hora_entrada: horaActual(),
        hora_salida: null
      })

    if (err) {
      setFormError('Error al registrar entrada: ' + err.message)
      setFormLoading(false)
      return
    }

    setIdCliente('')
    setShowForm(false)
    await loadRegistros()
    setFormLoading(false)
  }

  async function registrarSalida(idRegistro) {
    const { error: err } = await supabase
      .from('registro_acceso')
      .update({ hora_salida: horaActual() })
      .eq('id_registro', idRegistro)

    if (err) {
      alert('Error al registrar salida: ' + err.message)
      return
    }
    await loadRegistros()
  }

  function nombrePersona(personas) {
    if (!personas) return '—'
    return `${personas.nombre} ${personas.apellido_paterno} ${personas.apellido_materno ?? ''}`.trim()
  }

  // Agrupar registros por fecha (orden descendente — más recientes primero)
  const gruposPorFecha = rows.reduce((acc, row) => {
    const dia = row.fecha
    if (!acc[dia]) acc[dia] = []
    acc[dia].push(row)
    return acc
  }, {})
  const diasOrdenados = Object.keys(gruposPorFecha).sort((a, b) => b.localeCompare(a))

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Registro de acceso"
        subtitle="Entradas y salidas registradas manualmente, agrupadas por día."
        table="registro_acceso → clientes → personas"
      />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => {
            setShowForm(f => !f)
            setFormError(null)
            setIdCliente('')
          }}
        >
          {showForm ? 'Cancelar' : 'Registrar entrada'}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow"
          onSubmit={registrarEntrada}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border p-2 rounded"
              value={idCliente}
              onChange={e => setIdCliente(e.target.value)}
              required
            >
              <option value="">Selecciona cliente</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {nombrePersona(c.personas)}
                </option>
              ))}
            </select>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              Hora de entrada: <span className="ml-2 font-mono">{horaActual()}</span> (hoy)
            </div>
          </div>

          {formError && <div className="text-red-600 mt-3 text-sm">{formError}</div>}

          <div className="mt-4 flex justify-end">
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? 'Registrando...' : 'Registrar entrada'}
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingMessage /> : null}
      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        diasOrdenados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No hay registros de acceso.
          </div>
        ) : (
          <div className="space-y-3">
            {diasOrdenados.map((dia, idx) => {
              const registros = gruposPorFecha[dia]
              const dentro = registros.filter(r => !r.hora_salida).length
              return (
                <details
                  key={dia}
                  open={idx === 0}
                  className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 group-open:rotate-90 transition-transform">▸</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(dia)}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full px-3 py-1 font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                        {registros.length} registros
                      </span>
                      {dentro > 0 && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800">
                          {dentro} dentro
                        </span>
                      )}
                    </div>
                  </summary>

                  <div className="px-2 pb-2">
                    <TableWrap>
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th className={tableHeadCellClass()}>Cliente</th>
                            <th className={tableHeadCellClass()}>Entrada</th>
                            <th className={tableHeadCellClass()}>Salida</th>
                            <th className={tableHeadCellClass()}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map(row => {
                            const nombre = nombrePersona(row.clientes?.personas)
                            return (
                              <tr key={row.id_registro} className={rowHoverClass()}>
                                <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                                <td className="px-4 py-3.5 tabular-nums font-mono text-xs text-slate-600 dark:text-slate-300">
                                  {formatTime(row.hora_entrada)}
                                </td>
                                <td className="px-4 py-3.5 tabular-nums font-mono text-xs text-slate-600 dark:text-slate-300">
                                  {row.hora_salida ? formatTime(row.hora_salida) : <span className="text-amber-600 dark:text-amber-400">— pendiente —</span>}
                                </td>
                                <td className="px-4 py-3.5">
                                  {row.hora_salida ? (
                                    <span className="text-xs text-slate-400">—</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => registrarSalida(row.id_registro)}
                                      className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium hover:underline text-sm"
                                    >
                                      Registrar salida
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </TableWrap>
                  </div>
                </details>
              )
            })}
          </div>
        )
      ) : null}
    </section>
  )
}
