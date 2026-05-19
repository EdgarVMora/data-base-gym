import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { collectFormErrors } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, FormFieldErrors, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

const FORM_INICIAL = {
  id_pago: '',
  id_membresia: '',
  id_promocion: '',
  id_inscripcion: '',
  id_insumo: '',
  cantidad: 1,
  precio_unitario: '',
  sub_total: ''
}

function nombrePersona(p) {
  if (!p) return '—'
  return `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
}

export default function ListaDetallePago() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
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
      supabase.from('pagos').select('id_pago, clientes ( personas ( nombre, apellido_paterno, apellido_materno ) )').order('id_pago', { ascending: false }),
      supabase.from('membresias').select('id_membresia, nombre, costo'),
      supabase.from('promocion').select('id_promocion, descripcion'),
      supabase.from('inscripciones').select(`
        id_inscripcion,
        fecha_inscripcion,
        clientes ( personas ( nombre, apellido_paterno, apellido_materno ) ),
        clases ( nombre_clase )
      `).order('id_inscripcion', { ascending: false }),
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

  function labelPago(id) {
    if (!id) return '—'
    const p = pagos.find(x => x.id_pago === id)
    if (!p) return `Pago #${id}`
    const nombre = nombrePersona(p.clientes?.personas)
    return nombre !== '—' ? `${nombre} (#${id})` : `Pago #${id}`
  }

  function labelInscripcion(id) {
    if (!id) return '—'
    const i = inscripciones.find(x => x.id_inscripcion === id)
    if (!i) return `Inscripción #${id}`
    const nombre = nombrePersona(i.clientes?.personas)
    const clase = i.clases?.nombre_clase
    if (nombre !== '—' && clase) return `${nombre} — ${clase}`
    if (nombre !== '—') return nombre
    return `Inscripción #${id}`
  }

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

    const errors = collectFormErrors([
      !form.id_pago ? 'Selecciona el pago.' : null,
      !form.id_membresia ? 'Selecciona la membresía.' : null,
      !form.cantidad || Number(form.cantidad) < 1 ? 'La cantidad debe ser al menos 1.' : null,
      form.precio_unitario === '' || Number(form.precio_unitario) < 0 ? 'Captura un precio unitario válido.' : null,
    ])

    if (errors.length) {
      setFormError(errors)
      setFormLoading(false)
      return
    }

    const payload = {
      id_pago: form.id_pago,
      id_membresia: form.id_membresia,
      id_promocion: form.id_promocion || null,
      id_inscripcion: form.id_inscripcion || null,
      id_insumo: form.id_insumo || null,
      cantidad: Number(form.cantidad),
      precio_unitario: Number(form.precio_unitario),
      sub_total: Number(form.sub_total)
    }

    let hadError = false
    if (editId) {
      const { error: err } = await supabase.from('detalle_pago').update(payload).eq('id_detalle_pago', editId)
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    } else {
      const { error: err } = await supabase.from('detalle_pago').insert(payload)
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    }

    if (!hadError) {
      setShowForm(false)
      setForm(FORM_INICIAL)
      setEditId(null)
      await loadAll()
    }
    setFormLoading(false)
  }

  function handleEdit(row) {
    setEditId(row.id_detalle_pago)
    setShowForm(true)
    setFormError(null)
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

  function resetForm() {
    setShowForm(f => !f)
    setEditId(null)
    setFormError(null)
    setForm(FORM_INICIAL)
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
          type="button"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={resetForm}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo detalle'}
        </button>
      </div>
      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="border p-2 rounded" name="id_pago" value={form.id_pago} onChange={handleFormChange} required>
              <option value="">Pago (cliente)</option>
              {pagos.map(p => {
                const nombre = nombrePersona(p.clientes?.personas)
                return (
                  <option key={p.id_pago} value={p.id_pago}>
                    {nombre !== '—' ? `${nombre} (#${p.id_pago})` : `Pago #${p.id_pago}`}
                  </option>
                )
              })}
            </select>
            <select className="border p-2 rounded" name="id_membresia" value={form.id_membresia} onChange={handleFormChange} required>
              <option value="">Membresía</option>
              {membresias.map(m => <option key={m.id_membresia} value={m.id_membresia}>{m.nombre}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_promocion" value={form.id_promocion} onChange={handleFormChange}>
              <option value="">Promoción (opcional)</option>
              {promociones.map(p => <option key={p.id_promocion} value={p.id_promocion}>{p.descripcion}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_inscripcion" value={form.id_inscripcion} onChange={handleFormChange}>
              <option value="">Inscripción (opcional)</option>
              {inscripciones.map(i => {
                const nombre = nombrePersona(i.clientes?.personas)
                const clase = i.clases?.nombre_clase
                const etiqueta = nombre !== '—' && clase ? `${nombre} — ${clase}` : nombre !== '—' ? nombre : `Inscripción #${i.id_inscripcion}`
                return (
                  <option key={i.id_inscripcion} value={i.id_inscripcion}>
                    {etiqueta}
                  </option>
                )
              })}
            </select>
            <select className="border p-2 rounded" name="id_insumo" value={form.id_insumo} onChange={handleFormChange}>
              <option value="">Insumo (opcional)</option>
              {insumos.map(i => <option key={i.id_insumo} value={i.id_insumo}>{i.nombre}</option>)}
            </select>
            <input className="border p-2 rounded" name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleFormChange} placeholder="Cantidad" required />
            <input className="border p-2 rounded" name="precio_unitario" type="number" min="0" value={form.precio_unitario} onChange={handleFormChange} placeholder="Precio unitario" required />
            <input className="border p-2 rounded" name="sub_total" type="number" min="0" value={form.sub_total} onChange={handleFormChange} placeholder="Subtotal" readOnly />
          </div>
          <FormFieldErrors error={formError} />
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
                <th className={tableHeadCellClass()}>Pago</th>
                <th className={tableHeadCellClass()}>Membresía</th>
                <th className={tableHeadCellClass()}>Promoción</th>
                <th className={tableHeadCellClass()}>Inscripción</th>
                <th className={tableHeadCellClass()}>Insumo</th>
                <th className={tableHeadCellClass()}>Cantidad</th>
                <th className={tableHeadCellClass()}>Precio unitario</th>
                <th className={tableHeadCellClass()}>Subtotal</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay detalles de pago registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_detalle_pago} className={rowHoverClass()}>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{labelPago(row.id_pago)}</td>
                    <td className="px-4 py-3.5">{membresias.find(m => m.id_membresia === row.id_membresia)?.nombre ?? '—'}</td>
                    <td className="px-4 py-3.5">{promociones.find(p => p.id_promocion === row.id_promocion)?.descripcion ?? '—'}</td>
                    <td className="px-4 py-3.5">{labelInscripcion(row.id_inscripcion)}</td>
                    <td className="px-4 py-3.5">{insumos.find(i => i.id_insumo === row.id_insumo)?.nombre ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.cantidad ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.precio_unitario ?? '—'}</td>
                    <td className="px-4 py-3.5 font-medium">{row.sub_total ?? '—'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button type="button" className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_detalle_pago)}>Borrar</button>
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
