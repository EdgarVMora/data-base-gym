import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { formatDate } from '../utils/format'
import { collectFormErrors, isProperCaseWords } from '../utils/validation'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { rowHoverClass, tableHeadCellClass } from './ui/tableStyles'

export default function ListaClientes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    id_genero: '',
    telefono: '',
    correo_electronico: ''
  })
  const [nameCaseError, setNameCaseError] = useState({
    nombre: false,
    apellido_paterno: false,
    apellido_materno: false,
  });
  const [nameCaseErrorMsg, setNameCaseErrorMsg] = useState("");
  const [generos, setGeneros] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  async function loadClientes() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('clientes')
      .select(`
        id_cliente,
        fecha_registro,
        personas (
          nombre,
          apellido_paterno,
          apellido_materno,
          genero ( descripcion ),
          medios_contacto ( telefono, correo_electronico )
        )
      `)
      .order('fecha_registro', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadClientes()
    // Cargar catálogo de géneros
    supabase.from('genero').select('*').then(({ data }) => setGeneros(data ?? []))
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
      !form.id_genero ? 'Selecciona el género.' : null,
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

    // 1. Insertar persona
    const { data: persona, error: errPersona } = await supabase
      .from('personas')
      .insert({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        id_genero: form.id_genero
      })
      .select()
      .single()
    if (errPersona) {
      setFormError('Error al registrar persona: ' + errPersona.message)
      setFormLoading(false)
      return
    }
    // 2. Insertar cliente (id_cliente = id_persona)
    const { error: errCliente } = await supabase
      .from('clientes')
      .insert({ id_cliente: persona.id_persona })
      .select()
      .single()
    if (errCliente) {
      setFormError('Error al registrar cliente: ' + errCliente.message)
      setFormLoading(false)
      return
    }
    // 3. Insertar medios_contacto
    if (form.telefono || form.correo_electronico) {
      const { error: errContacto } = await supabase
        .from('medios_contacto')
        .insert({
          id_persona: persona.id_persona,
          telefono: form.telefono || null,
          correo_electronico: form.correo_electronico || null
        })
      if (errContacto) {
        setFormError('Error al registrar contacto: ' + errContacto.message)
        setFormLoading(false)
        return
      }
    }
    setShowForm(false)
    setForm({ nombre: '', apellido_paterno: '', apellido_materno: '', genero: '', telefono: '', correo_electronico: '' })
    await loadClientes()
    setFormLoading(false)
  }

  return (
    <section className="scroll-mt-8">
      <SectionIntro
        title="Clientes"
        subtitle="Personas registradas como socios del gimnasio (extienden la tabla personas)."
        table="clientes → personas, medios_contacto, genero"
      />

      <div className="mb-4 flex justify-end">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => setShowForm(f => !f)}
        >
          {showForm ? 'Cancelar' : 'Registrar nuevo cliente'}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow" onSubmit={handleSubmit}>
          {nameCaseErrorMsg && (
            <div className="text-red-600 font-semibold text-sm mb-2">
              {nameCaseErrorMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <select
              className="border p-2 rounded"
              value={form.id_genero}
              onChange={e => setForm(f => ({ ...f, id_genero: e.target.value }))}
              required
            >
              <option value="">Selecciona género</option>
              {generos.map(g => (
                <option key={g.id_genero} value={g.id_genero}>{g.descripcion}</option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
              type="tel"
            />
            <input
              className="border p-2 rounded"
              placeholder="Correo electrónico"
              value={form.correo_electronico}
              onChange={e => setForm(f => ({ ...f, correo_electronico: e.target.value }))}
              type="email"
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
              {formLoading ? 'Registrando...' : 'Registrar'}
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
                <th className={tableHeadCellClass()}>Cliente</th>
                <th className={tableHeadCellClass()}>Contacto</th>
                <th className={tableHeadCellClass()}>Alta</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No hay clientes. Inserta filas en <code className="font-mono text-xs">clientes</code> junto
                    con <code className="font-mono text-xs">personas</code>.
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
                    <tr key={row.id_cliente} className={rowHoverClass()}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{nombre}</div>
                        <div className="text-xs text-slate-500">{p?.genero?.descripcion ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{c?.correo_electronico ?? '—'}</div>
                        <div className="text-xs tabular-nums">{c?.telefono ?? ''}</div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDate(row.fecha_registro)}
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
