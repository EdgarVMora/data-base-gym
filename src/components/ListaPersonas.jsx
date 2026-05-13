import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { tableHeadCellClass } from './ui/tableStyles'

const FORM_INICIAL = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  id_genero: '',
  telefono: '',
  correo_electronico: '',
  tipo: 'cliente',
  id_puesto: '',
  id_tipo_contrato: '',
  salario_actual: '',
  fecha_contratacion: ''
}

function PersonaRow({ persona }) {
  const genero = persona.genero?.descripcion ?? '—'
  const contacto = persona.medios_contacto?.[0]
  const generoIcon = { Masculino: '♂', Femenino: '♀' }

  return (
    <tr
      id={`persona-row-${persona.id_persona}`}
      className="border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors"
    >
      <td className="px-4 py-3.5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600">
            {persona.nombre[0]}
            {persona.apellido_paterno[0]}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {persona.nombre} {persona.apellido_paterno}{' '}
              {persona.apellido_materno ?? ''}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {contacto?.correo_electronico ?? '—'}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 text-left text-sm text-slate-600 dark:text-slate-300 tabular-nums">
        {contacto?.telefono ?? '—'}
      </td>

      <td className="px-4 py-3.5 text-center text-base text-slate-700 dark:text-slate-200">
        <span title={genero}>{generoIcon[genero] ?? '?'}</span>
      </td>
    </tr>
  )
}

