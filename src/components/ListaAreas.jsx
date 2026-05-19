import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaAreas() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre_area: '',
    descripcion: ''
  })
  const [editId, setEditId] = useState(null)

  async function fetchAreas() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('areas').select('*').order('id_area', { ascending: true })
    if (error) setError('Error al cargar áreas')
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  function handleInput(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleAdd() {
    setForm({ nombre_area: '', descripcion: '' })
    setEditId(null)
    setShowForm(true)
  }

  function handleEdit(row) {
    setForm({ nombre_area: row.nombre_area, descripcion: row.descripcion })
    setEditId(row.id_area)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar esta área?')) return
    const { error } = await supabase.from('areas').delete().eq('id_area', id)
    if (error) {
      setError('Error al borrar área')
    } else {
      fetchAreas()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.nombre_area) {
      setError('El nombre es obligatorio')
      return
    }
    if (editId) {
      const { error } = await supabase.from('areas').update(form).eq('id_area', editId)
      if (error) setError('Error al actualizar área')
    } else {
      const { error } = await supabase.from('areas').insert([form])
      if (error) setError('Error al agregar área')
    }
    setShowForm(false)
    fetchAreas()
  }

  return (
    <section>
      <SectionIntro title="Áreas" description="Gestión de áreas físicas del gimnasio." />
      <div className="mb-4 flex gap-2">
        <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded" onClick={handleAdd}>
          Nueva área
        </button>
      </div>
      {showForm && (
        <form className="mb-6 space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre área</label>
            <input type="text" name="nombre_area" value={form.nombre_area} onChange={handleInput} className="w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleInput} className="w-full rounded border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded">
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            <button type="button" className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
          {error && <ErrorNotice message={error} />}
        </form>
      )}
      {loading ? <LoadingMessage /> : null}
      {error && !showForm ? <ErrorNotice message={error} /> : null}
      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>ID</th>
                <th className={tableHeadCellClass()}>Nombre</th>
                <th className={tableHeadCellClass()}>Descripción</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay áreas registradas.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_area} className={rowHoverClass()}>
                    <td className="px-4 py-3.5">{row.id_area}</td>
                    <td className="px-4 py-3.5">{row.nombre_area}</td>
                    <td className="px-4 py-3.5">{row.descripcion}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_area)}>Borrar</button>
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
