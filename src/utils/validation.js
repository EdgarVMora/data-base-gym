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

