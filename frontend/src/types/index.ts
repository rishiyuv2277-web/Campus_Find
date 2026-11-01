/* Shared frontend domain types aligned with the Java + MySQL API models. */

export type ReportType = 'lost' | 'found'

export type ReportStatus =
  | 'open'
  | 'under-review'
  | 'matched'
  | 'returned'

export type CategoryId =
  | 'electronics'
  | 'id-cards'
  | 'keys'
  | 'bags'
  | 'bottles'
  | 'books'
  | 'accessories'
  | 'other'

export type HandoverState = 'with-student' | 'handed-over'

export interface User {
  id: string
  name: string
  rollNo: string
  department: string
  email: string
  /** True only for local prototype accounts; backend accounts use server sessions. */
  demo: boolean
}

/* Alias kept because the auth service and the sign-in pages talk about a
   signed-in student rather than a seeded one. */
export type CampusUser = User

export interface ItemReport {
  id: string
  type: ReportType
  name: string
  category: CategoryId
  description: string
  /** ISO date, yyyy-mm-dd. */
  date: string
  time?: string
  location: string
  features: string
  /** Path under public/, e.g. /images/item-keys.webp. Optional. */
  image?: string
  status: ReportStatus
  contact: string
  reporterId: string
  reporterName: string
  createdAt: string
  /** Found reports only: has the student actually handed it to the center? */
  handover?: HandoverState
  /** Seeded demo data, as opposed to a report a visitor filed. */
  seed?: boolean
}

export interface ClaimRequest {
  id: string
  reportId: string
  claimantName: string
  claimantEmail: string
  /** A private identifying detail the center uses to check ownership. */
  secretDetail: string
  message: string
  status: 'pending' | 'approved' | 'declined'
  createdAt: string
}

export type MatchStrength = 'strong' | 'possible' | 'weak'

export interface MatchResult {
  report: ItemReport
  score: number
  strength: MatchStrength
  reasons: string[]
}

export interface CampusCenter {
  name: string
  block: string
  room: string
  hours: { day: string; time: string }[]
  phone: string
  email: string
}
