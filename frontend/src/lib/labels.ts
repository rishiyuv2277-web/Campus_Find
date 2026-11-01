import type { CategoryId, ReportStatus, ReportType } from '@/types'

/* One place where a stored key becomes a human word, so a filter, a card and a
   detail page can never disagree. */

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  electronics: 'Electronics',
  'id-cards': 'ID Cards',
  keys: 'Keys',
  bags: 'Bags',
  bottles: 'Bottles',
  books: 'Books',
  accessories: 'Accessories',
  other: 'Other',
}

export const TYPE_LABEL: Record<ReportType, string> = {
  lost: 'Lost',
  found: 'Found',
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  open: 'Open',
  'under-review': 'Under review',
  matched: 'Matched',
  returned: 'Returned',
}

/** The category's own photograph, used on the home page quick filters. */
export const CATEGORY_IMAGE: Record<CategoryId, string> = {
  electronics: '/images/item-headphones.webp',
  'id-cards': '/images/item-id-card.webp',
  keys: '/images/item-keys.webp',
  bags: '/images/item-backpack.webp',
  bottles: '/images/item-water-bottle.webp',
  books: '/images/item-notebook.webp',
  accessories: '/images/item-wristwatch.webp',
  other: '/images/item-umbrella.webp',
}

export const MAJOR_LOCATION = ['All locations', 'Central Library', 'Main Canteen']