export default function ListaPersonas() {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  const [generos, setGeneros] = useState([])
  const [puestos, setPuestos] = useState([])
  const [contratos, setContratos] = useState([])

  async function loadPersonas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('personas')
      .select(`
        id_persona,
        nombre,
        apellido_paterno,
        apellido_materno,
        genero ( descripcion ),
        medios_contacto ( telefono, correo_electronico )
      `)
      .order('apellido_paterno', { ascending: true })

    if (error) {
      console.error('[Auditor] Error al leer personas:', error.message, '| code:', error.code)
      setError(error.message)
    } else {
      setPersonas(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPersonas()
    supabase.from('genero').select('*').then(({ data }) => setGeneros(data ?? []))
    supabase.from('puesto').select('*').order('nombre_puesto', { ascending: true }).then(({ data }) => setPuestos(data ?? []))
    supabase.from('tipo_contrato').select('*').order('descripcion', { ascending: true }).then(({ data }) => setContratos(data ?? []))
  }, [])

  function actualizarCampo(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function cerrarFormulario() {
    setShowForm(false)
    setForm(FORM_INICIAL)
    setFormError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    if (form.tipo === 'empleado') {
      if (!form.id_puesto || !form.id_tipo_contrato || !form.salario_actual || !form.fecha_contratacion) {
        setFormError('Faltan datos del empleado (puesto, contrato, salario y fecha).')
        setFormLoading(false)
        return
      }
    }

    // 1. Insertar persona
    const { data: persona, error: errPersona } = await supabase
      .from('personas')
      .insert({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno || null,
        id_genero: form.id_genero || null
      })
      .select()
      .single()
    if (errPersona) {
      setFormError('Error al registrar persona: ' + errPersona.message)
      setFormLoading(false)
      return
    }

    // 2. Insertar cliente o empleado (id_cliente / id_empleado = id_persona)
    if (form.tipo === 'cliente') {
      const { error: errCliente } = await supabase
        .from('clientes')
        .insert({ id_cliente: persona.id_persona })
      if (errCliente) {
        setFormError('Error al registrar cliente: ' + errCliente.message)
        setFormLoading(false)
        return
      }
    } else {
      const { error: errEmpleado } = await supabase
        .from('empleados')
        .insert({
          id_empleado: persona.id_persona,
          id_puesto: form.id_puesto,
          id_tipo_contrato: form.id_tipo_contrato,
          salario_actual: form.salario_actual,
          fecha_contratacion: form.fecha_contratacion
        })
      if (errEmpleado) {
        setFormError('Error al registrar empleado: ' + errEmpleado.message)
        setFormLoading(false)
        return
      }
    }

    // 3. Medios de contacto (opcional)
    if (form.telefono || form.correo_electronico) {
      const { error: errContacto } = await supabase
        .from('medios_contacto')
        .insert({
          id_persona: persona.id_persona,
          telefono: form.telefono || null,
          correo_electronico: form.correo_electronico || null
        })
      if (errContacto) {
        setFormError('Persona creada, pero falló el contacto: ' + errContacto.message)
        setFormLoading(false)
        await loadPersonas()
        return
      }
    }

    cerrarFormulario()
    await loadPersonas()
    setFormLoading(false)
  }

  const personasFiltradas = personas.filter(p => {
    const termino = busqueda.toLowerCase()
    const nombre = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`.toLowerCase()
    const correo = p.medios_contacto?.[0]?.correo_electronico?.toLowerCase() ?? ''
    return nombre.includes(termino) || correo.includes(termino)
  })

  const totalMasc = personas.filter(p => p.genero?.descripcion === 'Masculino').length
  const totalFem = personas.filter(p => p.genero?.descripcion === 'Femenino').length

  return (
    <section id="lista-personas" className="scroll-mt-8 py-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <SectionIntro
            title="Directorio de personas"
            subtitle="Identidad base compartida por clientes y empleados (misma persona puede no ser ambos a la vez en el modelo)."
            table="personas → genero, medios_contacto"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:pt-1 shrink-0">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
            {personas.length} total
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
            {totalMasc} ♂
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
            {totalFem} ♀
          </span>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => (showForm ? cerrarFormulario() : setShowForm(true))}
        >
          {showForm ? 'Cancelar' : 'Registrar nueva persona'}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded shadow"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Nombre(s)"
              value={form.nombre}
              onChange={e => actualizarCampo('nombre', e.target.value)}
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Apellido paterno"
              value={form.apellido_paterno}
              onChange={e => actualizarCampo('apellido_paterno', e.target.value)}
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Apellido materno"
              value={form.apellido_materno}
              onChange={e => actualizarCampo('apellido_materno', e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={form.id_genero}
              onChange={e => actualizarCampo('id_genero', e.target.value)}
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
              type="tel"
              value={form.telefono}
              onChange={e => actualizarCampo('telefono', e.target.value)}
            />
            <input
              className="border p-2 rounded"
              placeholder="Correo electrónico"
              type="email"
              value={form.correo_electronico}
              onChange={e => actualizarCampo('correo_electronico', e.target.value)}
            />
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Registrar como
            </legend>
            <div className="flex gap-4 text-sm text-slate-700 dark:text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="tipo"
                  value="cliente"
                  checked={form.tipo === 'cliente'}
                  onChange={() => actualizarCampo('tipo', 'cliente')}
                />
                Cliente
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="tipo"
                  value="empleado"
                  checked={form.tipo === 'empleado'}
                  onChange={() => actualizarCampo('tipo', 'empleado')}
                />
                Empleado
              </label>
            </div>
          </fieldset>

          {form.tipo === 'empleado' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <select
                className="border p-2 rounded"
                value={form.id_puesto}
                onChange={e => actualizarCampo('id_puesto', e.target.value)}
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
                onChange={e => actualizarCampo('id_tipo_contrato', e.target.value)}
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
                type="number"
                min="0"
                value={form.salario_actual}
                onChange={e => actualizarCampo('salario_actual', e.target.value)}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Fecha de contratación"
                type="date"
                value={form.fecha_contratacion}
                onChange={e => actualizarCampo('fecha_contratacion', e.target.value)}
                required
              />
            </div>
          )}

          {formError && <div className="text-red-600 mt-3 text-sm">{formError}</div>}

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

      <label htmlFor="busqueda-personas" className="sr-only">
        Buscar por nombre o correo
      </label>
      <input
        id="busqueda-personas"
        type="search"
        placeholder="Buscar por nombre o correo…"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full box-border px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/50 text-sm mb-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 dark:focus:border-amber-500/50 transition-shadow"
      />

      {loading ? <LoadingMessage>Cargando personas…</LoadingMessage> : null}

      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error ? (
        <TableWrap>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/95 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className={tableHeadCellClass()}>Nombre / contacto</th>
                <th className={tableHeadCellClass()}>Teléfono</th>
                <th className={`${tableHeadCellClass()} text-center w-24`}>Género</th>
              </tr>
            </thead>
            <tbody>
              {personasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No se encontraron personas con ese criterio.
                  </td>
                </tr>
              ) : (
                personasFiltradas.map(p => <PersonaRow key={p.id_persona} persona={p} />)
              )}
            </tbody>
          </table>
        </TableWrap>
      ) : null}
    </section>
  )
}
