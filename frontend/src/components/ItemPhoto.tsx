import { useState } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'

/* A photograph that degrades into a token-tinted panel with the item's initials
   if the file cannot load, so a broken image never leaves a hole in a card. */
export function ItemPhoto({
  src,
  alt,
  name,
  width,
  height,
  className,
  priority = false,
}: {
  src?: string
  alt: string
  name: string
  width: number
  height: number
  className?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)} style={{ aspectRatio: `${width} / ${height}` }}>
      {showFallback ? (
        <div
          className="grid size-full place-items-center bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent)_100%,transparent),color-mix(in_oklch,var(--muted)_60%,transparent))]"
          role="img"
          aria-label={alt}
        >
          <span className="font-display text-2xl font-bold text-accent-foreground">{initials(name)}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 92vw"
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
    </div>
  )
}
