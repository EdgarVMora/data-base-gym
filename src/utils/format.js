function parseAsLocalDate(value) {
  if (value == null) return null
  const s = String(value)
  const dateOnly = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnly) {
    const [, y, m, d] = dateOnly
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (value == null) return '—'
  try {
    const d = parseAsLocalDate(value)
    if (!d) return String(value)
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return String(value)
  }
}

export function formatDateTime(value) {
  if (value == null) return '—'
  try {
    const d = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

export function formatTime(value) {
  if (value == null) return '—'
  if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  return String(value)
}
