
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDateTime } from '../utils/format'
import { collectFormErrors, isProperCaseWords, nowLocalDateTimeInputMax } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaIncidencias() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    id_tipo_incidencia: '',
    id_equipo: '',
    id_area: '',
    id_persona_afectada: '',
    nombre_afectado: '',
    apellido_paterno_afectado: '',
    apellido_materno_afectado: '',
    descripcion: '',
    fecha: ''
  })
  const [nameCaseError, setNameCaseError] = useState({
    nombre_afectado: false,
    apellido_paterno_afectado: false,
    apellido_materno_afectado: false,
  });
  const [nameCaseErrorMsg, setNameCaseErrorMsg] = useState("");
  const [editId, setEditId] = useState(null)
  const [tipos, setTipos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [areas, setAreas] = useState([])
  const [personas, setPersonas] = useState([])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const [{ data: incs, error: err }, { data: tipos }, { data: equipos }, { data: areas }, { data: personas }] = await Promise.all([
      supabase.from('incidencias').select('*').order('fecha', { ascending: false }),
      supabase.from('tipo_incidencia').select('id_tipo_incidencia, descripcion'),
      supabase.from('equipos').select('id_equipo, nombre'),
      supabase.from('areas').select('id_area, nombre_area'),
      supabase.from('personas').select('id_persona, nombre, apellido_paterno')
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

  // Valida que el texto tenga solo la primera letra en mayúscula y el resto en minúscula
  const isProperCase = (str) => {
    if (!str) return true;
    return str.split(" ").every(
      (word) =>
        word.length > 0 &&
        word[0] === word[0].toUpperCase() &&
        word.slice(1) === word.slice(1).toLowerCase()
    );
  };

  function handleInput(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (["nombre_afectado", "apellido_paterno_afectado", "apellido_materno_afectado"].includes(name)) {
      const valid = isProperCase(value);
      setNameCaseError(prev => ({ ...prev, [name]: !valid }));
    }
  }

  function handleAdd() {
    setForm({ id_tipo_incidencia: '', id_equipo: '', id_area: '', id_persona_afectada: '', descripcion: '', fecha: '' })
    setEditId(null)
    setShowForm(true)
  }

  function handleEdit(row) {
    setForm({
      id_tipo_incidencia: row.id_tipo_incidencia || '',
      id_equipo: row.id_equipo || '',
      id_area: row.id_area || '',
      id_persona_afectada: row.id_persona_afectada || '',
      descripcion: row.descripcion || '',
      fecha: row.fecha ? row.fecha.slice(0, 16) : ''
    })
    setEditId(row.id_incidencia)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar esta incidencia?')) return
    const { error } = await supabase.from('incidencias').delete().eq('id_incidencia', id)
    if (error) {
      setError('Error al borrar incidencia')
    } else {
      fetchAll()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    // Validación de mayúsculas/minúsculas en nombre y apellidos de persona afectada
    const nombreOk = isProperCaseWords(form.nombre_afectado);
    const paternoOk = isProperCaseWords(form.apellido_paterno_afectado);
    const maternoOk = isProperCaseWords(form.apellido_materno_afectado);
    setNameCaseError({
      nombre_afectado: !nombreOk,
      apellido_paterno_afectado: !paternoOk,
      apellido_materno_afectado: !maternoOk,
    });
    const errors = collectFormErrors([
      !form.id_tipo_incidencia ? 'Selecciona el tipo de incidencia.' : null,
      !form.fecha ? 'Selecciona la fecha y hora.' : null,
      form.fecha && form.fecha > nowLocalDateTimeInputMax() ? 'La fecha y hora no pueden ser futuras.' : null,
      !form.descripcion ? 'Captura la descripción.' : null,
      (!nombreOk || !paternoOk || !maternoOk)
        ? 'Nombre y/o apellidos mal escritos: usa solo la primera letra en mayúscula y el resto en minúscula (por palabra).'
        : null,
    ])

    if (errors.length) {
      setNameCaseErrorMsg('Revisa los campos marcados y la lista de errores.')
      setFormError(errors)
      return
    }

    setNameCaseErrorMsg("");
    if (editId) {
      const { error } = await supabase.from('incidencias').update(form).eq('id_incidencia', editId);
      if (error) setFormError(['Error al actualizar incidencia']);
    } else {
      const { error } = await supabase.from('incidencias').insert([form]);
      if (error) setFormError(['Error al agregar incidencia']);
    }
    setShowForm(false);
    fetchAll();
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Incidencias"
        subtitle="Reportes vinculados a tipo, equipo, área y persona afectada."
        table="incidencias → tipo_incidencia, equipos, areas, personas"
      />

      <div className="mb-4 flex gap-2">
        <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded" onClick={handleAdd}>
          Nueva incidencia
        </button>
      </div>

      {showForm && (
        <form className="mb-6 space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow" onSubmit={handleSubmit}>
          {nameCaseErrorMsg && (
            <div className="text-red-600 font-semibold text-sm mb-2">
              {nameCaseErrorMsg}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo incidencia</label>
            <select name="id_tipo_incidencia" value={form.id_tipo_incidencia} onChange={handleInput} className="w-full rounded border px-3 py-2" required>
              <option value="">Selecciona tipo</option>
              {tipos.map(t => (
                <option key={t.id_tipo_incidencia} value={t.id_tipo_incidencia}>{t.descripcion}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Equipo</label>
            <select name="id_equipo" value={form.id_equipo} onChange={handleInput} className="w-full rounded border px-3 py-2">
              <option value="">Sin equipo</option>
              {equipos.map(e => (
                <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Área</label>
            <select name="id_area" value={form.id_area} onChange={handleInput} className="w-full rounded border px-3 py-2">
              <option value="">Sin área</option>
              {areas.map(a => (
                <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Persona afectada (si aplica)</label>
            <select name="id_persona_afectada" value={form.id_persona_afectada} onChange={handleInput} className="w-full rounded border px-3 py-2">
              <option value="">Sin persona</option>
              {personas.map(p => (
                <option key={p.id_persona} value={p.id_persona}>{p.nombre} {p.apellido_paterno}</option>
              ))}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              <input
                className={`border p-2 rounded ${nameCaseError.nombre_afectado ? "border-red-500" : ""}`}
                placeholder="Nombre(s) de la persona"
                name="nombre_afectado"
                value={form.nombre_afectado}
                onChange={handleInput}
              />
              {nameCaseError.nombre_afectado && (
                <span className="text-xs text-red-500">Nombre mal escrito</span>
              )}
              <input
                className={`border p-2 rounded ${nameCaseError.apellido_paterno_afectado ? "border-red-500" : ""}`}
                placeholder="Apellido paterno"
                name="apellido_paterno_afectado"
                value={form.apellido_paterno_afectado}
                onChange={handleInput}
              />
              {nameCaseError.apellido_paterno_afectado && (
                <span className="text-xs text-red-500">Apellido paterno mal escrito</span>
              )}
              <input
                className={`border p-2 rounded ${nameCaseError.apellido_materno_afectado ? "border-red-500" : ""}`}
                placeholder="Apellido materno"
                name="apellido_materno_afectado"
                value={form.apellido_materno_afectado}
                onChange={handleInput}
              />
              {nameCaseError.apellido_materno_afectado && (
                <span className="text-xs text-red-500">Apellido materno mal escrito</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha y hora</label>
            <input type="datetime-local" name="fecha" value={form.fecha} onChange={handleInput} className="w-full rounded border px-3 py-2" required max={nowLocalDateTimeInputMax()} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleInput} className="w-full rounded border px-3 py-2" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded">
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            <button type="button" className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
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
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                        {tipo?.descripcion ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {equipo?.nombre ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {area?.nombre_area ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {persona ? `${persona.nombre} ${persona.apellido_paterno}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs">
                        {row.descripcion ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="text-amber-700 hover:underline mr-2" onClick={() => handleEdit(row)}>Editar</button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_incidencia)}>Borrar</button>
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
