import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Clock, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemCard } from '@/components/ItemCard'
import { SearchForm } from '@/components/SearchForm'
import { CATEGORIES } from '@/data/campus'
import { CENTER } from '@/data/campus'
import { useReportSync } from '@/hooks/useReportSync'
import { listReports } from '@/services/reports'
import { CATEGORY_LABEL } from '@/lib/labels'
import { formatDate } from '@/lib/format'

const heroItems = [
  { src: '/images/item-headphones.webp', name: 'Headphones', w: 1200, h: 800 },
  { src: '/images/item-water-bottle.webp', name: 'Steel bottle', w: 1200, h: 800 },
  { src: '/images/item-backpack.webp', name: 'Backpack', w: 1200, h: 800 },
  { src: '/images/item-keys.webp', name: 'Keys', w: 1200, h: 800 },
  { src: '/images/item-id-card.webp', name: 'ID card', w: 1200, h: 800 },
  { src: '/images/item-notebook.webp', name: 'Notebook', w: 1200, h: 800 },
]

/* The three steps are shown through the record itself: the report ID the
   student gets, the candidate it draws, the sign-out line at the desk. */
const steps = [
  {
    title: 'File the report',
    body: 'A photo, the place, and a detail only you would know. Two minutes at a phone, and the desk holds the record.',
    record: { label: 'Your report ID', value: 'SVIT-LF-2407' },
  },
  {
    title: 'Read your matches',
    body: 'The shelf compares your report with what students hand in and shows why each one came up.',
    record: { label: 'Held for you', value: '2 candidates' },
  },
  {
    title: 'Collect it at the desk',
    body: 'Staff check the private detail you described, log the handover, and close the listing as returned.',
    record: { label: 'Handed over', value: 'Admin Block, Ground' },
  },
]

