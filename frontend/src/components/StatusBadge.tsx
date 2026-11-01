import { CheckCircle2, Clock, MessageSquareDot, PackageSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportStatus, ReportType } from '@/types'

const statusStyle: Record<ReportStatus, { label: string; className: string; Icon: typeof Clock }> = {
  open: {
    label: 'Open',
    className: 'bg-warning-soft text-warning-soft-foreground',
    Icon: Clock,
  },
  'under-review': {
    label: 'Under review',
    className: 'bg-lavender text-lavender-foreground',
    Icon: MessageSquareDot,
  },
  matched: {
    label: 'Matched',
    className: 'bg-accent text-accent-foreground',
    Icon: PackageSearch,
  },
  returned: {
    label: 'Returned',
    className: 'bg-success-soft text-success-soft-foreground',
    Icon: CheckCircle2,
  },
}

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const { label, className: tone, Icon } = statusStyle[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label text-[11px] font-semibold tracking-[0.06em] uppercase',
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" strokeWidth={2} />
      {label}
    </span>
  )
}

/** Lost is the ink; Found is the teal, so the two never read as the same thing. */
export function TypeBadge({ type, className }: { type: ReportType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label text-[11px] font-semibold tracking-[0.06em] uppercase',
        type === 'lost' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground',
        className,
      )}
    >
      {type === 'lost' ? 'Lost' : 'Found'}
    </span>
  )
}

export function HandoverBadge({ state }: { state: 'with-student' | 'handed-over' }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-label text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
      {state === 'handed-over' ? 'Received by center' : 'Found by student'}
    </span>
  )
}
