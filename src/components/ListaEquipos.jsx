import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'
import { nowLocalDateInputMax } from '../utils/validation'

export default function ListaEquipos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    id_proveedor: '',
    id_area: '',
    estado: '',
    fecha_compra: ''
  })
  const [proveedores, setProveedores] = useState([])
  const [areas, setAreas] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)

  async function loadAll() {
    setLoading(true)
    const [{ data: equipos, error: err }, { data: provs }, { data: ars }] = await Promise.all([
      supabase.from('equipos').select('*').order('id_equipo', { ascending: false }),
      supabase.from('proveedor').select('id_provider, nombre'),
      supabase.from('areas').select('id_area, nombre_area')
    ])
    if (err) setError(err.message)
    setRows(equipos ?? [])
    setProveedores(provs ?? [])
    setAreas(ars ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function hoyISO() {
    return nowLocalDateInputMax()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    if (!form.nombre || !form.id_proveedor || !form.id_area || !form.estado || !form.fecha_compra) {
      setFormError('Completa todos los campos')
      setFormLoading(false)
      return
    }
    if (form.fecha_compra > hoyISO()) {
      setFormError('La fecha de compra no puede ser futura')
      setFormLoading(false)
      return
    }
    if (editId) {
      const { error } = await supabase.from('equipos').update({ ...form }).eq('id_equipo', editId)
      if (error) setFormError(error.message)
    } else {
      const { error } = await supabase.from('equipos').insert({ ...form })
      if (error) setFormError(error.message)
    }
    setShowForm(false)
    setForm({ nombre: '', id_proveedor: '', id_area: '', estado: '', fecha_compra: '' })
    setEditId(null)
    await loadAll()
    setFormLoading(false)
  }

  function handleEdit(row) {
    setEditId(row.id_equipo)
    setShowForm(true)
    setForm({
      nombre: row.nombre || '',
      id_proveedor: row.id_proveedor || '',
      id_area: row.id_area || '',
      estado: row.estado || '',
      fecha_compra: row.fecha_compra ? row.fecha_compra.slice(0, 10) : ''
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este equipo?')) return
    await supabase.from('equipos').delete().eq('id_equipo', id)
    await loadAll()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Equipos"
        subtitle="Maquinaria y equipo del gimnasio, vinculados a áreas y proveedores."
        table="equipos"
      />
      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => { setShowForm(f => !f); setEditId(null); setForm({ nombre: '', id_proveedor: '', id_area: '', estado: '', fecha_compra: '' }) }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo equipo'}
        </button>
      </div>
      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border p-2 rounded" name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="Nombre del equipo" required />
            <select className="border p-2 rounded" name="id_proveedor" value={form.id_proveedor} onChange={handleFormChange} required>
              <option value="">Proveedor</option>
              {proveedores.map(p => <option key={p.id_provider} value={p.id_provider}>{p.nombre}</option>)}
            </select>
            <select className="border p-2 rounded" name="id_area" value={form.id_area} onChange={handleFormChange} required>
              <option value="">Área</option>
              {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>)}
            </select>
            <input className="border p-2 rounded" name="estado" value={form.estado} onChange={handleFormChange} placeholder="Estado" required />
            <input className="border p-2 rounded" name="fecha_compra" type="date" value={form.fecha_compra} onChange={handleFormChange} required max={hoyISO()} />
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
                <th className={tableHeadCellClass()}>Nombre</th>
                <th className={tableHeadCellClass()}>Proveedor</th>
                <th className={tableHeadCellClass()}>Área</th>
                <th className={tableHeadCellClass()}>Estado</th>
                <th className={tableHeadCellClass()}>Fecha compra</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay equipos registrados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id_equipo} className={rowHoverClass()}>
                    <td className="px-4 py-3.5">{row.id_equipo}</td>
                    <td className="px-4 py-3.5">{row.nombre}</td>
                    <td className="px-4 py-3.5">{proveedores.find(p => p.id_provider === row.id_proveedor)?.nombre ?? row.id_proveedor ?? '—'}</td>
                    <td className="px-4 py-3.5">{areas.find(a => a.id_area === row.id_area)?.nombre_area ?? row.id_area ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.estado}</td>
                    <td className="px-4 py-3.5">{row.fecha_compra ? row.fecha_compra.slice(0, 10) : '—'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_equipo)}>Borrar</button>
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
