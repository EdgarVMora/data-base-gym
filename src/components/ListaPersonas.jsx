import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SectionIntro from './ui/SectionIntro'
import { ErrorNotice, LoadingMessage, TableWrap } from './ui/QueryState'
import { tableHeadCellClass } from './ui/tableStyles'

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

  useEffect(() => {
    async function fetchPersonas() {
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
        setPersonas(data)
      }

      setLoading(false)
    }

    fetchPersonas()
  }, [])

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
