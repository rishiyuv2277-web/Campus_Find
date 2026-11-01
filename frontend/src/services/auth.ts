import type { CampusUser } from '@/types'
import { apiRequest, clearApiSession, getApiToken, getCachedApiUser, isApiConfigured, saveApiSession } from '@/services/api'

const USERS_KEY = 'campusfind.users.v2'
const SESSION_KEY = 'campusfind.session.v2'
const RETIRED_DEMO_ID = 'u-ananya'

export type StoredUser = CampusUser & { password: string }
export type AuthResult =
  | { ok: true; user: CampusUser }
  | { ok: false; error: string; field?: 'email' | 'password' | 'rollNo' | 'name' }
export type SignUpInput = { name: string; rollNo: string; department: string; email: string; password: string }
type AuthResponse = { token: string; user: CampusUser }

function readUsers(): StoredUser[] {
  try { const parsed = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}
function writeUsers(users: StoredUser[]): boolean {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); return true } catch { return false }
}
function strip(user: StoredUser): CampusUser { const { password: _password, ...rest } = user; return rest }

export function currentUser(): CampusUser | null {
  if (isApiConfigured) {
    if (!getApiToken()) return null
    return getCachedApiUser()
  }
  try {
    const id = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as string | null
    if (!id || id === RETIRED_DEMO_ID) return null
    const found = readUsers().find((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase())
    return found ? strip(found) : null
  } catch { return null }
}
function startLocalSession(user: CampusUser) { localStorage.setItem(SESSION_KEY, JSON.stringify(user.id)) }

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()
  const rollNo = input.rollNo.trim().toUpperCase()
  if (isApiConfigured) {
    try {
      const response = await apiRequest<AuthResponse>('/api/auth/signup', {
        method: 'POST', body: JSON.stringify({ ...input, email, rollNo }),
      })
      saveApiSession(response.token, response.user)
      return { ok: true, user: response.user }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create account.'
      return { ok: false, error: message, field: /email/i.test(message) ? 'email' : /roll/i.test(message) ? 'rollNo' : undefined }
    }
  }
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === email)) return { ok: false, field: 'email', error: 'An account already exists for this email address. Sign in instead.' }
  if (users.some((u) => u.rollNo.toUpperCase() === rollNo)) return { ok: false, field: 'rollNo', error: 'That roll number is already registered. Sign in instead.' }
  const user: StoredUser = { id: `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: input.name.trim(), rollNo, department: input.department.trim(), email, demo: false, password: input.password }
  if (!writeUsers([...users, user])) return { ok: false, error: 'This browser refused local storage, so the account could not be saved.' }
  startLocalSession(strip(user))
  return { ok: true, user: strip(user) }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const address = email.trim().toLowerCase()
  if (isApiConfigured) {
    try {
      const response = await apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: address, password }) })
      saveApiSession(response.token, response.user)
      return { ok: true, user: response.user }
    } catch (error) {
      return { ok: false, field: 'email', error: error instanceof Error ? error.message : 'Sign in failed.' }
    }
  }
  const match = readUsers().find((u) => u.email.toLowerCase() === address)
  if (!match) return { ok: false, field: 'email', error: 'No account is registered with that email address on this device yet.' }
  if (match.password !== password) return { ok: false, field: 'password', error: 'That password does not match the one saved for this account.' }
  startLocalSession(strip(match))
  return { ok: true, user: strip(match) }
}

export async function signOut(): Promise<void> {
  if (isApiConfigured) {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }, true) } catch { /* clear local session even if server is unreachable */ }
    clearApiSession()
  }
  localStorage.removeItem(SESSION_KEY)
}
export function registeredCount(): number { return readUsers().length }
