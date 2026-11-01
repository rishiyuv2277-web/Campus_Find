/* Formatting helpers shared by the cards, the detail page and the dashboard. */

export function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(time?: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (!Number.isFinite(h)) return time
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export function daysAgo(iso: string): number {
  const then = new Date(`${iso.slice(0, 10)}T00:00:00`).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Number.isNaN(then)) return 0
  return Math.max(0, Math.round((today.getTime() - then) / 86_400_000))
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
