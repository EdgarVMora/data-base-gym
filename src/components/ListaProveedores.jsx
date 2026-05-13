import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'


export default function ListaProveedores() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', tipo_provider: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)

  async function loadProveedores() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('proveedor')
      .select('*')
      .order('id_provider', { ascending: false })
    setRows(data ?? [])
    setLoading(false)
    if (err) setError(err.message)
  }

  useEffect(() => {
    loadProveedores()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    if (!form.nombre || !form.tipo_provider) {
      setFormError('Todos los campos son obligatorios')
      setFormLoading(false)
      return
    }
    let res
    if (editId) {
      res = await supabase.from('proveedor').update({
        nombre: form.nombre,
        tipo_provider: form.tipo_provider
      }).eq('id_provider', editId)
    } else {
      res = await supabase.from('proveedor').insert({
        nombre: form.nombre,
        tipo_provider: form.tipo_provider
      })
    }
    if (res.error) {
      setFormError(res.error.message)
    } else {
      setShowForm(false)
      setForm({ nombre: '', tipo_provider: '' })
      setEditId(null)
      await loadProveedores()
    }
    setFormLoading(false)
  }

  async function handleEdit(row) {
    setForm({ nombre: row.nombre, tipo_provider: row.tipo_provider })
    setEditId(row.id_provider)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este proveedor?')) return
    await supabase.from('proveedor').delete().eq('id_provider', id)
    await loadProveedores()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Proveedores"
        subtitle="Empresas o terceros que suministran equipos o insumos."
        table="proveedor"
      />

      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => { setShowForm(f => !f); setEditId(null); setForm({ nombre: '', tipo_provider: '' }) }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo proveedor'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Nombre del proveedor"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Tipo de proveedor"
              value={form.tipo_provider}
              onChange={e => setForm(f => ({ ...f, tipo_provider: e.target.value }))}
              required
            />
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
                <th className={tableHeadCellClass()}>Tipo</th>
                <th className={tableHeadCellClass()}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay proveedores registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_provider} className={rowHoverClass()}>
                    <td className="px-4 py-3.5">{row.id_provider}</td>
                    <td className="px-4 py-3.5">{row.nombre}</td>
                    <td className="px-4 py-3.5">{row.tipo_provider}</td>
                    <td className="px-4 py-3.5 flex gap-2">
                      <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_provider)}>Borrar</button>
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
