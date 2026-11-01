import { Link } from 'react-router'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { ItemPhoto } from '@/components/ItemPhoto'
import { StatusBadge, TypeBadge } from '@/components/StatusBadge'
import { CATEGORIES } from '@/data/campus'
import { formatDate } from '@/lib/format'
import type { ItemReport } from '@/types'

const categoryLabel = (id: ItemReport['category']) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? 'Other'

/* The whole card is the link, so the card gets the focus ring and the hover
   lift; no nested interactive elements inside it. */
export function ItemCard({ report }: { report: ItemReport }) {
  return (
    <Link
      to={`/items/${report.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-raised transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative">
        <ItemPhoto
          src={report.image}
          alt={`${report.name} — ${report.type === 'lost' ? 'reported lost' : 'found'} at ${report.location}`}
          name={report.name}
          width={640}
          height={480}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <TypeBadge type={report.type} />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex justify-end">
          <StatusBadge status={report.status} className="shadow-raised" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[1.0625rem] leading-snug font-semibold text-foreground">
            {report.name}
          </h2>
          <span className="mt-0.5 shrink-0 font-label text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
            {report.id}
          </span>
        </div>
        <p className="font-label text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
          {categoryLabel(report.category)}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-sm text-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-muted-foreground" aria-hidden="true" strokeWidth={2} />
            {report.location}
          </span>
          <span className="text-muted-foreground">{formatDate(report.date)}</span>
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          View details
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
