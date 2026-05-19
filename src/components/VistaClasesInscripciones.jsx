import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate } from '../utils/format'
import { collectFormErrors, nowLocalDateInputMax } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, FormFieldErrors, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

const FORM_INSCRIPCION_INICIAL = {
  id_cliente: '',
  id_clase: '',
  fecha_inscripcion: ''
}

function nombrePersona(p) {
  if (!p) return '—'
  return `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
}

const tabBtn = active =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    active
      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40'
      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
  }`

function ListaClasesTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('clases')
        .select(`
          id_clase,
          nombre_clase,
          duracion,
          nivel,
          empleados (
            personas ( nombre, apellido_paterno )
          )
        `)
        .order('nombre_clase', { ascending: true })

      if (err) {
        console.error('[Auditor] clases:', err.message, err.code)
        setError(err.message)
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingMessage>Cargando clases…</LoadingMessage>
  if (error) return <ErrorNotice message={error} />

  return (
    <TableWrap>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className={tableHeadCellClass()}>Clase</th>
            <th className={tableHeadCellClass()}>Duración</th>
            <th className={tableHeadCellClass()}>Nivel</th>
            <th className={tableHeadCellClass()}>Instructor</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                No hay clases registradas.
              </td>
            </tr>
          ) : (
            rows.map(row => {
              const p = row.empleados?.personas
              const instructor = p ? `${p.nombre} ${p.apellido_paterno}` : '—'
              const dur =
                row.duracion == null
                  ? '—'
                  : typeof row.duracion === 'string'
                    ? row.duracion
                    : String(row.duracion)
              return (
                <tr key={row.id_clase} className={rowHoverClass()}>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {row.nombre_clase}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {dur}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{row.nivel ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">{instructor}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </TableWrap>
  )
}

function ListaInscripcionesTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INSCRIPCION_INICIAL)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)
  const [clientes, setClientes] = useState([])
  const [clases, setClases] = useState([])

  async function loadAll() {
    setLoading(true)
    setError(null)
    const [{ data, error: err }, { data: clientesData }, { data: clasesData }] = await Promise.all([
      supabase
        .from('inscripciones')
        .select(`
          id_inscripcion,
          id_cliente,
          id_clase,
          fecha_inscripcion,
          clientes (
            personas ( nombre, apellido_paterno, apellido_materno )
          ),
          clases ( nombre_clase, nivel )
        `)
        .order('fecha_inscripcion', { ascending: false }),
      supabase
        .from('clientes')
        .select('id_cliente, personas ( nombre, apellido_paterno, apellido_materno )')
        .order('id_cliente', { ascending: true }),
      supabase
        .from('clases')
        .select('id_clase, nombre_clase, nivel')
        .order('nombre_clase', { ascending: true })
    ])

    if (err) {
      console.error('[Auditor] inscripciones:', err.message, err.code)
      setError(err.message)
    } else {
      setRows(data ?? [])
    }
    setClientes(clientesData ?? [])
    setClases(clasesData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    const errors = collectFormErrors([
      !form.id_cliente ? 'Selecciona un cliente.' : null,
      !form.id_clase ? 'Selecciona una clase.' : null,
      !form.fecha_inscripcion ? 'Selecciona la fecha de inscripción.' : null,
      form.fecha_inscripcion && form.fecha_inscripcion > nowLocalDateInputMax()
        ? 'La fecha de inscripción no puede ser futura.'
        : null,
    ])

    if (errors.length) {
      setFormError(errors)
      setFormLoading(false)
      return
    }

    const payload = {
      id_cliente: form.id_cliente,
      id_clase: form.id_clase,
      fecha_inscripcion: form.fecha_inscripcion
    }

    let hadError = false
    if (editId) {
      const { error: err } = await supabase.from('inscripciones').update(payload).eq('id_inscripcion', editId)
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    } else {
      const { error: err } = await supabase.from('inscripciones').insert(payload)
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    }

    if (!hadError) {
      setShowForm(false)
      setForm(FORM_INSCRIPCION_INICIAL)
      setEditId(null)
      await loadAll()
    }
    setFormLoading(false)
  }

  function handleEdit(row) {
    setEditId(row.id_inscripcion)
    setShowForm(true)
    setFormError(null)
    setForm({
      id_cliente: row.id_cliente || '',
      id_clase: row.id_clase || '',
      fecha_inscripcion: row.fecha_inscripcion ? String(row.fecha_inscripcion).slice(0, 10) : ''
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas cancelar esta inscripción?')) return
    const { error: err } = await supabase.from('inscripciones').delete().eq('id_inscripcion', id)
    if (err) {
      setError(err.message)
      return
    }
    await loadAll()
  }

  function resetForm() {
    setShowForm(f => !f)
    setEditId(null)
    setFormError(null)
    setForm(FORM_INSCRIPCION_INICIAL)
  }

  if (loading) return <LoadingMessage>Cargando inscripciones…</LoadingMessage>
  if (error && !showForm) return <ErrorNotice message={error} />

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={resetForm}
        >
          {showForm ? 'Cancelar' : 'Inscribir cliente a clase'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <select
                name="id_cliente"
                value={form.id_cliente}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-2"
                required
              >
                <option value="">Selecciona cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {nombrePersona(c.personas)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Clase</label>
              <select
                name="id_clase"
                value={form.id_clase}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-2"
                required
              >
                <option value="">Selecciona clase</option>
                {clases.map(c => (
                  <option key={c.id_clase} value={c.id_clase}>
                    {c.nombre_clase}{c.nivel ? ` (${c.nivel})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de inscripción</label>
              <input
                type="date"
                name="fecha_inscripcion"
                value={form.fecha_inscripcion}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-2"
                required
                max={nowLocalDateInputMax()}
              />
            </div>
          </div>
          <FormFieldErrors error={formError} />
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
              disabled={formLoading}
            >
              {formLoading ? (editId ? 'Actualizando...' : 'Registrando...') : (editId ? 'Actualizar inscripción' : 'Registrar inscripción')}
            </button>
          </div>
        </form>
      )}

      {error && showForm ? <ErrorNotice message={error} /> : null}

      <TableWrap>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className={tableHeadCellClass()}>Cliente</th>
              <th className={tableHeadCellClass()}>Clase</th>
              <th className={tableHeadCellClass()}>Nivel</th>
              <th className={tableHeadCellClass()}>Fecha inscripción</th>
              <th className={tableHeadCellClass()}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No hay inscripciones. Usa el botón para inscribir un cliente a una clase.
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row.id_inscripcion} className={rowHoverClass()}>
                  <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                    {nombrePersona(row.clientes?.personas)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                    {row.clases?.nombre_clase ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {row.clases?.nivel ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                    {formatDate(row.fecha_inscripcion)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button type="button" className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_inscripcion)}>Borrar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  )
}

export default function VistaClasesInscripciones() {
  const [tab, setTab] = useState('clases')

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Clases e inscripciones"
        subtitle="Oferta de sesiones impartidas por empleados y matrícula de clientes."
        table="clases, inscripciones"
      />

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Vista clases o inscripciones">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'clases'}
          className={tabBtn(tab === 'clases')}
          onClick={() => setTab('clases')}
        >
          Clases
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'inscripciones'}
          className={tabBtn(tab === 'inscripciones')}
          onClick={() => setTab('inscripciones')}
        >
          Inscripciones
        </button>
      </div>

      {tab === 'clases' ? <ListaClasesTab /> : <ListaInscripcionesTab />}
    </section>
  )
}
