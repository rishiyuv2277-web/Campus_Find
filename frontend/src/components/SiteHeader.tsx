import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { LogOut, Menu, Plus } from 'lucide-react'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSession } from '@/hooks/useSession'
import { initials } from '@/lib/format'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/browse', label: 'Browse items' },
  { to: '/report-lost', label: 'Report lost' },
  { to: '/report-found', label: 'Report found' },
  { to: '/center', label: 'The Center' },
]

/* The bar: mark left, the five destinations a student actually uses, the demo
   student's profile and one action on the right. At 360 it becomes the mark,
   the profile and a single menu button. */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, signOut } = useSession()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex h-11 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150',
      isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-gutter">
        <Brand />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="lg" className="hidden h-11 rounded-md px-4 sm:inline-flex">
            <Link to="/report-lost">
              <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
              Report an item
            </Link>
          </Button>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors duration-150 hover:bg-muted',
                  pathname === '/dashboard' ? 'bg-secondary text-primary' : 'text-foreground',
                )}
                aria-label={`My reports, signed in as ${user.name}`}
              >
                <span
                  className="grid size-8 place-items-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground"
                  aria-hidden="true"
                >
                  {initials(user.name)}
                </span>
                <span className="hidden xl:inline">My reports</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden size-11 rounded-md text-muted-foreground hover:text-foreground lg:inline-flex"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="size-5" strokeWidth={2} aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden h-11 rounded-md px-4 lg:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-md px-4">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-md lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[86vw] max-w-sm gap-0 p-0">
          <SheetTitle className="sr-only">Site menu</SheetTitle>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Brand />
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex h-12 items-center rounded-md px-3 text-base font-medium',
                    isActive ? 'bg-secondary text-primary' : 'text-foreground hover:bg-muted',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-muted"
            >
              My reports
            </NavLink>
          </nav>
          <div className="mt-auto border-t border-border p-4">
            <Button asChild size="lg" className="h-12 w-full rounded-md">
              <Link to="/report-lost" onClick={() => setOpen(false)}>
                <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
                Report an item
              </Link>
            </Button>            <p className="mt-3 text-xs text-muted-foreground">
              {user ? (
                <>
                  Signed in as <span className="font-medium text-foreground">{user.name}</span> —{' '}
                  demo account, {user.rollNo}.
                </>
              ) : (
                'Not signed in — this is the demo build. Reports still save in this browser.'
              )}
            </p>
            {user ? (
              <Button variant="outline" className="mt-3 h-12 w-full rounded-md" onClick={signOut}>
                <LogOut className="size-4" strokeWidth={2} aria-hidden="true" />
                Sign out
              </Button>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="h-12 rounded-md">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="h-12 rounded-md">
                  <Link to="/signup" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
            <SheetClose className="sr-only">Close menu</SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
