import type { ClaimRequest, ItemReport } from '@/types'
import { seedReports } from '@/data/seed-reports'
import { currentUser } from '@/services/auth'
import { announceDataChanged, apiRequest, isApiConfigured } from '@/services/api'

const REPORTS_KEY = 'campusfind.reports.v1'
const CLAIMS_KEY = 'campusfind.claims.v1'
let apiReportsCache: ItemReport[] | null = null
let apiClaimsCache: ClaimRequest[] | null = null

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const raw = window.localStorage.getItem(key); if (!raw) return fallback; const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed as T : fallback } catch { return fallback }
}
function write(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
function seededReports(): ItemReport[] {
  const stored = read<ItemReport[]>(REPORTS_KEY, [])
  if (stored.length === 0) { write(REPORTS_KEY, seedReports); return seedReports }
  return stored
}
function sortReports(rows: ItemReport[]) { return rows.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)) }

/** Refresh the shared list from Java. Sample seed cards remain visible for demo/presentation purposes. */
export async function refreshReports(): Promise<ItemReport[]> {
  if (!isApiConfigured) return listReports()
  const remote = await apiRequest<ItemReport[]>('/api/reports')
  const byId = new Map<string, ItemReport>()
  for (const item of [...seedReports, ...remote]) byId.set(item.id, item)
  const sorted = sortReports([...byId.values()])
  apiReportsCache = sorted
  announceDataChanged()
  return sorted
}
export async function refreshClaims(): Promise<ClaimRequest[]> {
  if (!isApiConfigured) return listClaims()
  if (!currentUser()) { apiClaimsCache = []; announceDataChanged(); return [] }
  apiClaimsCache = await apiRequest<ClaimRequest[]>('/api/claims', {}, true)
  announceDataChanged()
  return apiClaimsCache
}
export function listReports(): ItemReport[] {
  if (isApiConfigured) return sortReports(apiReportsCache ?? seedReports)
  return sortReports(seededReports())
}
export function getReport(id: string): ItemReport | undefined { return listReports().find((r) => r.id === id) }
function nextId(existing: ItemReport[]): string {
  const highest = existing.reduce((max, r) => { const n = Number(r.id.replace(/\D/g, '')); return Number.isFinite(n) && n > max ? n : max }, 1000)
  return `CF-${highest + 1}`
}

export async function createReport(input: Omit<ItemReport, 'id' | 'createdAt' | 'reporterId' | 'reporterName'>): Promise<{ report: ItemReport; saved: boolean }> {
  const me = currentUser()
  if (isApiConfigured) {
    if (!me) throw new Error('Please sign in before submitting a report.')
    const request = { ...input, contact: input.contact?.trim() || me.email, image: input.image ?? null }
    const report = await apiRequest<ItemReport>('/api/reports', { method: 'POST', body: JSON.stringify(request) }, true)
    apiReportsCache = sortReports([report, ...(apiReportsCache ?? seedReports).filter((r) => r.id !== report.id)])
    announceDataChanged()
    return { report, saved: true }
  }
  const existing = seededReports()
  const report: ItemReport = { ...input, id: nextId(existing), createdAt: new Date().toISOString(), reporterId: me?.id ?? 'unclaimed', reporterName: me?.name ?? 'Unattributed report' }
  const saved = write(REPORTS_KEY, [report, ...existing])
  announceDataChanged()
  return { report, saved }
}

export async function updateReport(id: string, patch: Partial<ItemReport>): Promise<ItemReport | undefined> {
  const existing = listReports()
  const current = existing.find((r) => r.id === id)
  if (!current) return undefined
  const next = { ...current, ...patch, id: current.id }
  if (isApiConfigured && !current.seed) {
    const request = { type: next.type, name: next.name, category: next.category, description: next.description, date: next.date,
      time: next.time ?? '', location: next.location, features: next.features, image: next.image ?? null, status: next.status,
      contact: next.contact, handover: next.handover ?? null }
    const saved = await apiRequest<ItemReport>(`/api/reports/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(request) }, true)
    apiReportsCache = sortReports(existing.map((r) => r.id === id ? saved : r))
  } else if (isApiConfigured) {
    apiReportsCache = sortReports(existing.map((r) => r.id === id ? next : r))
  } else {
    const rows = seededReports().map((r) => r.id === id ? next : r)
    write(REPORTS_KEY, rows)
  }
  announceDataChanged()
  return next
}

export async function deleteReport(id: string): Promise<void> {
  if (isApiConfigured) {
    const current = listReports().find((r) => r.id === id)
    if (current && !current.seed) await apiRequest(`/api/reports/${encodeURIComponent(id)}`, { method: 'DELETE' }, true)
    apiReportsCache = (apiReportsCache ?? seedReports).filter((r) => r.id !== id)
  } else write(REPORTS_KEY, seededReports().filter((r) => r.id !== id))
  announceDataChanged()
}

export function myReports(): ItemReport[] {
  const me = currentUser()
  if (!me) return []
  return listReports().filter((r) => r.reporterId === me.id)
}
export function listClaims(): ClaimRequest[] { return isApiConfigured ? (apiClaimsCache ?? []) : read<ClaimRequest[]>(CLAIMS_KEY, []) }

export async function createClaim(input: Omit<ClaimRequest, 'id' | 'createdAt' | 'status'>): Promise<{ claim: ClaimRequest; saved: boolean }> {
  if (isApiConfigured) {
    if (!currentUser()) throw new Error('Please sign in before submitting a claim.')
    const claim = await apiRequest<ClaimRequest>('/api/claims', { method: 'POST', body: JSON.stringify({ reportId: input.reportId, claimantName: input.claimantName, claimantEmail: input.claimantEmail, secretDetail: input.secretDetail, message: input.message }) }, true)
    apiClaimsCache = [claim, ...(apiClaimsCache ?? []).filter((c) => c.id !== claim.id)]
    announceDataChanged()
    return { claim, saved: true }
  }
  const existing = listClaims()
  const claim: ClaimRequest = { ...input, id: `CL-${1200 + existing.length + 1}`, createdAt: new Date().toISOString(), status: 'pending' }
  const saved = write(CLAIMS_KEY, [claim, ...existing]); announceDataChanged(); return { claim, saved }
}

export async function setClaimStatus(id: string, status: ClaimRequest['status']): Promise<void> {
  if (isApiConfigured) {
    const claim = await apiRequest<ClaimRequest>(`/api/claims/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, true)
    apiClaimsCache = (apiClaimsCache ?? []).map((c) => c.id === id ? claim : c)
  } else write(CLAIMS_KEY, listClaims().map((c) => c.id === id ? { ...c, status } : c))
  announceDataChanged()
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(REPORTS_KEY); window.localStorage.removeItem(CLAIMS_KEY) } catch { /* no-op */ }
  if (isApiConfigured) { apiReportsCache = null; apiClaimsCache = null }
  announceDataChanged()
}
