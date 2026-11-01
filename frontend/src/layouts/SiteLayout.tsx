import { Outlet, useLocation } from 'react-router'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

/* The shell every page sits in: a sticky top bar, the page's own <main>, and
   the navy footer carrying the center's address and the demo notice. */
export function SiteLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="content">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
