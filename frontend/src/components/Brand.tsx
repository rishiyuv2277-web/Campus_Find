import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/* The mark: a navy tile holding a magnifier whose handle ends in a location
   pin. The tile is the primary token, the glyph the primary foreground, so the
   mark follows the palette wherever it is placed. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5" strokeWidth={2}>
        <circle cx="10.5" cy="10" r="5.5" stroke="currentColor" />
        <path d="M14.6 14.6 20 20" stroke="currentColor" strokeLinecap="round" />
        <path
          d="M10.5 6.6c1.4 0 2.5 1.1 2.5 2.5 0 1.8-2.5 3.9-2.5 3.9S8 11 8 9.1c0-1.4 1.1-2.5 2.5-2.5Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </span>
  )
}

export function Brand({
  className,
  tone = 'ink',
  size = 'md',
}: {
  className?: string
  tone?: 'ink' | 'light'
  size?: 'md' | 'lg'
}) {
  return (
    <Link
      to="/"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-md outline-none',
        className,
      )}
      aria-label="CampusFind home"
    >
      <BrandMark className={size === 'lg' ? 'size-11' : undefined} />
      <span
        className={cn(
          'font-display font-extrabold tracking-[-0.03em]',
          size === 'lg' ? 'text-2xl' : 'text-xl',
          tone === 'light' ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        CampusFind
        <span className="text-success">.</span>
      </span>
    </Link>
  )
}