export default function Home() {
  useReportSync()
  const reports = listReports()
  const recentFound = reports
    .filter((r) => r.type === 'found')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3)

  return (
    <main id="content" className="w-full">
      {/* Hero: headline, the search students actually come to use, and the shelf itself. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--lavender)_90%,transparent),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-[-12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--success-soft)_100%,transparent),transparent)]"
        />
        <div className="relative mx-auto grid max-w-content gap-12 px-gutter pt-12 pb-16 md:pt-16 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-16 lg:pb-24">
          <div>
            <p className="font-label text-xs font-semibold tracking-[0.14em] text-success-soft-foreground uppercase">
              College Lost &amp; Found · Demo prototype
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,5.4vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance">
              Lost something on campus? Let’s find it.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
              A central shelf for everything students leave behind — a photo, a location, a report ID,
              and a route to the desk that holds it.
            </p>

            <SearchForm className="mt-8" />

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button asChild className="h-12 rounded-md px-6 text-base">
                <Link to="/report-lost">
                  Report a lost item
                  <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-md px-6 text-base">
                <Link to="/browse">Browse found items</Link>
              </Button>
            </div>
          </div>

          <div className="relative lg:pl-6">
            {/* At 360 the collage keeps its top row rather than vanishing: the
                shelf is the subject, so one row of it stays above the fold. */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroItems.map((c, i) => (
                <figure
                  key={c.src}
                  className={`overflow-hidden rounded-xl border border-border bg-background shadow-raised ${
                    i % 3 === 1 ? 'translate-y-3' : ''
                  } ${i >= 2 ? 'hidden sm:block' : ''}`}
                >
                  <img
                    src={c.src}
                    alt={`${c.name} — a commonly lost item on campus`}
                    width={c.w}
                    height={c.h}
                    sizes="(min-width: 640px) 30vw, 42vw"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className="aspect-[4/3] size-full object-cover"
                  />
                </figure>
              ))}
            </div>

            <div className="absolute -bottom-6 left-1 flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 shadow-lift sm:left-6">
              <span className="grid size-9 place-items-center rounded-md bg-success-soft text-success-soft-foreground">
                <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="pr-1">
                <p className="text-sm leading-tight font-semibold text-foreground">Umbrella returned</p>
                <p className="text-xs text-muted-foreground">Canteen · {formatDate('2026-03-07')}</p>
              </div>
            </div>
            <div className="absolute -top-4 right-0 hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-lift sm:flex">
              <Sparkles className="size-4 text-lavender-foreground" strokeWidth={2} aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">3 possible matches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick categories: a jump-off, not a section with its own argument. */}
      <section aria-labelledby="quick-links" className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-3 gap-y-2 px-gutter py-4">
          <h2
            id="quick-links"
            className="w-full font-label text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:w-auto"
          >
            Browse the shelf by category
          </h2>
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/browse?category=${c.id}`}
              className="inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {CATEGORY_LABEL[c.id]}
            </Link>
          ))}
        </div>
      </section>

      {/* Recently found. */}
      <section aria-labelledby="recent" className="mx-auto max-w-content px-gutter py-section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="recent" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em]">
              Fresh on the shelf
            </h2>
            <p className="mt-2 max-w-[52ch] text-muted-foreground">
              The latest items a student handed in, with the spot it was found.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-md px-4">
            <Link to="/browse">
              Browse all items
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentFound.map((r) => (
            <ItemCard key={r.id} report={r} />
          ))}
        </div>
      </section>

      {/* How it works: three steps, the numbers mean something here. */}
      <section aria-labelledby="how" className="border-y border-border bg-muted">
        <div className="mx-auto max-w-content px-gutter py-section">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 id="how" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em]">
                Three steps, and it is back with you
              </h2>
              <p className="mt-3 max-w-[42ch] text-muted-foreground">
                No group chats, no noticeboards in the corridor. Every report has an ID you can track,
                and the center keeps the record.
              </p>
              <Button asChild variant="outline" className="mt-6 h-11 rounded-md px-4">
                <Link to="/center">Read the center’s process</Link>
              </Button>
            </div>
              <ol className="grid gap-4 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex flex-col rounded-lg border border-border bg-background p-5">
                  <span className="self-start border-b border-border pb-2 font-display text-[1.75rem] leading-none font-extrabold tracking-[-0.04em] text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                  <p className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border pt-3 font-label text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
                    {s.record.label}
                    <span className="font-mono text-xs font-medium tracking-normal normal-case text-foreground">
                      {s.record.value}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* The center: the page turns dark here because the subject changes to the desk itself. */}
      <section aria-labelledby="center" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-content gap-10 px-gutter py-section lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="order-2 overflow-hidden rounded-xl border border-primary-foreground/15 lg:order-1">
            <img
              src="/images/center-desk.webp"
              alt="The staffed help desk in the Administration Block where found items are handed in and collected"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 45vw, 92vw"
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 id="center" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em]">
              One desk holds all of it
            </h2>
            <p className="mt-3 max-w-[46ch] text-primary-foreground/85">
              The Campus Lost &amp; Found Center is staffed through the working day. Nothing on the
              shelf is released without a check, so the item that leaves is the one you lost.
            </p>

            <dl className="mt-7 grid gap-4 text-sm">
              <div>
                <dt className="flex items-center gap-2.5 font-semibold">
                  <MapPin className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  Where
                </dt>
                <dd className="mt-1 pl-[1.9rem] text-primary-foreground/85">
                  {CENTER.block}, {CENTER.room}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2.5 font-semibold">
                  <Clock className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  When
                </dt>
                <dd className="mt-1 pl-[1.9rem] text-primary-foreground/85">
                  {CENTER.hours.slice(0, 2).map((h) => `${h.day}: ${h.time}`).join(' · ')}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2.5 font-semibold">
                  <ShieldCheck className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  Before you collect
                </dt>
                <dd className="mt-1 pl-[1.9rem] text-primary-foreground/85">
                  Bring your college ID. Describe the mark that is not in the listing.
                </dd>
              </div>
            </dl>
            <Button asChild variant="secondary" className="mt-7 h-11 rounded-md px-5">
              <Link to="/center">
                Center details and hours
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Closing action. */}
      <section className="mx-auto max-w-content px-gutter py-section text-center">
        <h2 className="mx-auto max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-balance">
          Something in your bag today will be on this shelf tomorrow.
        </h2>
        <p className="mx-auto mt-3 max-w-[48ch] text-muted-foreground">
          File the report while you still remember the details — matching is checked against everything
          handed in from that moment on.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-12 rounded-md px-6 text-base">
            <Link to="/report-lost">Report a lost item</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-md px-6 text-base">
            <Link to="/report-found">I found something</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
