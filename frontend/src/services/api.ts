import type { CampusUser } from '@/types'

const TOKEN_KEY = 'campusfind.api.token.v1'
const USER_KEY = 'campusfind.api.user.v1'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')
export const isApiConfigured = Boolean(API_BASE_URL)

export function getApiToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function saveApiSession(token: string, user: CampusUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearApiSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getCachedApiUser(): CampusUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as CampusUser) : null
  } catch {
    return null
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  if (!API_BASE_URL) throw new Error('Backend is not configured yet. Set VITE_API_BASE_URL in Vercel and redeploy.')
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (auth) {
    const token = getApiToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new Error('Cannot reach the CampusFind backend. Check that the Java API is deployed and VITE_API_BASE_URL is correct.')
  }
  const text = await response.text()
  let payload: any = null
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = text }
  }
  if (!response.ok) {
    const message = typeof payload === 'object' && payload
      ? payload.error || payload.message || payload.detail
      : null
    throw new Error(message || `Request failed (${response.status}).`)
  }
  return payload as T
}

export function fileToDataUrl(file: File | null): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'))
    reader.onerror = () => reject(new Error('Could not read image.'))
    reader.readAsDataURL(file)
  })
}

export function announceDataChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('campusfind:data-changed'))
}
