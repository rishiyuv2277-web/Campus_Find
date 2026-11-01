import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Hand,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemPhoto } from '@/components/ItemPhoto'
import { StatusBadge, TypeBadge } from '@/components/StatusBadge'
import { MatchList } from '@/components/MatchList'
import { TextAreaField, TextField } from '@/components/FormFields'
import { useSession } from '@/hooks/useSession'
import { createClaim, getReport, updateReport } from '@/services/reports'
import { useReportSync } from '@/hooks/useReportSync'
import { findMatches, matching } from '@/utils/matching'
import { CATEGORY_LABEL } from '@/lib/labels'
import { formatDate, formatTime } from '@/lib/format'
import type { ItemReport } from '@/types'

export default function ItemDetail() {
  const { id = '' } = useParams()
  const revision = useReportSync()
  const { user } = useSession()
  const [report, setReport] = useState<ItemReport | undefined>(() => getReport(id))
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const found = getReport(id)
    setReport(found)
    setNotFound(!found)
  }, [id, revision])

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-2xl px-gutter py-20 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em]">No listing with that ID</h2>
        <p className="mt-3 text-muted-foreground">
          Report <span className="font-mono">{id}</span> is not on this shelf. It may have been withdrawn by the
          student who filed it.
        </p>
        <Button asChild className="mt-6 h-11 rounded-md px-5">
          <Link to="/browse">Back to all items</Link>
        </Button>
      </main>
    )
  }

  if (!report) return null

  const matches = report.type === 'lost' ? findMatches(report) : []
  const isMine = report.reporterId === user?.id

  return (
    <main className="mx-auto w-full max-w-6xl px-gutter py-8 md:py-12">
      <Link
        to="/browse"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
        All items
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <ItemPhoto
            src={report.image}
            alt={`${report.name} — ${report.type === 'lost' ? 'reported lost' : 'reported found'} at ${report.location}, photograph filed with the report`}
            name={report.name}
            width={4}
            height={3}
            priority
            className="w-full rounded-xl border border-border shadow-raised"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold text-muted-foreground">
              {report.id}
            </span>
            {report.handover && (
              <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                {report.handover === 'handed-over' ? 'Reported handed to center' : 'Found by student — with them'}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.025em] text-balance md:text-[2.75rem] md:leading-[1.05]">
            {report.name}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{report.description}</p>

          <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            <div className="bg-background px-4 py-3">
              <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Category
              </dt>
              <dd className="mt-0.5 text-sm font-medium">{CATEGORY_LABEL[report.category]}</dd>
            </div>
            <div className="bg-background px-4 py-3">
              <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {report.type === 'lost' ? 'Date lost' : 'Date found'}
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="size-3.5 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                {formatDate(report.date)}
                {report.time && <span className="text-muted-foreground">· {formatTime(report.time)}</span>}
              </dd>
            </div>
            <div className="bg-background px-4 py-3 sm:col-span-2">
              <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {report.type === 'lost' ? 'Last seen at' : 'Found at'}
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="size-3.5 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                {report.location}
              </dd>
            </div>
            <div className="bg-background px-4 py-3 sm:col-span-2">
              <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Distinguishing features
              </dt>
              <dd className="mt-0.5 text-sm">{report.features}</dd>
            </div>
            <div className="bg-background px-4 py-3 sm:col-span-2">
              <dt className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Recovery status
              </dt>
              <dd className="mt-0.5 text-sm">
                {report.status === 'returned'
                  ? 'Recovered and collected from the center.'
                  : report.status === 'matched'
                    ? 'A likely match has been put forward. The center is verifying ownership.'
                    : report.status === 'under-review'
                      ? 'At the center, being reviewed against open lost reports.'
                      : 'Open — waiting for the owner or the finder to come forward.'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-md bg-muted/70 px-3 py-2.5 text-xs text-muted-foreground">
            <Clock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            Filed on {formatDate(report.createdAt)} by {report.reporterName}. Contact details are held by the center
            and never shown on a public listing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {report.type === 'found' ? (
              <Button asChild className="h-12 rounded-md px-5 text-base">
                <a href="#claim">
                  <Hand className="size-4" strokeWidth={2} aria-hidden="true" />I think this is my item
                </a>
              </Button>
            ) : (
              <Button asChild className="h-12 rounded-md px-5 text-base">
                <Link to={`/matches/${report.id}`}>
                  <Search className="size-4" strokeWidth={2} aria-hidden="true" />
                  Check possible matches
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="h-12 rounded-md px-5">
              <Link to={`/browse?type=${report.type === 'found' ? 'found' : 'lost'}`}>
                Browse similar {report.type === 'found' ? 'finds' : 'losses'}
              </Link>
            </Button>
          </div>

          {isMine && report.status !== 'returned' && <OwnerControls report={report} onChange={setReport} />}
        </div>
      </div>

      {report.type === 'found' && <ClaimForm report={report} />}

      {report.type === 'lost' && (
        <section aria-labelledby="matches-heading" className="mt-14 border-t border-border pt-10">
          <h2 id="matches-heading" className="font-display text-2xl font-extrabold tracking-[-0.02em]">
            Possible found items
          </h2>
          <p className="mt-1.5 max-w-[60ch] text-sm text-muted-foreground">
            Ranked against this report's category, place, wording and features. Demo matching, not image
            recognition.
          </p>
          <div className="mt-5">
            <MatchList
              matches={matches}
              lostReport={report}
              emptyTitle="Nothing on the shelf yet"
              emptyBody="No found report currently shares enough detail with this one. The center compares every new hand-in as it arrives."
            />
          </div>
          {matching.apiNote && <p className="mt-4 text-xs text-muted-foreground">{matching.apiNote}</p>}
        </section>
      )}
    </main>
  )
}

/* Edit and withdraw, offered only on a report this demo student filed. */
function OwnerControls({ report, onChange }: { report: ItemReport; onChange: (r: ItemReport) => void }) {
  const [withdrawing, setWithdrawing] = useState(false)
  const [removed, setRemoved] = useState(false)

  if (removed) {
    return (
      <p className="mt-6 rounded-md border border-border bg-muted/60 px-4 py-3 text-sm">
        This report has been withdrawn.{' '}
        <Link to="/dashboard" className="font-semibold underline underline-offset-2">
          Back to my reports
        </Link>
      </p>
    )
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <p className="font-label text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Your report
      </p>
      <p className="mt-1 text-sm text-muted-foreground">You filed this one, so you can update it or take it down.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="h-10 rounded-md px-3"
          onClick={async () => {
            try { const next = await updateReport(report.id, { status: 'under-review' }); if (next) onChange(next) } catch (error) { window.alert(error instanceof Error ? error.message : 'Could not update report.') }
          }}
          disabled={report.status === 'under-review'}
        >
          Mark as under review
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-md px-3 text-destructive"
          disabled={withdrawing}
          onClick={async () => {
            setWithdrawing(true)
            try { const next = await updateReport(report.id, { status: 'returned', description: report.description }); if (next) onChange(next) } catch (error) { window.alert(error instanceof Error ? error.message : 'Could not update report.') }
            setWithdrawing(false)
          }}
        >
          {withdrawing && <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />}
          Withdraw from the shelf
        </Button>
        <Button variant="ghost" className="h-10 rounded-md px-3" onClick={() => setRemoved(true)}>
          Hide this panel
        </Button>
      </div>
    </div>
  )
}

/* The claim form. It asks for one detail the listing does not print, and it
   says plainly that nothing is released on the strength of the form alone. */
function ClaimForm({ report }: { report: ItemReport }) {
  const { user } = useSession()
  const [values, setValues] = useState({ name: user?.name ?? '', email: user?.email ?? '', secret: '', message: '' })
  const [errors, setErrors] = useState<{ name?: string; email?: string; secret?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [claimId, setClaimId] = useState<string | null>(null)
  const [saved, setSaved] = useState(true)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const e: typeof errors = {}
    if (!values.name.trim()) e.name = 'Your name goes on the claim.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) e.email = 'We need an email to send the decision to.'
    if (values.secret.trim().length < 8)
      e.secret = 'Describe a detail not printed above — at least eight characters.'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
    const { claim, saved: stored } = await createClaim({
      reportId: report.id,
      claimantName: values.name.trim(),
      claimantEmail: values.email.trim(),
      secretDetail: values.secret.trim(),
      message: values.message.trim(),
    })
    setSaved(stored)
    setClaimId(claim.id)
    setSubmitting(false)
    } catch (error) {
      setSaved(false)
      setSubmitting(false)
      window.alert(error instanceof Error ? error.message : 'Could not submit claim.')
    }
  }

  return (
    <section id="claim" aria-labelledby="claim-heading" className="mt-14 scroll-mt-24 border-t border-border pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div>
          <h2 id="claim-heading" className="font-display text-2xl font-extrabold tracking-[-0.02em]">
            Claim this item
          </h2>
          <p className="mt-1.5 max-w-[58ch] text-sm text-muted-foreground">
            Tell the center something a stranger could not know from this page. If it matches, you are called in to
            collect — with your ID card.
          </p>

          {claimId ? (
            <div className="mt-5 rounded-lg border border-border bg-background p-5 shadow-raised">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
                <div>
                  <h3 className="font-display text-lg font-bold">Claim {claimId} submitted</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Status: <span className="font-medium text-foreground">Pending review</span>. This is a prototype —
                    {' '}
                    {saved
                      ? 'the claim is saved in this browser and no email has been sent.'
                      : 'storage was blocked, so the claim is not saved beyond this tab.'}
                  </p>
                  <p className="mt-2 text-sm">
                    Track it under the Claims tab on{' '}
                    <Link to="/dashboard" className="font-semibold underline underline-offset-2">
                      your reports
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="mt-5 space-y-4 rounded-lg border border-border bg-background p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="claim-name"
                  label="Your name"
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  error={errors.name}
                />
                <TextField
                  id="claim-email"
                  label="College email"
                  type="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  error={errors.email}
                />
              </div>
              <TextAreaField
                id="claim-secret"
                label="A private identifying detail"
                placeholder="Something not described in the listing — a mark, a name inside, a serial number."
                value={values.secret}
                onChange={(e) => setValues((v) => ({ ...v, secret: e.target.value }))}
                error={errors.secret}
                hint="The staff member compares this with the finder's note. It is never published."
              />
              <TextAreaField
                id="claim-message"
                label="Anything else for the center"
                optional
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              />
              <Button type="submit" className="h-11 rounded-md px-5" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />}
                {submitting ? 'Submitting claim…' : 'Submit claim for verification'}
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <ShieldCheck className="size-4 text-success" strokeWidth={2} aria-hidden="true" />
            How a claim is checked
          </h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="font-mono text-xs font-bold text-foreground">01</span>
              Staff compare your detail with the finder's note.
            </li>
            <li className="flex gap-2.5">
              <span className="font-mono text-xs font-bold text-foreground">02</span>
              You are given a collection slot and a claim code.
            </li>
            <li className="flex gap-2.5">
              <span className="font-mono text-xs font-bold text-foreground">03</span>
              Bring your college ID. Nothing leaves the desk without it.
            </li>
          </ol>
          <p className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            A claim is a request, not a confirmation. The listing stays available until staff mark it returned.
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Reference this listing as <span className="font-mono">{report.id}</span> at the desk.
          </p>
        </aside>
      </div>
    </section>
  )
}
