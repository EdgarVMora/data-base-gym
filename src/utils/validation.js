function pad2(n) {
  return String(n).padStart(2, '0')
}

export function nowLocalDateInputMax() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function nowLocalDateTimeInputMax() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function isValidDateTimeLocal(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
}

export function isFutureDateTimeLocal(value) {
  if (!isValidDateTimeLocal(value)) return false
  return value > nowLocalDateTimeInputMax()
}

export function isFutureDateLocal(value) {
  if (!value) return false
  const day = String(value).slice(0, 10)
  return day > nowLocalDateInputMax()
}

/** Convierte valor de input datetime-local (hora local) a ISO UTC para Supabase */
export function localDateTimeToISO(dateTimeLocal) {
  if (!dateTimeLocal) return null
  const [date, time] = dateTimeLocal.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString()
}

/** Convierte timestamptz de BD a valor para input datetime-local (hora local) */
export function isoToLocalDateTimeInput(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function isProperCaseWords(str) {
  if (str == null) return true
  const s = String(str).trim()
  if (!s) return true
  return s.split(/\s+/).every(word => {
    if (!word) return true
    const [first, ...rest] = word
    const tail = rest.join('')
    return first === first.toUpperCase() && tail === tail.toLowerCase()
  })
}

export function collectFormErrors(items) {
  const errors = []
  for (const item of items) {
    if (!item) continue
    if (Array.isArray(item)) {
      for (const sub of item) if (sub) errors.push(sub)
    } else {
      errors.push(item)
    }
  }
  return errors
}
