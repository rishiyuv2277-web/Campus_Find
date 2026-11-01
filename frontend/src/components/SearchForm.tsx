import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/* The same search field appears on the home hero and on Browse; both hand the
   query to /browse?q=… so there is one place a search actually happens. */
export function SearchForm({
  initial = '',
  size = 'md',
  className,
  autoFocusLabel,
}: {
  initial?: string
  size?: 'md' | 'lg'
  className?: string
  autoFocusLabel?: boolean
}) {
  const [query, setQuery] = useState(initial)
  const navigate = useNavigate()

  return (
    <form
      role="search"
      className={cn('w-full', className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse')
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search lost and found items
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 shadow-raised focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30',
          size === 'lg' && 'sm:p-2',
        )}
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
        <Input
          id="site-search"
          name="q"
          type="search"
          value={query}
          autoFocus={autoFocusLabel}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Headphones, water bottle, ID card…"
          className={cn(
            'h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 md:text-base',
            size === 'lg' && 'h-11',
          )}
        />
        <Button type="submit" size="lg" className={cn('h-10 shrink-0 rounded-md px-4', size === 'lg' && 'h-11 px-6')}>
          Search
        </Button>
      </div>
    </form>
  )
}

export function QuickCategories({ active, className }: { active?: string; className?: string }) {
  const items = [
    'Electronics',
    'ID Cards',
    'Keys',
    'Bags',
    'Bottles',
    'Books',
    'Accessories',
    'Other',
  ]
  const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-')
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((label) => (
        <li key={label}>
          <Link
            to={`/browse?category=${slug(label)}`}
            className={cn(
              'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150',
              active === slug(label)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent',
            )}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
