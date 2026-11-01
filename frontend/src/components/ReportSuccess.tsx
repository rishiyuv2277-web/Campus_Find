import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MatchList } from '@/components/MatchList'
import { matching } from '@/utils/matching'
import { formatDate } from '@/lib/format'
import type { ItemReport, MatchResult } from '@/types'

/* The confirmation panel both report flows end on: a receipt, then whatever
   the matcher can offer, always labelled as a suggestion. */

export function ReportSuccess({
  report,
  heading,
  body,
  matches,
  saved,
}: {
  report: ItemReport
  heading: string
  body: string
  matches: MatchResult[]
  saved: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-raised sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success-soft text-success-soft-foreground">
          <CheckCircle2 className="size-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">{heading}</h2>
          <p className="mt-1.5 max-w-[52ch] text-sm text-muted-foreground">{body}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        <div className="bg-background px-4 py-3">
          <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Report ID</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">{report.id}</dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Filed</dt>
          <dd className="mt-0.5 text-sm text-foreground">{formatDate(report.createdAt)}</dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Saved</dt>
          <dd className="mt-0.5 text-sm text-foreground">
            {saved ? 'In this browser only' : 'Memory only — storage blocked'}
          </dd>
        </div>
      </dl>

      {!saved && (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          This browser refused local storage, so the report will disappear when you close the tab. Note the ID down.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="h-11 rounded-md px-5">
          <Link to={`/items/${report.id}`}>
            Open the full report
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="outline" className="h-11 rounded-md px-5" onClick={() => navigate('/dashboard')}>
          Go to my reports
        </Button>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="font-display text-lg font-bold">Possible matches</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo matching compares category, place, wording and distinguishing marks — it is a
          suggestion. A person at the center confirms ownership.
        </p>
        <div className="mt-4">
          <MatchList
            matches={matches}
            lostReport={report}
            emptyTitle="No candidate found yet"
            emptyBody="Your report stays open on the shelf. The center checks every new hand-in against it, and you can re-run the comparison from your dashboard."
          />
        </div>
        {matching.apiNote && <p className="mt-4 text-xs text-muted-foreground">{matching.apiNote}</p>}
      </div>
    </div>
  )
}
