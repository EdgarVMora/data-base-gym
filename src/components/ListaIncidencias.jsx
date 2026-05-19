import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDateTime } from '../utils/format'
import {
  collectFormErrors,
  isoToLocalDateTimeInput,
  isFutureDateTimeLocal,
  isValidDateTimeLocal,
  localDateTimeToISO,
  nowLocalDateTimeInputMax,
} from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, FormFieldErrors, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

const FORM_INICIAL = {
  id_tipo_incidencia: '',
  id_equipo: '',
  id_area: '',
  id_persona_afectada: '',
  descripcion: '',
  fecha: '',
}

function nombrePersona(p) {
  if (!p) return ''
  return `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
}

function CatalogInput({ label, value, onChange, listId, options, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2"
        required={required}
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map(opt => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>
      <p className="text-xs text-slate-500 mt-1">Escribe para buscar o elige una sugerencia de la lista.</p>
    </div>
  )
}

export default function ListaIncidencias() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [editId, setEditId] = useState(null)
  const [tipos, setTipos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [areas, setAreas] = useState([])
  const [personas, setPersonas] = useState([])

  const [tipoTexto, setTipoTexto] = useState('')
  const [equipoTexto, setEquipoTexto] = useState('')
  const [areaTexto, setAreaTexto] = useState('')
  const [personaTexto, setPersonaTexto] = useState('')

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const [{ data: incs, error: err }, { data: tipos }, { data: equipos }, { data: areas }, { data: personas }] = await Promise.all([
      supabase.from('incidencias').select('*').order('fecha', { ascending: false }),
      supabase.from('tipo_incidencia').select('id_tipo_incidencia, descripcion'),
      supabase.from('equipos').select('id_equipo, nombre'),
      supabase.from('areas').select('id_area, nombre_area'),
      supabase.from('personas').select('id_persona, nombre, apellido_paterno, apellido_materno'),
    ])
    if (err) setError('Error al cargar incidencias')
    setRows(incs ?? [])
    setTipos(tipos ?? [])
    setEquipos(equipos ?? [])
    setAreas(areas ?? [])
    setPersonas(personas ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  function resolverCatalogo(texto, opciones, campoId) {
    const t = texto.trim().toLowerCase()
    if (!t) return ''
    const match = opciones.find(o => o.label.toLowerCase() === t)
    return match ? String(match[campoId]) : ''
  }

  function syncCatalogosDesdeTexto() {
    return {
      id_tipo_incidencia: resolverCatalogo(tipoTexto, tipos.map(t => ({ label: t.descripcion, id_tipo_incidencia: t.id_tipo_incidencia })), 'id_tipo_incidencia'),
      id_equipo: resolverCatalogo(equipoTexto, equipos.map(e => ({ label: e.nombre, id_equipo: e.id_equipo })), 'id_equipo'),
      id_area: resolverCatalogo(areaTexto, areas.map(a => ({ label: a.nombre_area, id_area: a.id_area })), 'id_area'),
      id_persona_afectada: resolverCatalogo(
        personaTexto,
        personas.map(p => ({ label: nombrePersona(p), id_persona: p.id_persona })),
        'id_persona'
      ),
    }
  }

  function resetFormulario() {
    setForm(FORM_INICIAL)
    setTipoTexto('')
    setEquipoTexto('')
    setAreaTexto('')
    setPersonaTexto('')
    setEditId(null)
    setFormError(null)
  }

  function handleAdd() {
    resetFormulario()
    setForm(f => ({ ...f, fecha: nowLocalDateTimeInputMax() }))
    setShowForm(true)
  }

  function handleEdit(row) {
    const tipo = tipos.find(t => t.id_tipo_incidencia === row.id_tipo_incidencia)
    const equipo = equipos.find(e => e.id_equipo === row.id_equipo)
    const area = areas.find(a => a.id_area === row.id_area)
    const persona = personas.find(p => p.id_persona === row.id_persona_afectada)

    setForm({
      id_tipo_incidencia: row.id_tipo_incidencia ?? '',
      id_equipo: row.id_equipo ?? '',
      id_area: row.id_area ?? '',
      id_persona_afectada: row.id_persona_afectada ?? '',
      descripcion: row.descripcion ?? '',
      fecha: isoToLocalDateTimeInput(row.fecha),
    })
    setTipoTexto(tipo?.descripcion ?? '')
    setEquipoTexto(equipo?.nombre ?? '')
    setAreaTexto(area?.nombre_area ?? '')
    setPersonaTexto(persona ? nombrePersona(persona) : '')
    setEditId(row.id_incidencia)
    setFormError(null)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar esta incidencia?')) return
    const { error: err } = await supabase.from('incidencias').delete().eq('id_incidencia', id)
    if (err) setError('Error al borrar incidencia')
    else fetchAll()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    const ids = syncCatalogosDesdeTexto()
    const errors = collectFormErrors([
      !tipoTexto.trim() ? 'Escribe el tipo de incidencia.' : null,
      tipoTexto.trim() && !ids.id_tipo_incidencia ? `Tipo "${tipoTexto.trim()}" no existe. Elige uno de la lista de sugerencias.` : null,
      equipoTexto.trim() && !ids.id_equipo ? `Equipo "${equipoTexto.trim()}" no existe. Déjalo vacío o elige de la lista.` : null,
      areaTexto.trim() && !ids.id_area ? `Área "${areaTexto.trim()}" no existe. Déjala vacía o elige de la lista.` : null,
      personaTexto.trim() && !ids.id_persona_afectada
        ? `Persona "${personaTexto.trim()}" no está registrada. Déjalo vacío o elige de la lista.`
        : null,
      !form.fecha ? 'Captura la fecha y hora.' : null,
      form.fecha && !isValidDateTimeLocal(form.fecha) ? 'Fecha y hora con formato inválido (usa el selector o AAAA-MM-DDTHH:MM).' : null,
      form.fecha && isFutureDateTimeLocal(form.fecha) ? 'La fecha y hora no pueden ser futuras.' : null,
      !form.descripcion?.trim() ? 'Captura la descripción.' : null,
    ])

    if (errors.length) {
      setFormError(errors)
      return
    }

    const payload = {
      id_tipo_incidencia: Number(ids.id_tipo_incidencia),
      id_equipo: ids.id_equipo || null,
      id_area: ids.id_area ? Number(ids.id_area) : null,
      id_persona_afectada: ids.id_persona_afectada || null,
      descripcion: form.descripcion.trim(),
      fecha: localDateTimeToISO(form.fecha),
    }

    let hadError = false
    if (editId) {
      const { error: err } = await supabase.from('incidencias').update(payload).eq('id_incidencia', editId)
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    } else {
      const { error: err } = await supabase.from('incidencias').insert([payload])
      if (err) {
        setFormError([err.message])
        hadError = true
      }
    }

    if (!hadError) {
      setShowForm(false)
      resetFormulario()
      fetchAll()
    }
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Incidencias"
        subtitle="Reportes de tipo, equipo, área y persona afectada. Escribe el nombre en cada campo (con sugerencias)."
        table="incidencias → tipo_incidencia, equipos, areas, personas"
      />

      <div className="mb-4 flex gap-2">
        <button type="button" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded" onClick={handleAdd}>
          Nueva incidencia
        </button>
      </div>

      {showForm && (
        <form className="mb-6 space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow" onSubmit={handleSubmit}>
          <CatalogInput
            label="Tipo de incidencia *"
            listId="tipos-incidencia"
            value={tipoTexto}
            onChange={e => setTipoTexto(e.target.value)}
            placeholder="Ej. Daño en equipo"
            required
            options={tipos.map(t => ({ value: t.id_tipo_incidencia, label: t.descripcion }))}
          />
          <CatalogInput
            label="Equipo (opcional)"
            listId="equipos-incidencia"
            value={equipoTexto}
            onChange={e => setEquipoTexto(e.target.value)}
            placeholder="Ej. Caminadora 3"
            options={equipos.map(e => ({ value: e.id_equipo, label: e.nombre }))}
          />
          <CatalogInput
            label="Área (opcional)"
            listId="areas-incidencia"
            value={areaTexto}
            onChange={e => setAreaTexto(e.target.value)}
            placeholder="Ej. Cardio"
            options={areas.map(a => ({ value: a.id_area, label: a.nombre_area }))}
          />
          <CatalogInput
            label="Persona afectada (opcional)"
            listId="personas-incidencia"
            value={personaTexto}
            onChange={e => setPersonaTexto(e.target.value)}
            placeholder="Ej. Juan Pérez"
            options={personas.map(p => ({ value: p.id_persona, label: nombrePersona(p) }))}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Fecha y hora *</label>
            <input
              type="datetime-local"
              name="fecha"
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              required
              max={nowLocalDateTimeInputMax()}
            />
            <p className="text-xs text-slate-500 mt-1">Hora local de México. No se permiten fechas futuras.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              required
              rows={3}
              placeholder="Qué ocurrió y en qué circunstancias"
            />
          </div>
          <FormFieldErrors error={formError} />
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded">
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded"
              onClick={() => { setShowForm(false); resetFormulario() }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingMessage /> : null}
      {error && !showForm ? <ErrorNotice message={error} /> : null}
      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Fecha</th>
                <th className={tableHeadCellClass()}>Tipo</th>
                <th className={tableHeadCellClass()}>Equipo</th>
                <th className={tableHeadCellClass()}>Área</th>
                <th className={tableHeadCellClass()}>Persona</th>
                <th className={tableHeadCellClass()}>Descripción</th>
                <th className={tableHeadCellClass()}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay incidencias registradas.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const persona = personas.find(p => p.id_persona === row.id_persona_afectada)
                  const tipo = tipos.find(t => t.id_tipo_incidencia === row.id_tipo_incidencia)
                  const equipo = equipos.find(e => e.id_equipo === row.id_equipo)
                  const area = areas.find(a => a.id_area === row.id_area)
                  return (
                    <tr key={row.id_incidencia} className={rowHoverClass()}>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDateTime(row.fecha)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">{tipo?.descripcion ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{equipo?.nombre ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{area?.nombre_area ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {persona ? nombrePersona(persona) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs">{row.descripcion ?? '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button type="button" className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                        <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_incidencia)}>Borrar</button>
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
