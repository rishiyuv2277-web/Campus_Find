import { useSyncExternalStore } from 'react'
import { currentUser, signIn, signOut, signUp } from '@/services/auth'
import type { CampusUser } from '@/types'

const listeners = new Set<() => void>()
let snapshot: CampusUser | null = null
let initialised = false
function emit() { listeners.forEach((fn) => fn()) }
function subscribe(fn: () => void) {
  listeners.add(fn)
  const onStorage = () => refresh()
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}
function getSnapshot(): CampusUser | null {
  if (!initialised) { snapshot = currentUser(); initialised = true }
  return snapshot
}
function refresh() { snapshot = currentUser(); emit() }
const actions = {
  async signIn(email: string, password: string) { const result = await signIn(email, password); if (result.ok) refresh(); return result },
  async signUp(input: Parameters<typeof signUp>[0]) { const result = await signUp(input); if (result.ok) refresh(); return result },
  async signOut() { await signOut(); refresh() },
}
export function useSession() { const user = useSyncExternalStore(subscribe, getSnapshot, () => null); return { user, ...actions } }
