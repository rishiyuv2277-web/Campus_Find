import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  ClipboardList,
  Loader2,
  LogOut,
  PackageSearch,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, TypeBadge } from '@/components/StatusBadge'
import { ItemPhoto } from '@/components/ItemPhoto'
import { deleteReport, listClaims, myReports, resetDemoData, setClaimStatus, updateReport } from '@/services/reports'
import { isApiConfigured } from '@/services/api'
import { useSession } from '@/hooks/useSession'
import { useReportSync } from '@/hooks/useReportSync'
import { findMatches } from '@/utils/matching'
import { CATEGORY_LABEL } from '@/lib/labels'
import { formatDate, initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ClaimRequest, ItemReport } from '@/types'

type Tab = 'all' | 'lost' | 'found' | 'claims'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All reports' },
  { id: 'lost', label: 'Lost' },
  { id: 'found', label: 'Found' },
  { id: 'claims', label: 'Claims' },
]

export default function Dashboard() {
  /* The signed-in student is whoever signed up on this device — never a seeded
     demo name. Without a session the gate sends them to /login. */
  const { user } = useSession()
  const revision = useReportSync()
  const [reports, setReports] = useState<ItemReport[]>(() => myReports())
  const [claims, setClaims] = useState<ClaimRequest[]>(() => listClaims())
  const [tab, setTab] = useState<Tab>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const lost = reports.filter((r) => r.type === 'lost')
  const found = reports.filter((r) => r.type === 'found')
  const resolved = reports.filter((r) => r.status === 'returned')
  const matchesForMine = useMemo(
    () => lost.reduce((sum, r) => sum + findMatches(r).filter((m) => m.score >= 3).length, 0),
    [lost],
  )

  const shown = tab === 'all' ? reports : tab === 'lost' ? lost : tab === 'found' ? found : []

  const refresh = async () => {
    setReports(myReports())
    setClaims(listClaims())
  }

  useEffect(() => { void refresh() }, [revision, user?.id])

  const withdraw = async (id: string) => {
    setBusy(id)
    try { await deleteReport(id); await refresh() }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Could not withdraw report.') }
    finally { setBusy(null) }
  }

  const markReview = async (id: string) => {
    try { await updateReport(id, { status: 'under-review' }); await refresh() }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Could not update report.') }
  }

  const decideClaim = async (claim: ClaimRequest, status: ClaimRequest['status']) => {
    try {
      await setClaimStatus(claim.id, status)
      if (status === 'approved') await updateReport(claim.reportId, { status: 'returned' })
      await refresh()
    } catch (error) { window.alert(error instanceof Error ? error.message : 'Could not update claim.') }
  }

  const resetAll = () => {
    resetDemoData()
    void refresh()
  }

  const summary = [
    { label: 'My lost reports', value: lost.length, Icon: Search },
    { label: 'My found reports', value: found.length, Icon: PackageSearch },
    { label: 'Possible matches', value: matchesForMine, Icon: ClipboardList },
    { label: 'Resolved', value: resolved.length, Icon: BadgeCheck },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl px-gutter py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-label text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            My reports
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Hello, {(user?.name ?? 'there').split(' ')[0]}.
          </h1>
          <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground">
            Everything you have reported on CampusFind, and every claim you have open. {isApiConfigured ? 'Your reports and claims are loaded from the shared CampusFind service.' : 'This preview stores reports in this browser until the Java backend URL is configured.'}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
            {initials(user?.name ?? 'CampusFind')}
          </span>
          <div className="text-sm">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.rollNo}
              {user?.department ? ` · ${user.department}` : ''}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {summary.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-background p-4">
            <dt className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              {label}
              <Icon className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
            </dt>
            <dd className="mt-2 font-display text-3xl font-extrabold tracking-[-0.02em]">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 id="reports-heading" className="sr-only">Your reports and claims</h2>
      <header className="mt-9 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div role="tablist" aria-label="Report filters" className="-mb-px flex flex-wrap gap-1">
          {TABS.map((t) => {
            const count = t.id === 'all' ? reports.length : t.id === 'lost' ? lost.length : t.id === 'found' ? found.length : claims.length
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn(
                  'min-h-11 rounded-t-md border-b-2 px-3 text-sm font-medium transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
        <Button asChild variant="outline" className="mb-2 h-10 rounded-md px-3">
          <Link to="/report-lost">
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            New report
          </Link>
        </Button>
      </header>

      <section
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mt-6"
        tabIndex={-1}
      >
        {tab === 'claims' ? (
          <ClaimsPanel claims={claims} reports={reports} onDecide={decideClaim} />
        ) : shown.length === 0 ? (
          <EmptyReports tab={tab} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {shown.map((report) => (
              <li key={report.id}>
                <ReportCard
                  report={report}
                  busy={busy === report.id}
                  onWithdraw={() => withdraw(report.id)}
                  onReview={() => markReview(report.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="demo-tools-heading" className="mt-12 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h3 id="demo-tools-heading" className="font-display text-lg font-bold">
          {isApiConfigured ? 'Shared CampusFind service' : 'Sample data tools'}
        </h3>
        <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
          {isApiConfigured
            ? 'Your account uses the Java API. Reports and claims are loaded from the shared service; sample listings remain available as examples.'
            : "This preview stores reports and claims in this browser's local storage. Configure VITE_API_BASE_URL after deploying the Java backend to enable shared data."}
        </p>
        {!isApiConfigured && <Button variant="outline" className="mt-4 h-10 rounded-md px-4" onClick={resetAll}>
          <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
          Reset sample data
        </Button>}
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <LogOut className="size-3.5" strokeWidth={2} aria-hidden="true" />
          {isApiConfigured ? 'Authentication is handled by the Java backend using hashed passwords and server-side sessions.' : 'Demo authentication is local to this browser and is not secure.'}
        </p>
      </section>
    </main>
  )
}

function ReportCard({
  report,
  busy,
  onWithdraw,
  onReview,
}: {
  report: ItemReport
  busy: boolean
  onWithdraw: () => void
  onReview: () => void
}) {
  const open = report.status === 'open' || report.status === 'under-review'
  const matches = report.type === 'lost' ? findMatches(report).filter((m) => m.score >= 3) : []

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-background p-3 sm:flex-row">
      <ItemPhoto
        src={report.image}
        alt={`Photograph filed with ${report.type} report ${report.id}: ${report.name}`}
        name={report.name}
        width={4}
        height={3}
        className="h-24 w-28 shrink-0 rounded-md sm:h-28 sm:w-32"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <TypeBadge type={report.type} />
          <StatusBadge status={report.status} />
        </div>
        <h3 className="mt-1.5 truncate font-display text-base font-bold">{report.name}</h3>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABEL[report.category]} · {report.location} · {formatDate(report.date)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{report.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2.5">
          <Button asChild variant="outline" className="h-9 rounded-md px-3 text-xs">
            <Link to={`/items/${report.id}`}>
              View details
              <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </Link>
          </Button>
          {report.type === 'lost' && (
            <Button asChild variant="ghost" className="h-9 rounded-md px-2.5 text-xs">
              <Link to={`/matches/${report.id}`}>
                Matches
                {matches.length > 0 && (
                  <span className="rounded-full bg-success-soft px-1.5 font-mono text-[10px] font-bold text-success-soft-foreground">
                    {matches.length}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {open && (
            <>
              <Button variant="ghost" className="h-9 rounded-md px-2.5 text-xs" onClick={onReview}>
                Edit status
              </Button>
              <Button
                variant="ghost"
                className="h-9 rounded-md px-2.5 text-xs text-destructive"
                onClick={onWithdraw}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
                )}
                Withdraw
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function ClaimsPanel({
  claims,
  reports,
  onDecide,
}: {
  claims: ClaimRequest[]
  reports: ItemReport[]
  onDecide: (claim: ClaimRequest, status: ClaimRequest['status']) => void
}) {
  if (claims.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
        <CircleCheck className="mx-auto size-8 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
        <h3 className="mt-3 font-display text-lg font-bold">No claims yet</h3>
        <p className="mx-auto mt-1.5 max-w-[46ch] text-sm text-muted-foreground">
          When you spot something that might be yours on a found listing, open it and choose{' '}
          <span className="font-medium text-foreground">“I think this is my item”</span>. The claim appears here with
          its status.
        </p>
        <Button asChild variant="outline" className="mt-5 h-11 rounded-md bg-background px-4">
          <Link to="/browse?type=found">Browse found items</Link>
        </Button>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {claims.map((claim) => {
        const report = reports.find((r) => r.id === claim.reportId)
        return (
          <li key={claim.id} className="rounded-xl border border-border bg-background p-4 shadow-raised">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{claim.id}</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 font-label text-[11px] font-semibold tracking-[0.06em] uppercase',
                      claim.status === 'pending' && 'bg-warning-soft text-warning-soft-foreground',
                      claim.status === 'approved' && 'bg-success-soft text-success-soft-foreground',
                      claim.status === 'declined' && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {claim.status === 'pending' ? 'Pending review' : claim.status === 'approved' ? 'Approved' : 'Declined'}
                  </span>
                </div>
                <h3 className="mt-1.5 font-display text-base font-bold">
                  {report ? report.name : 'Listing withdrawn'}{' '}
                  <span className="font-normal text-muted-foreground">· {claim.reportId}</span>
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">Your note: “{claim.secretDetail}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Filed {formatDate(claim.createdAt.slice(0, 10))}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report && (
                  <Button asChild variant="outline" className="h-9 rounded-md px-3 text-xs">
                    <Link to={`/items/${report.id}`}>View listing</Link>
                  </Button>
                )}
                {claim.status === 'pending' && (
                  <Button variant="ghost" className="h-9 rounded-md px-3 text-xs" onClick={() => onDecide(claim, 'declined')}>
                    Cancel claim
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-2.5 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              In this prototype the buttons stand in for the center's decision desk, so you can see both outcomes. In
              the finished system only staff at Room A-012 change a claim's status.
            </p>
          </li>
        )
      })}
    </ul>
  )
}

function EmptyReports({ tab }: { tab: Tab }) {
  const lost = tab === 'lost'
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <CircleCheck className="mx-auto size-8 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
      <h3 className="mt-3 font-display text-lg font-bold">
        {lost ? 'No lost reports filed' : tab === 'found' ? 'No found reports filed' : 'Nothing filed yet'}
      </h3>
      <p className="mx-auto mt-1.5 max-w-[46ch] text-sm text-muted-foreground">
        {lost
          ? 'If something has gone missing, file it now — reporting it early is what makes matching work.'
          : tab === 'found'
            ? 'Picked something up on campus? Report it so the owner can find their way to it.'
            : 'Your filed reports appear here with their status, matches and next step.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild className="h-11 rounded-md px-4">
          <Link to="/report-lost">Report a lost item</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-md bg-background px-4">
          <Link to="/report-found">Report a found item</Link>
        </Button>
      </div>
    </div>
  )
}
