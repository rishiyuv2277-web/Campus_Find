import { Link } from 'react-router'
import { ArrowRight, Info } from 'lucide-react'
import { ItemPhoto } from '@/components/ItemPhoto'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABEL } from '@/lib/labels'
import { relevance, STRENGTH_LABEL } from '@/utils/matching'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ItemReport, MatchResult } from '@/types'

export function RelevanceBar({ score }: { score: number }) {
  const pct = relevance(score)
  return (
    <div className="flex items-center gap-2">
      <div
        role="meter"
        aria-label="Demo match relevance"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs font-semibold text-muted-foreground">{pct}%</span>
    </div>
  )
}

/* The ranked candidate list. Shared by the success panel, the item detail page
   and the dedicated comparison page, so a match reads the same everywhere. */

export function MatchList({
  matches,
  lostReport,
  emptyTitle,
  emptyBody,
  compact = false,
}: {
  matches: MatchResult[]
  lostReport: ItemReport
  emptyTitle: string
  emptyBody: string
  compact?: boolean
}) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
        <h3 className="font-display text-lg font-bold">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted-foreground">{emptyBody}</p>
        <Button asChild variant="outline" className="mt-5 h-11 rounded-md border-border bg-background px-4">
          <Link to="/browse?type=found">
            Browse found items
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {matches.map((m) => (
        <li
          key={m.report.id}
          className="rounded-lg border border-border bg-background p-3 transition-shadow duration-150 hover:shadow-raised sm:p-4"
        >
          <div className="flex gap-3 sm:gap-4">
            <ItemPhoto
              src={m.report.image}
              alt={`${m.report.name} reported found at ${m.report.location}`}
              name={m.report.name}
              width={1}
              height={1}
              className={cn('size-20 shrink-0 rounded-md sm:size-24', compact && 'size-16 sm:size-20')}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-label text-[10px] font-bold tracking-[0.06em] uppercase',
                    m.strength === 'strong' && 'bg-success-soft text-success-soft-foreground',
                    m.strength === 'possible' && 'bg-accent text-accent-foreground',
                    m.strength === 'weak' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {STRENGTH_LABEL[m.strength]} · {m.score}/5
                </span>
                <span className="truncate text-sm font-semibold text-foreground">{m.report.name}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {CATEGORY_LABEL[m.report.category]} · {m.report.location} · {formatDate(m.report.date)} ·{' '}
                <span className="font-mono">{m.report.id}</span>
              </p>
              <ul className="mt-2 space-y-0.5">
                {m.reasons.map((reason) => (
                  <li key={reason} className="flex gap-1.5 text-xs text-foreground/80">
                    <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-success" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <RelevanceBar score={m.score} />
            <div className="ml-auto flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="h-9 rounded-md px-3">
                <Link to={`/items/${m.report.id}`}>View found item</Link>
              </Button>
              <Button asChild size="sm" className="h-9 rounded-md px-3">
                <Link to={`/items/${m.report.id}#claim`}>Request verification</Link>
              </Button>
            </div>
          </div>
        </li>
      ))}
      <li className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>
          Ranked by how many attributes agree with report <span className="font-mono">{lostReport.id}</span>. This
          is a suggestion, not a finding — the center checks ownership before releasing anything.
        </span>
      </li>
    </ul>
  )
}
