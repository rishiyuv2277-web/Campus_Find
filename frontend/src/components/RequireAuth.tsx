import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSession } from '@/hooks/useSession'

/* Every page sits behind a sign-in, so the first thing anyone sees is the
   front door. The attempted path is carried in router state and the form
   returns the student to it once the session exists. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <>{children}</>
}
