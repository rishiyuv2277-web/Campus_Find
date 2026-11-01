import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { SiteLayout } from '@/layouts/SiteLayout'
import { Meta } from '@/components/Meta'
import { RequireAuth } from '@/components/RequireAuth'
import Login from '@/pages/Login'

/* Routes are code-split so the first paint carries only the sign-in screen,
   which is the only page a visitor without a session can see. */
const Home = lazy(() => import('@/pages/Home'))
const Browse = lazy(() => import('@/pages/Browse'))
const ReportLost = lazy(() => import('@/pages/ReportLost'))
const ReportFound = lazy(() => import('@/pages/ReportFound'))
const ItemDetail = lazy(() => import('@/pages/ItemDetail'))
const Matches = lazy(() => import('@/pages/Matches'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Center = lazy(() => import('@/pages/Center'))
const Signup = lazy(() => import('@/pages/Signup'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function RouteFallback() {
  return (
    <main id="content" className="mx-auto w-full max-w-content px-gutter py-24" aria-busy="true">
      <p className="sr-only">Loading the page</p>
      <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded-md bg-muted" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </main>
  )
}

/* Each route carries its own title and description, written for that page. */
const PAGE_META = {
  home: {
    title: 'CampusFind — Lost and found for SVIT campus',
    description:
      'Report a lost item, browse what has been found, and collect it from the Campus Lost & Found Center once your ownership is verified.',
  },
  browse: {
    title: 'Browse lost and found items — CampusFind',
    description:
      'Search every lost and found report on campus by category, location, date and status, and open any listing to start a claim.',
  },
  reportLost: {
    title: 'Report a lost item — CampusFind',
    description:
      'File a lost item report with a photograph, the place you last saw it, and the detail only you would know, then read your possible matches.',
  },
  reportFound: {
    title: 'Report a found item — CampusFind',
    description:
      'Hand in something you found on campus: log it with a photograph and drop it at the Campus Lost & Found Center so its owner can claim it.',
  },
  item: {
    title: 'Item details — CampusFind',
    description:
      'The full report for this campus lost and found listing: photograph, location, date, status and the next step to get it back.',
  },
  matches: {
    title: 'Possible matches — CampusFind',
    description:
      'Your lost report compared with items students have handed in, with the reasons each one came up and a request for the center to verify.',
  },
  dashboard: {
    title: 'My reports — CampusFind',
    description:
      'Track your lost and found reports, follow possible matches, and see where each claim stands with the Campus Lost & Found Center.',
  },
  login: {
    title: 'Sign in — CampusFind',
    description:
      'Sign in to your CampusFind student account to follow your lost and found reports, check possible matches and track a claim with the campus center.',
  },
  signup: {
    title: 'Create your student account — CampusFind',
    description:
      'Register with your roll number and college email so your lost and found reports, matches and claims stay in one place on campus.',
  },
  center: {
    title: 'Campus Lost & Found Center — CampusFind',
    description:
      'Where to hand in a found item and how to claim a recovered one: address, hours, verification steps and the desk inventory.',
  },
  notFound: {
    title: 'Page not found — CampusFind',
    description: 'This page is not part of CampusFind. Browse the found-item shelf or file a report instead.',
  },
} as const

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Signed out: these two screens are the whole site. */}
        <Route path="login" element={<><Meta {...PAGE_META.login} /><Login /></>} />
        <Route path="signup" element={<><Meta {...PAGE_META.signup} /><Signup /></>} />

        {/* Signed in: the desk, with its header and footer. */}
        <Route
          element={
            <RequireAuth>
              <Meta title={PAGE_META.home.title} description={PAGE_META.home.description} />
              <SiteLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<><Meta title={PAGE_META.home.title} description={PAGE_META.home.description} /><Home /></>} />
          <Route path="browse" element={<><Meta {...PAGE_META.browse} /><Browse /></>} />
          <Route path="report-lost" element={<><Meta {...PAGE_META.reportLost} /><ReportLost /></>} />
          <Route path="report-found" element={<><Meta {...PAGE_META.reportFound} /><ReportFound /></>} />
          <Route path="items/:id" element={<><Meta {...PAGE_META.item} /><ItemDetail /></>} />
          <Route path="matches/:id" element={<><Meta {...PAGE_META.matches} /><Matches /></>} />
          <Route path="dashboard" element={<><Meta {...PAGE_META.dashboard} /><Dashboard /></>} />
          <Route path="center" element={<><Meta {...PAGE_META.center} /><Center /></>} />
          <Route path="*" element={<><Meta {...PAGE_META.notFound} /><NotFound /></>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
