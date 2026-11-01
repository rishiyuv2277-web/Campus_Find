import { Link } from 'react-router'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/Brand'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-gutter py-20 md:py-28">
      <Brand size="lg" />
      <p className="mt-8 font-mono text-sm font-semibold tracking-[0.08em] text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
        This page is not on the shelf.
      </h1>
      <p className="mt-3 max-w-[52ch] text-base text-muted-foreground">
        The address does not lead to a listing or a form. If you were following a link to a report, the student who
        filed it has probably withdrawn it.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild className="h-12 rounded-md px-5 text-base">
          <Link to="/browse">
            <Search className="size-4" strokeWidth={2} aria-hidden="true" />
            Browse every item
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-md px-5">
          <Link to="/">
            <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
            Back to the home page
          </Link>
        </Button>
      </div>
    </div>
  )
}
