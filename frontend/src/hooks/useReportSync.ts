import { useEffect, useState } from 'react'
import { currentUser } from '@/services/auth'
import { refreshClaims, refreshReports } from '@/services/reports'

/** Loads the shared server data when API mode is configured and refreshes pages after writes. */
export function useReportSync(): number {
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const onChanged = () => setRevision((value) => value + 1)
    window.addEventListener('campusfind:data-changed', onChanged)
    refreshReports().catch((error) => console.error('CampusFind report sync failed:', error))
    if (currentUser()) refreshClaims().catch((error) => console.error('CampusFind claim sync failed:', error))
    return () => window.removeEventListener('campusfind:data-changed', onChanged)
  }, [])
  return revision
}
