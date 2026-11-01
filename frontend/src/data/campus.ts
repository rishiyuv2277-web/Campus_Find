import type { CampusCenter, CategoryId, User } from '@/types'

/** Everything the demo knows. No network, no credentials — a labelled prototype. */

export const DEMO_USER: User = {
  id: 'u-ananya',
  name: 'Ananya Rao',
  rollNo: '23CS1042',
  department: 'Computer Science, 3rd year',
  email: 'ananya.rao@svit.edu.in',
  demo: true,
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'id-cards', label: 'ID Cards' },
  { id: 'keys', label: 'Keys' },
  { id: 'bags', label: 'Bags' },
  { id: 'bottles', label: 'Bottles' },
  { id: 'books', label: 'Books' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'other', label: 'Other' },
]

export const LOCATIONS = [
  'Central Library',
  'Block C Computer Lab',
  'Main Canteen',
  'Exam Hall 2',
  'Administration Block',
  'College Bus Stop',
  'Sports Ground',
  'Seminar Hall A',
  'Block A Classroom 104',
  'Cafeteria Lawn',
]

export const CENTER: CampusCenter = {
  name: 'Campus Lost & Found Center',
  block: 'Administration Block',
  room: 'Ground floor, Room A-012 (beside the stationery counter)',
  hours: [
    { day: 'Monday – Friday', time: '9:30 am – 5:00 pm' },
    { day: 'Saturday', time: '10:00 am – 1:00 pm' },
    { day: 'Sunday & public holidays', time: 'Closed' },
  ],
  phone: '+91 80 4567 2210',
  email: 'lostfound@svit.edu.in',
}

export const FALLBACK_IMAGE = '/images/item-keys.webp'
