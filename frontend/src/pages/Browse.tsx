import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowDownUp, Filter, RotateCcw, Search, SearchX } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { ItemCard } from '@/components/ItemCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReportSync } from '@/hooks/useReportSync'
import { listReports } from '@/services/reports'
import { CATEGORIES, LOCATIONS } from '@/data/campus'
import { cn } from '@/lib/utils'
import type { CategoryId, ReportStatus, ReportType } from '@/types'

type TypeFilter = 'all' | ReportType
type StatusFilter = 'all' | ReportStatus
type Sort = 'newest' | 'oldest'

const statuses: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'open', label: 'Open' },
  { id: 'under-review', label: 'Under review' },
  { id: 'matched', label: 'Matched' },
  { id: 'returned', label: 'Returned' },
]

const ranges = [
  { id: 'any', label: 'Any time', days: Infinity },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
]

export default function Browse() {
  useReportSync()
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const type = (params.get('type') ?? 'all') as TypeFilter
  const category = params.get('category') ?? 'all'
  const location = params.get('location') ?? 'all'
  const status = (params.get('status') ?? 'all') as StatusFilter
  const range = params.get('range') ?? 'any'
  const sort = (params.get('sort') ?? 'newest') as Sort

  const [queryDraft, setQueryDraft] = useState(q)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || (key === 'sort' && value === 'newest') || (key === 'range' && value === 'any')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const reset = () => {
    setQueryDraft('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const reports = listReports()

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const days = ranges.find((r) => r.id === range)?.days ?? Infinity
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const rows = reports.filter((r) => {
      if (type !== 'all' && r.type !== type) return false
      if (category !== 'all' && r.category !== (category as CategoryId)) return false
      if (location !== 'all' && r.location !== location) return false
      if (status !== 'all' && r.status !== status) return false
      if (days !== Infinity) {
        const age = (now.getTime() - new Date(`${r.date}T00:00:00`).getTime()) / 86_400_000
        if (age > days) return false
      }
      if (needle) {
        const haystack = [r.name, r.description, r.features, r.location, r.id, r.category, r.type]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })

    return rows.sort((a, b) => (sort === 'newest' ? (a.date < b.date ? 1 : -1) : a.date > b.date ? 1 : -1))
  }, [reports, q, type, category, location, status, range, sort])

  const activeCount = [type !== 'all', category !== 'all', location !== 'all', status !== 'all', range !== 'any', q !== ''].filter(
    Boolean,
  ).length

  const typeTabs: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'All items' },
    { id: 'lost', label: 'Lost' },
    { id: 'found', label: 'Found' },
  ]

  return (
    <main id="content" className="mx-auto max-w-content px-gutter py-10 md:py-14">
      <Meta
        title="Browse lost and found items — CampusFind"
        description="Filter every lost and found report at SVIT by item type, category, campus location, date and status, and open a listing to see its photograph and next step."
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.75rem)] font-extrabold tracking-[-0.03em]">
            Browse the shelf
          </h1>
          <p className="mt-2 max-w-[56ch] text-muted-foreground">
            {reports.length} demo listings from across the campus. Lost reports are navy, found
            items are green — check both before you give up on something.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 rounded-md px-4">
          <a href="#results">
            <ArrowDownUp className="size-4" strokeWidth={2} aria-hidden="true" />
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </a>
        </Button>
      </div>

      {/* Search + segmented type filter */}
      <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-raised sm:p-5">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            setParam('q', queryDraft.trim())
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
            <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
            <Label htmlFor="browse-search" className="sr-only">
              Search listings
            </Label>
            <Input
              id="browse-search"
              type="search"
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder="Search by item, place, colour or report ID"
              className="h-11 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 md:text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 rounded-md px-6">
            Search
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Listing type" className="inline-flex rounded-md border border-border bg-background p-1">
            {typeTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setParam('type', t.id)}
                aria-pressed={type === t.id}
                className={cn(
                  'inline-flex h-9 min-w-20 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors duration-150',
                  type === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Label htmlFor="sort" className="sr-only">
              Sort listings
            </Label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            {activeCount > 0 && (
              <Button variant="ghost" className="h-11 rounded-md px-3 text-sm" onClick={reset}>
                <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
                Reset {activeCount} filter{activeCount === 1 ? '' : 's'}
              </Button>
            )}
          </div>
        </div>

        {/* Category, location, date, status */}
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="filter-category" className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Category
            </Label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => setParam('category', e.target.value)}
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="filter-location" className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Location
            </Label>
            <select
              id="filter-location"
              value={location}
              onChange={(e) => setParam('location', e.target.value)}
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              <option value="all">Anywhere on campus</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="filter-range" className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Reported
            </Label>
            <select
              id="filter-range"
              value={range}
              onChange={(e) => setParam('range', e.target.value)}
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {ranges.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="filter-status" className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Status
            </Label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div id="results" className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
          {reports.length} demo listings
        </p>
        {q && (
          <p className="text-sm text-muted-foreground">
            Searching “<span className="font-medium text-foreground">{q}</span>”
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ItemCard key={r.id} report={r} />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid place-items-center rounded-lg border border-dashed border-border bg-muted/60 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-background text-muted-foreground shadow-raised">
            <SearchX className="size-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold">Nothing matches those filters</h2>
          <p className="mt-2 max-w-[44ch] text-sm text-muted-foreground">
            Try a wider date range or another location. If the item truly is not here, file a lost
            report and the center will keep checking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={reset} className="h-11 rounded-md px-5">
              <Filter className="size-4" strokeWidth={2} aria-hidden="true" />
              Reset all filters
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-md border-border bg-background px-5">
              <Link to="/report-lost">Report it as lost</Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
