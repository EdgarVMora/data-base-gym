import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'


export default function ListaInsumos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', id_proveedor: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [proveedores, setProveedores] = useState([])
  const [editId, setEditId] = useState(null)

  async function loadInsumos() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('insumos')
      .select('*')
      .order('id_insumo', { ascending: false })
    setRows(data ?? [])
    setLoading(false)
    if (err) setError(err.message)
  }

  async function loadProveedores() {
    const { data } = await supabase.from('proveedor').select('*').order('nombre', { ascending: true })
    setProveedores(data ?? [])
  }

  useEffect(() => {
    loadInsumos()
    loadProveedores()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    if (!form.nombre || !form.cantidad || !form.id_proveedor) {
      setFormError('Todos los campos son obligatorios')
      setFormLoading(false)
      return
    }
    let res
    if (editId) {
      res = await supabase.from('insumos').update({
        nombre: form.nombre,
        cantidad: form.cantidad,
        id_proveedor: form.id_proveedor
      }).eq('id_insumo', editId)
    } else {
      res = await supabase.from('insumos').insert({
        nombre: form.nombre,
        cantidad: form.cantidad,
        id_proveedor: form.id_proveedor
      })
    }
    if (res.error) {
      setFormError(res.error.message)
    } else {
      setShowForm(false)
      setForm({ nombre: '', cantidad: '', id_proveedor: '' })
      setEditId(null)
      await loadInsumos()
    }
    setFormLoading(false)
  }

  async function handleEdit(row) {
    setForm({ nombre: row.nombre, cantidad: row.cantidad, id_proveedor: row.id_proveedor })
    setEditId(row.id_insumo)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este insumo?')) return
    await supabase.from('insumos').delete().eq('id_insumo', id)
    await loadInsumos()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Insumos"
        subtitle="Productos de inventario o consumibles provistos por externos."
        table="insumos"
      />

      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => { setShowForm(f => !f); setEditId(null); setForm({ nombre: '', cantidad: '', id_proveedor: '' }) }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo insumo'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Nombre del insumo"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Cantidad"
              type="number"
              min="0"
              value={form.cantidad}
              onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
              required
            />
            <select
              className="border p-2 rounded"
              value={form.id_proveedor}
              onChange={e => setForm(f => ({ ...f, id_proveedor: e.target.value }))}
              required
            >
              <option value="">Selecciona proveedor</option>
              {proveedores.map(p => (
                <option key={p.id_provider} value={p.id_provider}>{p.nombre}</option>
              ))}
            </select>
          </div>
          {formError && <div className="text-red-600 mt-2">{formError}</div>}
          <div className="mt-4 flex justify-end">
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
              type="submit"
              disabled={formLoading}
            >
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
                <th className={tableHeadCellClass()}>Nombre</th>
                <th className={tableHeadCellClass()}>Cantidad</th>
                <th className={tableHeadCellClass()}>ID Proveedor</th>
                <th className={tableHeadCellClass()}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay insumos registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_insumo} className={rowHoverClass()}>
                    <td className="px-4 py-3.5">{row.id_insumo}</td>
                    <td className="px-4 py-3.5">{row.nombre}</td>
                    <td className="px-4 py-3.5">{row.cantidad}</td>
                    <td className="px-4 py-3.5">{proveedores.find(p => p.id_provider === row.id_proveedor)?.nombre || row.id_proveedor || '—'}</td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_insumo)}>Borrar</button>
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
