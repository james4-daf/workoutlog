/** Format note_date or updated_at for list display: "Today", "Yesterday", or "15 Jan 2025". */
export function formatNoteDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Return YYYY-MM-DD for input type="date". */
export function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

/** Today in YYYY-MM-DD. */
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
