import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookText, Calculator, WifiOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Offline — AmericanPeptide.com',
  description: 'You are offline.',
  robots: { index: false, follow: false },
}

// Served by the service worker as the navigation fallback when a requested
// page is not cached and the device is offline. Links point at routes that
// are precached (or commonly downloaded), so there is always a way forward.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center text-ink">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink/[0.08] bg-ink/[0.03] text-ink/60">
        <WifiOff className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">You’re offline</h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-ink/55">
        This page hasn’t been saved for offline use yet. Anything you’ve
        downloaded — the calculator, catalog, and glossary — still works without
        a connection.
      </p>

      <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
        <Link
          href="/tools/reconstitution-calculator"
          className="group flex items-center gap-3 rounded-xl border border-ink/[0.08] bg-ink/[0.025] p-4 text-left transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
        >
          <Calculator className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
          <span className="flex-1 text-sm font-medium">Calculator</span>
          <ArrowRight className="h-4 w-4 text-accent/70 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/catalog"
          className="group flex items-center gap-3 rounded-xl border border-ink/[0.08] bg-ink/[0.025] p-4 text-left transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
        >
          <BookText className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
          <span className="flex-1 text-sm font-medium">Catalog</span>
          <ArrowRight className="h-4 w-4 text-accent/70 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="mt-8 text-[11px] text-ink/30">
        Reconnect to load anything not yet saved.
      </p>
    </div>
  )
}
