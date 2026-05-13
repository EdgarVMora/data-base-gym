import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaDetallePago() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    id_pago: '',
    id_membresia: '',
    id_promocion: '',
    id_inscripcion: '',
    id_insumo: '',
    cantidad: 1,
    precio_unitario: '',
    sub_total: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)
  const [pagos, setPagos] = useState([])
  const [membresias, setMembresias] = useState([])
  const [promociones, setPromociones] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [insumos, setInsumos] = useState([])

  async function loadAll() {
    setLoading(true)
    const [{ data: rows, error: err }, { data: pagosData }, { data: membresiasData }, { data: promosData }, { data: inscData }, { data: insumosData }] = await Promise.all([
      supabase.from('detalle_pago').select('*').order('id_detalle_pago', { ascending: false }),
      supabase.from('pagos').select('id_pago'),
      supabase.from('membresias').select('id_membresia, nombre, costo'),
      supabase.from('promocion').select('id_promocion, descripcion'),
      supabase.from('inscripciones').select('id_inscripcion'),
      supabase.from('insumos').select('id_insumo, nombre')
    ])
    if (err) setError(err.message)
    setRows(rows ?? [])
    setPagos(pagosData ?? [])
    setMembresias(membresiasData ?? [])
    setPromociones(promosData ?? [])
    setInscripciones(inscData ?? [])
    setInsumos(insumosData ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    let next = { ...form, [name]: value }
    if (name === 'cantidad' || name === 'precio_unitario') {
      const cantidad = name === 'cantidad' ? value : next.cantidad
      const precio = name === 'precio_unitario' ? value : next.precio_unitario
      next.sub_total = Number(cantidad || 1) * Number(precio || 0)
    }
    setForm(next)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    if (!form.id_pago || !form.id_membresia || !form.cantidad || !form.precio_unitario) {
      setFormError('Completa los campos obligatorios')
      setFormLoading(false)
      return
    }
    if (editId) {
      const { error } = await supabase.from('detalle_pago').update({
        ...form,
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        sub_total: Number(form.sub_total)
      }).eq('id_detalle_pago', editId)
      if (error) setFormError(error.message)
    } else {
      const { error } = await supabase.from('detalle_pago').insert({
        ...form,
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        sub_total: Number(form.sub_total)
      })
      if (error) setFormError(error.message)
    }
    setShowForm(false)
    setForm({ id_pago: '', id_membresia: '', id_promocion: '', id_inscripcion: '', id_insumo: '', cantidad: 1, precio_unitario: '', sub_total: '' })
    setEditId(null)
    await loadAll()
    setFormLoading(false)
  }

  function handleEdit(row) {
    setEditId(row.id_detalle_pago)
    setShowForm(true)
    setForm({
      id_pago: row.id_pago || '',
      id_membresia: row.id_membresia || '',
      id_promocion: row.id_promocion || '',
      id_inscripcion: row.id_inscripcion || '',
      id_insumo: row.id_insumo || '',
      cantidad: row.cantidad,
      precio_unitario: row.precio_unitario,
      sub_total: row.sub_total
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este detalle de pago?')) return
    await supabase.from('detalle_pago').delete().eq('id_detalle_pago', id)
    await loadAll()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Detalle de Pagos"
        subtitle="Conceptos específicos desglosados en cada pago o transacción."
        table="detalle_pago"
      />
      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => { setShowForm(f => !f); setEditId(null); setForm({ id_pago: '', id_membresia: '', id_promocion: '', id_inscripcion: '', id_insumo: '', cantidad: 1, precio_unitario: '', sub_total: '' }) }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo detalle'}
        </button>
      </div>
      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="border p-2 rounded" name="id_pago" value={form.id_pago} onChange={handleFormChange} required>
              <option value="">Pago</option>
              {pagos.map(p => <option key={p.id_pago} value={p.id_pago}>{p.id_pago}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_membresia" value={form.id_membresia} onChange={handleFormChange} required>
              <option value="">Membresía</option>
              {membresias.map(m => <option key={m.id_membresia} value={m.id_membresia}>{m.nombre}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_promocion" value={form.id_promocion} onChange={handleFormChange}>
              <option value="">Promoción</option>
              {promociones.map(p => <option key={p.id_promocion} value={p.id_promocion}>{p.descripcion}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_inscripcion" value={form.id_inscripcion} onChange={handleFormChange}>
              <option value="">Inscripción</option>
              {inscripciones.map(i => <option key={i.id_inscripcion} value={i.id_inscripcion}>{i.id_inscripcion}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_insumo" value={form.id_insumo} onChange={handleFormChange}>
              <option value="">Insumo</option>
              {insumos.map(i => <option key={i.id_insumo} value={i.id_insumo}>{i.nombre}</option>)}
            </select>
            <input className="border p-2 rounded" name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleFormChange} placeholder="Cantidad" required />
            <input className="border p-2 rounded" name="precio_unitario" type="number" min="0" value={form.precio_unitario} onChange={handleFormChange} placeholder="Precio unitario" required />
            <input className="border p-2 rounded" name="sub_total" type="number" min="0" value={form.sub_total} onChange={handleFormChange} placeholder="Subtotal" readOnly />
          </div>
          {formError && <div className="text-red-600 mt-2">{formError}</div>}
          <div className="mt-4 flex justify-end">
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60" type="submit" disabled={formLoading}>
              {formLoading ? (editId ? 'Actualizando...' : 'Registrando...') : (editId ? 'Actualizar' : 'Registrar')}
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
                <th className={tableHeadCellClass()}>ID</th>
                <th className={tableHeadCellClass()}>Pago</th>
                <th className={tableHeadCellClass()}>Membresía</th>
                <th className={tableHeadCellClass()}>Promoción</th>
                <th className={tableHeadCellClass()}>Inscripción</th>
                <th className={tableHeadCellClass()}>Insumo</th>
                <th className={tableHeadCellClass()}>Cantidad</th>
                <th className={tableHeadCellClass()}>Precio Unitario</th>
                <th className={tableHeadCellClass()}>Subtotal</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay detalles de pago registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_detalle_pago} className={rowHoverClass()}>
                    <td className="px-4 py-3.5">{row.id_detalle_pago}</td>
                    <td className="px-4 py-3.5">{row.id_pago ?? '—'}</td>
                    <td className="px-4 py-3.5">{membresias.find(m => m.id_membresia === row.id_membresia)?.nombre ?? row.id_membresia ?? '—'}</td>
                    <td className="px-4 py-3.5">{promociones.find(p => p.id_promocion === row.id_promocion)?.descripcion ?? row.id_promocion ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.id_inscripcion ?? '—'}</td>
                    <td className="px-4 py-3.5">{insumos.find(i => i.id_insumo === row.id_insumo)?.nombre ?? row.id_insumo ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.cantidad ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.precio_unitario ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.sub_total ?? '—'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_detalle_pago)}>Borrar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrap>
      ) : null}
    </section>
  )
}
