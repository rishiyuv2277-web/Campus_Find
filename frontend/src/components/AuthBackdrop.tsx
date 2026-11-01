import { Link } from 'react-router'
import { Brand } from '@/components/Brand'

/* The artwork behind the sign-in screen: a code-drawn campus map rather than a
   photograph, because no photograph of this campus exists. Blocks, paths and
   the Lost & Found Center pin are drawn in the site's own tokens. Decorative —
   it says nothing a screen reader needs, so it is hidden from them. */
export function AuthBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--background)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
        </linearGradient>
        <pattern id="auth-grid" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0H0V44" fill="none" stroke="var(--border)" strokeWidth="1" strokeOpacity="0.55" />
        </pattern>
      </defs>

      <rect width="800" height="900" fill="url(#auth-grid)" />
      <rect width="800" height="900" fill="url(#auth-sky)" />

      {/* Paths between the blocks. */}
      <g stroke="var(--primary)" strokeOpacity="0.22" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M-20 620h840" />
        <path d="M420 -20v940" />
        <path d="M-20 300h300c60 0 60 60 60 120" />
        <path d="M520 760c0-80 60-100 140-100h160" />
      </g>

      {/* Campus blocks, drawn as plain rectangles with a hairline. */}
      <g fill="var(--card)" fillOpacity="0.55" stroke="var(--border)" strokeWidth="1.5">
        <rect x="70" y="120" width="210" height="140" rx="14" />
        <rect x="520" y="150" width="230" height="110" rx="14" />
        <rect x="90" y="660" width="180" height="130" rx="14" />
        <rect x="300" y="420" width="120" height="170" rx="14" />
        <rect x="560" y="690" width="150" height="90" rx="14" />
      </g>

      {/* The desk: one pin, ringed, in the brand colour. */}
      <g transform="translate(470 330)">
        <circle r="96" fill="none" stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="1.5" />
        <circle r="62" fill="none" stroke="var(--primary)" strokeOpacity="0.32" strokeWidth="1.5" />
        <circle r="30" fill="var(--primary)" fillOpacity="0.14" stroke="var(--primary)" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M0 13c-6-8-11-13.5-11-19a11 11 0 1 1 22 0c0 5.5-5 11-11 19Z" fill="var(--primary)" />
        <circle cy="-6" r="3.6" fill="var(--primary-foreground)" />
      </g>

      {/* A few items waiting on the shelf, as small drawn glyphs. */}
      <g stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round">
        <g transform="translate(150 190)">
          <path d="M-22 0a22 16 0 0 1 44 0v18a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8Z" />
        </g>
        <g transform="translate(596 200)">
          <rect x="-16" y="-22" width="32" height="44" rx="6" />
          <path d="M-7 -10h14M-7 0h14M-7 10h8" />
        </g>
        <g transform="translate(392 500)">
          <circle cx="-6" cy="-8" r="9" />
          <path d="M2 -2 22 18l-5 5L-3 3Z" />
        </g>
        <g transform="translate(630 735)">
          <path d="M-22 14v-16a22 22 0 0 1 44 0v16Z" />
          <path d="M0 14v8" />
        </g>
      </g>
    </svg>
  )
}

/* The signed-out frame: artwork behind, and at 360 a short mark and line above
   the form instead of a separate marketing column. */
export function AuthHero({ children }: { children: React.ReactNode }) {
  return (
    <main id="content" className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-background py-10 lg:py-16">
      <AuthBackdrop />
      <div className="relative mx-auto w-full max-w-content px-gutter">
        <div className="mb-8 lg:hidden">
          <Link
            to="/login"
            className="inline-flex rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            aria-label="CampusFind — go to the sign-in page"
          >
            <Brand tone="light" size="lg" />
          </Link>
          <p className="mt-4 max-w-[32ch] font-display text-2xl leading-tight font-extrabold tracking-[-0.025em] text-balance">
            Every lost item on campus, on one shelf.
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}
