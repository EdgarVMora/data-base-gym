export function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (value == null) return '—'
  try {
    const d = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(d.getTime())) return String(value)
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
