import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate, formatMoney } from '../utils/format'
import { collectFormErrors, isProperCaseWords, nowLocalDateInputMax } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'


export default function ListaEmpleados() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido_paterno: '', apellido_materno: '', correo_electronico: '', telefono: '',
    id_puesto: '', id_tipo_contrato: '', salario_actual: '', fecha_contratacion: ''
  })
  const [nameCaseError, setNameCaseError] = useState({
    nombre: false,
    apellido_paterno: false,
    apellido_materno: false,
  });
  const [nameCaseErrorMsg, setNameCaseErrorMsg] = useState("");
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [contratos, setContratos] = useState([])
  const [editId, setEditId] = useState(null)

  function hoyISO() {
    return nowLocalDateInputMax()
  }

  async function loadEmpleados() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('empleados')
      .select(`
        id_empleado,
        salario_actual,
        fecha_contratacion,
        id_puesto,
        id_tipo_contrato,
        puesto ( nombre_puesto ),
        tipo_contrato ( descripcion ),
        personas (
          nombre,
          apellido_paterno,
          apellido_materno,
          medios_contacto ( telefono, correo_electronico )
        )
      `)
      .order('fecha_contratacion', { ascending: false })
    setRows(data ?? [])
    setLoading(false)
    if (err) setError(err.message)
  }

  async function loadCatalogos() {
    const { data: puestosData } = await supabase.from('puesto').select('*').order('nombre_puesto', { ascending: true })
    setPuestos(puestosData ?? [])
    const { data: contratosData } = await supabase.from('tipo_contrato').select('*').order('descripcion', { ascending: true })
    setContratos(contratosData ?? [])
  }

  useEffect(() => {
    loadEmpleados()
    loadCatalogos()
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
    if (["nombre", "apellido_paterno", "apellido_materno"].includes(name)) {
      const valid = isProperCase(value);
      setNameCaseError(prev => ({ ...prev, [name]: !valid }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Validación de mayúsculas/minúsculas en nombre y apellidos
    const nombreOk = isProperCaseWords(form.nombre);
    const paternoOk = isProperCaseWords(form.apellido_paterno);
    const maternoOk = isProperCaseWords(form.apellido_materno);
    setNameCaseError({
      nombre: !nombreOk,
      apellido_paterno: !paternoOk,
      apellido_materno: !maternoOk,
    });
    const errors = collectFormErrors([
      !form.nombre ? 'Captura el nombre.' : null,
      !form.apellido_paterno ? 'Captura el apellido paterno.' : null,
      !form.id_puesto ? 'Selecciona el puesto.' : null,
      !form.id_tipo_contrato ? 'Selecciona el tipo de contrato.' : null,
      !form.salario_actual ? 'Captura el salario actual.' : null,
      !form.fecha_contratacion ? 'Selecciona la fecha de contratación.' : null,
      form.fecha_contratacion && form.fecha_contratacion > hoyISO()
        ? 'La fecha de contratación no puede ser futura.'
        : null,
      (!nombreOk || !paternoOk || !maternoOk)
        ? 'Nombre y/o apellidos mal escritos: usa solo la primera letra en mayúscula y el resto en minúscula (por palabra).'
        : null,
    ])
    if (errors.length) {
      setNameCaseErrorMsg('Revisa los campos marcados y la lista de errores.')
      setFormError(errors)
      setFormLoading(false)
      return
    }
    setNameCaseErrorMsg("");

    let personaId = null;
    if (editId) {
      // Actualizar persona
      const { data: emp } = await supabase.from('empleados').select('id_empleado, personas ( id_persona )').eq('id_empleado', editId).single();
      personaId = emp?.personas?.id_persona;
      if (personaId) {
        await supabase.from('personas').update({
          nombre: form.nombre,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno
        }).eq('id_persona', personaId);
        await supabase.from('medios_contacto').update({
          correo_electronico: form.correo_electronico,
          telefono: form.telefono
        }).eq('id_persona', personaId);
      }
      // Actualizar empleado
      await supabase.from('empleados').update({
        id_puesto: form.id_puesto,
        id_tipo_contrato: form.id_tipo_contrato,
        salario_actual: form.salario_actual,
        fecha_contratacion: form.fecha_contratacion
      }).eq('id_empleado', editId);
    } else {
      // Insertar persona
      const { data: persona, error: errPersona } = await supabase.from('personas').insert({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno
      }).select().single();
      if (errPersona) {
        setFormError('Error al registrar persona: ' + errPersona.message);
        setFormLoading(false);
        return;
      }
      personaId = persona.id_persona;
      // Insertar empleado
      const { error: errEmp } = await supabase.from('empleados').insert({
        id_empleado: personaId,
        id_puesto: form.id_puesto,
        id_tipo_contrato: form.id_tipo_contrato,
        salario_actual: form.salario_actual,
        fecha_contratacion: form.fecha_contratacion
      });
      if (errEmp) {
        setFormError('Error al registrar empleado: ' + errEmp.message);
        setFormLoading(false);
        return;
      }
      // Insertar medios_contacto
      if (form.correo_electronico || form.telefono) {
        await supabase.from('medios_contacto').insert({
          id_persona: personaId,
          correo_electronico: form.correo_electronico,
          telefono: form.telefono
        });
      }
    }
    setShowForm(false);
    setForm({ nombre: '', apellido_paterno: '', apellido_materno: '', correo_electronico: '', telefono: '', id_puesto: '', id_tipo_contrato: '', salario_actual: '', fecha_contratacion: '' });
    setEditId(null);
    await loadEmpleados();
    setFormLoading(false);
  }

  async function handleEdit(row) {
    const p = row.personas
    const c = p?.medios_contacto?.[0] || {}
    setForm({
      nombre: p?.nombre || '',
      apellido_paterno: p?.apellido_paterno || '',
      apellido_materno: p?.apellido_materno || '',
      correo_electronico: c.correo_electronico || '',
      telefono: c.telefono || '',
      id_puesto: row.id_puesto || '',
      id_tipo_contrato: row.id_tipo_contrato || '',
      salario_actual: row.salario_actual || '',
      fecha_contratacion: row.fecha_contratacion ? row.fecha_contratacion.substring(0, 10) : ''
    })
    setEditId(row.id_empleado)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas borrar este empleado?')) return
    await supabase.from('empleados').delete().eq('id_empleado', id)
    await loadEmpleados()
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Empleados"
        subtitle="Personal del gimnasio vinculado a puestos y tipos de contrato."
        table="empleados → personas, puesto, tipo_contrato, medios_contacto"
      />

      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => {
            setShowForm(f => !f)
            setEditId(null)
            setForm({ nombre: '', apellido_paterno: '', apellido_materno: '', correo_electronico: '', telefono: '', id_puesto: '', id_tipo_contrato: '', salario_actual: '', fecha_contratacion: '' })
          }}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo empleado'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          {nameCaseErrorMsg && (
            <div className="text-red-600 font-semibold text-sm mb-2">
              {nameCaseErrorMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className={`border p-2 rounded ${nameCaseError.nombre ? "border-red-500" : ""}`}
              placeholder="Nombre(s)"
              name="nombre"
              value={form.nombre}
              onChange={handleInput}
              required
            />
            {nameCaseError.nombre && (
              <span className="text-xs text-red-500">Nombre mal escrito</span>
            )}
            <input
              className={`border p-2 rounded ${nameCaseError.apellido_paterno ? "border-red-500" : ""}`}
              placeholder="Apellido paterno"
              name="apellido_paterno"
              value={form.apellido_paterno}
              onChange={handleInput}
              required
            />
            {nameCaseError.apellido_paterno && (
              <span className="text-xs text-red-500">Apellido paterno mal escrito</span>
            )}
            <input
              className={`border p-2 rounded ${nameCaseError.apellido_materno ? "border-red-500" : ""}`}
              placeholder="Apellido materno"
              name="apellido_materno"
              value={form.apellido_materno}
              onChange={handleInput}
            />
            {nameCaseError.apellido_materno && (
              <span className="text-xs text-red-500">Apellido materno mal escrito</span>
            )}
            <input
              className="border p-2 rounded"
              placeholder="Correo electrónico"
              name="correo_electronico"
              value={form.correo_electronico}
              onChange={handleInput}
              type="email"
            />
            <input
              className="border p-2 rounded"
              placeholder="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleInput}
              type="tel"
            />
            <select
              className="border p-2 rounded"
              value={form.id_puesto}
              onChange={e => setForm(f => ({ ...f, id_puesto: e.target.value }))}
              required
            >
              <option value="">Selecciona puesto</option>
              {puestos.map(p => (
                <option key={p.id_puesto} value={p.id_puesto}>{p.nombre_puesto}</option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              value={form.id_tipo_contrato}
              onChange={e => setForm(f => ({ ...f, id_tipo_contrato: e.target.value }))}
              required
            >
              <option value="">Selecciona tipo de contrato</option>
              {contratos.map(c => (
                <option key={c.id_tipo_contrato} value={c.id_tipo_contrato}>{c.descripcion}</option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Salario actual"
              name="salario_actual"
              value={form.salario_actual}
              onChange={handleInput}
              type="number"
              min="0"
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Fecha de contratación"
              name="fecha_contratacion"
              value={form.fecha_contratacion}
              onChange={handleInput}
              type="date"
              max={hoyISO()}
              required
            />
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
                <th className={tableHeadCellClass()}>Nombre</th>
                <th className={tableHeadCellClass()}>Puesto</th>
                <th className={tableHeadCellClass()}>Contrato</th>
                <th className={tableHeadCellClass()}>Salario</th>
                <th className={tableHeadCellClass()}>Contratación</th>
                <th className={tableHeadCellClass()}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay empleados en la base.
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const p = row.personas
                  const c = p?.medios_contacto?.[0]
                  const nombre = p
                    ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.trim()
                    : '—'
                  return (
                    <tr key={row.id_empleado} className={rowHoverClass()}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{nombre}</div>
                        <div className="text-xs text-slate-500">{c?.correo_electronico ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                        {row.puesto?.nombre_puesto ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {row.tipo_contrato?.descripcion ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums">
                        {formatMoney(row.salario_actual)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha_contratacion)}
                      </td>
                      <td className="px-4 py-3.5 flex gap-2">
                        <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Editar</button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(row.id_empleado)}>Borrar</button>
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
