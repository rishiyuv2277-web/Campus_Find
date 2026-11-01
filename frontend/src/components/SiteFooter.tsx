import { Link } from 'react-router'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Brand } from '@/components/Brand'
import { PhotoCredits } from '@/components/PhotoCredits'
import { CATEGORIES, CENTER } from '@/data/campus'

const columns = [
  {
    title: 'Find your item',
    links: [
      { to: '/browse', label: 'Browse found items' },
      { to: '/report-lost', label: 'Report a lost item' },
      { to: '/report-found', label: 'Report a found item' },
      { to: '/dashboard', label: 'My reports and claims' },
    ],
  },
  {
    title: 'The center',
    links: [
      { to: '/center', label: 'Location and opening hours' },
      { to: '/center', label: 'How to hand in an item' },
      { to: '/center', label: 'How to claim an item' },
      { to: '/center', label: 'Center records (prototype)' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-content px-gutter py-section">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Brand tone="light" />
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/75">
              The college-wide lost and found desk for Sri Venkateswara Institute of Technology.
              Report it, browse the shelf, and collect it once the center has verified it is
              yours.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-1 font-label text-[11px] font-semibold tracking-[0.08em] uppercase text-primary-foreground/80">
              Frontend prototype · demo data
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-label text-[11px] font-semibold tracking-[0.12em] uppercase text-primary-foreground/60">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="rounded text-[color-mix(in_oklch,var(--primary-foreground)_88%,var(--primary))] transition-colors duration-150 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-label text-[11px] font-semibold tracking-[0.12em] uppercase text-primary-foreground/60">
              Center contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-foreground/60" strokeWidth={2} aria-hidden="true" />
                <span>
                  {CENTER.name}
                  <br />
                  {CENTER.block}, {CENTER.room}
                </span>
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary-foreground/60" strokeWidth={2} aria-hidden="true" />
                <span>Mon – Fri, 9:30 am – 5:00 pm</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary-foreground/60" strokeWidth={2} aria-hidden="true" />
                <a href={`tel:${CENTER.phone.replace(/\s/g, '')}`} className="hover:underline">
                  {CENTER.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary-foreground/60" strokeWidth={2} aria-hidden="true" />
                <a href={`mailto:${CENTER.email}`} className="break-all hover:underline">
                  {CENTER.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <nav aria-label="Categories" className="mt-10 border-t border-white/15 pt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/browse?category=${c.id}`}
                  className="rounded text-[color-mix(in_oklch,var(--primary-foreground)_88%,var(--primary))] hover:underline"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-primary-foreground/85 md:flex-row md:items-center md:justify-between">
          <p>
            Sri Venkateswara Institute of Technology, Bengaluru 560 064 · An internal college project.
            Records are stored in this browser only.
          </p>
          <PhotoCredits />
        </div>
      </div>
    </footer>
  )
}
