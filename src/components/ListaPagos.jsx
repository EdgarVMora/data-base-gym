import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDateTime, formatMoney } from '../utils/format'
import {
  collectFormErrors,
  isoToLocalDateTimeInput,
  isFutureDateTimeLocal,
  isValidDateTimeLocal,
  localDateTimeToISO,
  nowLocalDateTimeInputMax,
} from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaPagos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    id_cliente: '',
    fecha_pago: '',
    metodo_pago: '',
    detalles: [],
    // Eliminados campos de nombre y apellidos del cliente, solo se usa id_cliente
  })
  // Eliminados estados de validación de nombre/apellidos de cliente
  const [clientes, setClientes] = useState([])
  const [membresias, setMembresias] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [detalleDraft, setDetalleDraft] = useState({ id_membresia: '', cantidad: 1, precio_unitario: '', sub_total: '' })
  const [editId, setEditId] = useState(null)

  // Cargar pagos, clientes y membresías
  async function loadPagos() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('pagos')
      .select(`
        id_pago,
        monto_total,
        fecha_pago,
        metodo_pago,
        clientes (
          personas ( nombre, apellido_paterno, apellido_materno )
        ),
        detalle_pago (
          id_detalle_pago,
          cantidad,
          precio_unitario,
          sub_total,
          membresias ( nombre, id_membresia )
        )
      `)
      .order('fecha_pago', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }
  async function loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('id_cliente, personas ( nombre, apellido_paterno, apellido_materno )')
      .order('id_cliente', { ascending: false })
    setClientes(data ?? [])
  }
  async function loadMembresias() {
    const { data } = await supabase
      .from('membresias')
      .select('id_membresia, nombre, costo')
      .order('costo', { ascending: true })
    setMembresias(data ?? [])
  }
  useEffect(() => {
    loadPagos()
    loadClientes()
    loadMembresias()
  }, [])

  function resumenDetalle(detalle) {
    if (!detalle?.length) return '—'
    const parts = detalle.map(d => {
      const concepto = d.membresias?.nombre ?? 'Partida'
      return `${concepto} (${formatMoney(d.sub_total)})`
    })
    return parts.join(' · ')
  }

  // Calcular total
  const monto_total = form.detalles.reduce((acc, d) => acc + Number(d.sub_total || 0), 0)

  // Manejo de detalle draft
  function handleDetalleDraftChange(e) {
    const { name, value } = e.target
    let next = { ...detalleDraft, [name]: value }
    if (name === 'id_membresia') {
      const mem = membresias.find(m => m.id_membresia === value)
      if (mem) {
        next.precio_unitario = mem.costo
        next.sub_total = mem.costo * (next.cantidad || 1)
      }
    }
    if (name === 'cantidad' || name === 'precio_unitario') {
      const cantidad = name === 'cantidad' ? value : next.cantidad
      const precio = name === 'precio_unitario' ? value : next.precio_unitario
      next.sub_total = Number(cantidad || 1) * Number(precio || 0)
    }
    setDetalleDraft(next)
  }

  function handleAddDetalle() {
    if (!detalleDraft.id_membresia || !detalleDraft.cantidad || !detalleDraft.precio_unitario) return
    setForm(f => ({
      ...f,
      detalles: [...f.detalles, { ...detalleDraft }]
    }))
    setDetalleDraft({ id_membresia: '', cantidad: 1, precio_unitario: '', sub_total: '' })
  }

  function handleRemoveDetalle(idx) {
    setForm(f => ({
      ...f,
      detalles: f.detalles.filter((_, i) => i !== idx)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const errors = collectFormErrors([
      !form.id_cliente ? 'Selecciona un cliente.' : null,
      !form.fecha_pago ? 'Selecciona fecha y hora del pago.' : null,
      !form.metodo_pago ? 'Captura el método de pago.' : null,
      form.detalles.length === 0 ? 'Agrega al menos un concepto en el detalle.' : null,
      form.fecha_pago && !isValidDateTimeLocal(form.fecha_pago)
        ? 'Fecha y hora de pago con formato inválido.'
        : null,
      form.fecha_pago && isFutureDateTimeLocal(form.fecha_pago)
        ? 'La fecha y hora de pago no pueden ser futuras.'
        : null,
    ])
    if (errors.length) {
      setFormError(errors)
      setFormLoading(false)
      return
    }
    const fechaPagoUTC = localDateTimeToISO(form.fecha_pago);
    if (editId) {
      // Editar pago
      const { error: errPago } = await supabase
        .from('pagos')
        .update({
          id_cliente: form.id_cliente,
          monto_total,
          fecha_pago: fechaPagoUTC,
          metodo_pago: form.metodo_pago
        })
        .eq('id_pago', editId);
      if (errPago) {
        setFormError('Error al actualizar pago: ' + errPago.message);
        setFormLoading(false);
        return;
      }
      // Eliminar detalles previos y volver a insertar
      await supabase.from('detalle_pago').delete().eq('id_pago', editId);
      for (const d of form.detalles) {
        const { error: errDet } = await supabase
          .from('detalle_pago')
          .insert({
            id_pago: editId,
            id_membresia: d.id_membresia,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            sub_total: d.sub_total
          });
        if (errDet) {
          setFormError('Error al actualizar detalle: ' + errDet.message);
          setFormLoading(false);
          return;
        }
      }
    } else {
      // 1. Insertar pago
      const { data: pago, error: errPago } = await supabase
        .from('pagos')
        .insert({
          id_cliente: form.id_cliente,
          monto_total,
          fecha_pago: fechaPagoUTC,
          metodo_pago: form.metodo_pago
        })
        .select()
        .single();
      if (errPago) {
        setFormError('Error al registrar pago: ' + errPago.message);
        setFormLoading(false);
        return;
      }
      // 2. Insertar detalle_pago
      for (const d of form.detalles) {
        const { error: errDet } = await supabase
          .from('detalle_pago')
          .insert({
            id_pago: pago.id_pago,
            id_membresia: d.id_membresia,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            sub_total: d.sub_total
          });
        if (errDet) {
          setFormError('Error al registrar detalle: ' + errDet.message);
          setFormLoading(false);
          return;
        }
      }
    }
    setShowForm(false);
    setForm({ id_cliente: '', fecha_pago: '', metodo_pago: '', detalles: [] });
    setEditId(null);
    await loadPagos();
    setFormLoading(false);
  }

  async function handleEdit(row) {
    setEditId(row.id_pago)
    setShowForm(true)
    setForm({
      id_cliente: row.clientes?.id_cliente || '',
      fecha_pago: isoToLocalDateTimeInput(row.fecha_pago) || '',
      metodo_pago: row.metodo_pago || '',
      detalles: (row.detalle_pago || []).map(d => ({
        id_membresia: d.membresias?.id_membresia || '',
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        sub_total: d.sub_total
      }))
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este pago?')) return
    await supabase.from('detalle_pago').delete().eq('id_pago', id)
    await supabase.from('pagos').delete().eq('id_pago', id)
    await loadPagos()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Pagos"
        subtitle="Registro de pagos de clientes con desglose por membresías y conceptos."
        table="pagos → clientes, detalle_pago, membresias"
      />

      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => {
            setShowForm(f => !f)
            setEditId(null)
            setForm({ id_cliente: '', fecha_pago: '', metodo_pago: '', detalles: [] })
          }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo pago'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border p-2 rounded"
              value={form.id_cliente}
              onChange={e => setForm(f => ({ ...f, id_cliente: e.target.value }))}
              required
            >
              <option value="">Selecciona cliente</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.personas ? `${c.personas.nombre} ${c.personas.apellido_paterno} ${c.personas.apellido_materno ?? ''}`.trim() : c.id_cliente}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              type="datetime-local"
              value={form.fecha_pago}
              onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))}
              required
              max={nowLocalDateTimeInputMax()}
            />
            <input
              className="border p-2 rounded"
              placeholder="Método de pago"
              value={form.metodo_pago}
              onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}
              required
            />
          </div>
          <div className="mt-4">
            <div className="font-semibold mb-2">Detalle del pago</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <select
                className="border p-2 rounded"
                name="id_membresia"
                value={detalleDraft.id_membresia}
                onChange={handleDetalleDraftChange}
              >
                <option value="">Membresía</option>
                {membresias.map(m => (
                  <option key={m.id_membresia} value={m.id_membresia}>{m.nombre}</option>
                ))}
              </select>
              <input
                className="border p-2 rounded"
                name="cantidad"
                type="number"
                min="1"
                value={detalleDraft.cantidad}
                onChange={handleDetalleDraftChange}
                placeholder="Cantidad"
              />
              <input
                className="border p-2 rounded"
                name="precio_unitario"
                type="number"
                min="0"
                value={detalleDraft.precio_unitario}
                onChange={handleDetalleDraftChange}
                placeholder="Precio unitario"
              />
              <button
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
                onClick={handleAddDetalle}
              >
                {editId ? 'Agregar concepto' : 'Agregar concepto'}
              </button>
            </div>
            <div className="mt-2">
              {form.detalles.length > 0 && (
                <table className="w-full text-xs border mt-2">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700">
                      <th className="p-1">Membresía</th>
                      <th className="p-1">Cantidad</th>
                      <th className="p-1">Precio unitario</th>
                      <th className="p-1">Subtotal</th>
                      <th className="p-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.detalles.map((d, idx) => {
                      const mem = membresias.find(m => m.id_membresia === d.id_membresia)
                      return (
                        <tr key={idx}>
                          <td className="p-1">{mem ? mem.nombre : d.id_membresia}</td>
                          <td className="p-1">{d.cantidad}</td>
                          <td className="p-1">{formatMoney(d.precio_unitario)}</td>
                          <td className="p-1">{formatMoney(d.sub_total)}</td>
                          <td className="p-1">
                            <button type="button" className="text-red-600" onClick={() => handleRemoveDetalle(idx)}>
                              Quitar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-2 text-right font-bold">
              Total: {formatMoney(monto_total)}
            </div>
          </div>
          {formError ? (
            Array.isArray(formError) ? (
              <div className="text-red-600 mt-2 text-sm">
                <div className="font-semibold mb-1">Corrige lo siguiente:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {formError.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-red-600 mt-2 text-sm">{formError}</div>
            )
          ) : null}
          <div className="mt-4 flex justify-end">
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? (editId ? 'Actualizando...' : 'Registrando...') : (editId ? 'Actualizar pago' : 'Registrar pago')}
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingMessage /> : null}
      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Cliente</th>
                <th className={tableHeadCellClass()}>Fecha</th>
                <th className={tableHeadCellClass()}>Método</th>
                <th className={tableHeadCellClass()}>Total</th>
                <th className={tableHeadCellClass()}>Detalle</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay pagos registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const p = row.clientes?.personas
                  const nombre = p
                    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                    : '—'
                  return (
                    <tr key={row.id_pago} className={rowHoverClass()}>
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDateTime(row.fecha_pago)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {row.metodo_pago ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums">
                        {formatMoney(row.monto_total)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-md">
                        {resumenDetalle(row.detalle_pago)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          className="text-amber-700 hover:underline mr-2"
                          onClick={() => handleEdit(row)}
                        >Editar</button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(row.id_pago)}
                        >Borrar</button>
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
