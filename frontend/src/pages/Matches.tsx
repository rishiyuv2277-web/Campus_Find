import { Link, useParams } from 'react-router'
import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemPhoto } from '@/components/ItemPhoto'
import { StatusBadge, TypeBadge } from '@/components/StatusBadge'
import { MatchList } from '@/components/MatchList'
import { useReportSync } from '@/hooks/useReportSync'
import { getReport } from '@/services/reports'
import { findMatches, matching } from '@/utils/matching'
import { CATEGORY_LABEL } from '@/lib/labels'
import { formatDate } from '@/lib/format'

/* The comparison view: the lost report on the left, every plausible found
   report ranked on the right, each one explaining which attributes agreed. */
export default function Matches() {
  useReportSync()
  const { id = '' } = useParams()
  const report = getReport(id)

  if (!report || report.type !== 'lost') {
    return (
      <main id="content" className="mx-auto w-full max-w-2xl px-gutter py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em]">
          {report ? 'This listing is a found item' : 'No lost report with that ID'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {report
            ? 'Matches are compared from a lost report against what has been found. Open a lost report to see its matches.'
            : 'Possible matches are generated for one lost report at a time. Browse your reports to pick one.'}
        </p>
        <Button asChild className="mt-6 h-11 rounded-md px-5">
          <Link to="/dashboard">Go to my reports</Link>
        </Button>
      </main>
    )
  }

  const matches = findMatches(report)
  const strong = matches.filter((m) => m.strength === 'strong').length

  return (
    <main id="content" className="mx-auto w-full max-w-6xl px-gutter py-8 md:py-12">
      <Link
        to={`/items/${report.id}`}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
        Back to {report.id}
      </Link>

      <header className="mt-4 max-w-[62ch]">
        <h2 className="font-display text-4xl font-extrabold tracking-[-0.025em] text-balance md:text-5xl">
          {`Possible matches for your ${report.name.toLowerCase()}`}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          {matches.length === 0
            ? 'Nothing found yet agrees on enough detail. New finds are checked automatically as they are logged.'
            : `${matches.length} found ${matches.length === 1 ? 'report' : 'reports'} share detail with yours${
                strong > 0 ? `, ${strong} of them closely` : ''
              }. Every match below still needs a staff member to confirm it.`}
        </p>
      </header>

      <p className="mt-5 flex max-w-[70ch] items-start gap-2 rounded-md border border-border bg-lavender px-4 py-3 text-sm text-lavender-foreground">
        <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>
          Demo matching. Scores count the attributes that agree — category, name wording, campus location, description
          and distinguishing features.{' '}
          <strong className="font-semibold">No image recognition is used</strong>, and a high score never means an item
          is yours.
        </span>
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <section
          aria-labelledby="lost-report-heading"
          className="overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-24"
        >
          <ItemPhoto
            src={report.image}
            alt={`Photograph filed with lost report ${report.id}: ${report.name}`}
            name={report.name}
            width={4}
            height={3}
            priority
            className="w-full"
          />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-1.5">
              <TypeBadge type="lost" />
              <StatusBadge status={report.status} />
            </div>
            <h2 id="lost-report-heading" className="font-display text-lg leading-snug font-bold">
              {report.name}
            </h2>
            <dl className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Report</dt>
                <dd className="font-mono font-semibold text-foreground">{report.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Category</dt>
                <dd className="text-foreground">{CATEGORY_LABEL[report.category]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last seen</dt>
                <dd className="text-right text-foreground">{formatDate(report.date)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Place</dt>
                <dd className="text-right text-foreground">{report.location}</dd>
              </div>
            </dl>
            <p className="border-t border-border pt-2.5 text-xs text-muted-foreground">{report.features}</p>
          </div>
        </section>

        <section aria-label="Ranked found reports">
          <MatchList
            matches={matches}
            lostReport={report}
            emptyTitle="No plausible matches yet"
            emptyBody="The center re-runs the comparison each time an item is handed in. You can also widen your own report — adding a colour or a mark helps."
          />
        </section>
      </div>

      {matching.apiNote && (
        <p className="mt-10 border-t border-border pt-4 font-mono text-xs text-muted-foreground">{matching.apiNote}</p>
      )}
    </main>
  )
}
