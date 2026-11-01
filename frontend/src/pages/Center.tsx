import { Link } from 'react-router'
import { Clock, IdCard, Mail, MapPin, Phone, ShieldCheck, Stamp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, TypeBadge } from '@/components/StatusBadge'
import { CENTER } from '@/data/campus'
import { useReportSync } from '@/hooks/useReportSync'
import { listClaims, listReports } from '@/services/reports'
import { CATEGORY_LABEL } from '@/lib/labels'
import { formatDate } from '@/lib/format'

const HAND_IN = [
  {
    title: 'Photograph it where you found it',
    body: 'The place is part of the match. One photo on your phone is enough — the listing form takes it from your device.',
  },
  {
    title: 'File the found report',
    body: 'Name, category, location and one distinguishing detail. Choose “still with me” if you have not been to the desk yet.',
  },
  {
    title: 'Walk it to Room A-012',
    body: 'Hand it in within two working days. Staff log it, which changes the listing from found-by-student to received-by-center.',
  },
]

const COLLECT = [
  {
    step: 'Claim the listing',
    body: 'Open the found item and choose “I think this is my item”. Describe one private detail that is not printed on the public page.',
  },
  {
    step: 'Wait for verification',
    body: 'A staff member compares your detail with the finder’s note. You get an answer at your college email, usually within a day.',
  },
  {
    step: 'Collect in person with ID',
    body: 'Carry your college ID card and your claim code to the desk inside the published hours. Nothing is released without both.',
  },
  {
    step: 'Sign the register',
    body: 'The item is marked returned and is removed from the public shelf the same day.',
  },
]

export default function Center() {
  useReportSync()
  const reports = listReports()
  const claims = listClaims()

  const received = reports.filter((r) => r.type === 'found' && r.handover === 'handed-over')
  const withStudents = reports.filter((r) => r.type === 'found' && r.handover === 'with-student')
  const returned = reports.filter((r) => r.status === 'returned')
  const pending = claims.filter((c) => c.status === 'pending')

  return (
    <main id="content" className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent)_100%,transparent),transparent)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-gutter py-12 md:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="font-label text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              The recovery desk
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] text-balance md:text-6xl">
              One room on campus holds everything found.
            </h1>
            <p className="mt-4 max-w-[52ch] text-base text-muted-foreground">
              {CENTER.name} keeps every logged item behind a single counter, so a listing on CampusFind is a real
              object you can collect — not a promise on a notice board.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-md px-5 text-base">
                <Link to="/browse?type=found">Browse what is on the shelf</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-md px-5">
                <Link to="/report-found">Report something you found</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-raised">
            <img
              src="/images/center-desk.webp"
              alt="A staff member at a campus help counter handing a form across the desk to a student"
              width={1200}
              height={800}
              className="aspect-[3/2] w-full object-cover"
            />
            <dl className="flex flex-col divide-y divide-border">
              <div className="flex gap-3 px-5 py-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                <div>
                   <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                     Where
                   </dt>
                   <dd className="sr-only">The desk's location</dd>
                  <dd className="text-sm font-medium">
                    {CENTER.block} — {CENTER.room}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 px-5 py-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                <div>
                   <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                     Hours
                   </dt>
                   <dd className="sr-only">Opening hours by day</dd>
                  <dd className="space-y-0.5 text-sm">
                    {CENTER.hours.map((h) => (
                      <span key={h.day} className="block">
                        <span className="text-muted-foreground">{h.day}</span> · {h.time}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 py-3 text-sm">
                <a
                  href={`tel:${CENTER.phone.replace(/\s/g, '')}`}
                  className="inline-flex min-h-11 items-center gap-2 font-medium transition-colors duration-150 hover:text-success"
                >
                  <Phone className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                  {CENTER.phone}
                </a>
                <a
                  href={`mailto:${CENTER.email}`}
                  className="inline-flex min-h-11 items-center gap-2 font-medium transition-colors duration-150 hover:text-success"
                >
                  <Mail className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                  {CENTER.email}
                </a>
              </div>
            </dl>
            <p className="border-t border-border bg-muted/60 px-5 py-2.5 text-xs text-muted-foreground">
              Room, hours and phone numbers are placeholders for this college project.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="hand-in-heading" className="mx-auto w-full max-w-6xl px-gutter py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <h2 id="hand-in-heading" className="font-display text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              If you found something
            </h2>
            <ol className="mt-6 space-y-5">
              {HAND_IN.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
            <h2 id="claim-heading" className="font-display text-3xl font-extrabold tracking-[-0.025em] text-primary-foreground md:text-4xl">
              If you lost something
            </h2>
            <ol className="mt-6 space-y-5">
              {COLLECT.map((item, i) => (
                <li key={item.step} className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-primary-foreground/75">0{i + 1}</span>
                  <div>
                    <h3 className="text-[1rem] font-semibold text-primary-foreground">{item.step}</h3>
                    <p className="mt-1 text-sm text-primary-foreground/85">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-7 flex items-start gap-2.5 border-t border-primary-foreground/15 pt-5 text-sm text-primary-foreground/85">
              <IdCard className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Verification is not a formality. Staff will ask you to describe the item before it is handed over, and
              the desk will not release anything to a friend without written authorisation.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="board-heading" className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-gutter py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="board-heading" className="font-display text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
                Behind the counter
              </h2>
              <p className="mt-2 max-w-[54ch] text-sm text-muted-foreground">
                A prototype of the staff view — every figure below is read from this browser's demo data, not from a
                database.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-label text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              <Stamp className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Admin prototype
            </span>
          </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: 'Received at the desk', value: received.length },
              { label: 'Still with a student', value: withStudents.length },
              { label: 'Pending claims', value: pending.length },
              { label: 'Returned to owners', value: returned.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.02em]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
              <caption className="sr-only">Items currently in the demo inventory, with desk status</caption>
              <thead>
                <tr className="border-b border-border bg-muted/60 font-label text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Item</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Report</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">At the desk</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 8).map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap">
                      <Link to={`/items/${r.id}`} className="underline-offset-4 hover:underline">
                        {r.name}
                      </Link>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {CATEGORY_LABEL[r.category]} · {formatDate(r.date)}
                      </span>
                    </th>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-3">
                      <TypeBadge type={r.type} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.type === 'found'
                        ? r.handover === 'handed-over'
                          ? 'Logged by staff'
                          : 'With the finder'
                        : 'Not on the shelf'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pending.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-background p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold">
                <ShieldCheck className="size-4 text-success" strokeWidth={2} aria-hidden="true" />
                Claims awaiting verification
              </h3>
              <ul className="mt-3 divide-y divide-border">
                {pending.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{c.id}</span>{' '}
                      <span className="font-medium">{c.claimantName}</span> for{' '}
                      <Link to={`/items/${c.reportId}`} className="font-mono text-xs underline underline-offset-2">
                        {c.reportId}
                      </Link>
                    </span>
                    <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold">
                      Review in dashboard
                      <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-gutter py-14 text-center md:py-20">
        <h2 className="mx-auto max-w-[22ch] font-display text-3xl font-extrabold tracking-[-0.03em] text-balance md:text-4xl">
          Checked something in? Tell the shelf.
        </h2>
        <p className="mx-auto mt-3 max-w-[48ch] text-sm text-muted-foreground">
          A listing takes two minutes and it is the only way an owner knows what has been found.
        </p>
        <Button asChild className="mt-6 h-12 rounded-md px-6 text-base">
          <Link to="/report-found">Report a found item</Link>
        </Button>
      </section>
    </main>
  )
}
