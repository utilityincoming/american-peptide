'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sparkles, X } from 'lucide-react'
import CommandPalette from './CommandPalette'
import ThemeToggle from './ThemeToggle'

// The Peptide Agent leads as a prominent, standalone CTA. The rest are plain
// top-level categories; their deep links surface as the in-page SectionNav.
// Trials is no longer top-level — it lives at the tail of the Research section.
const NAV_LINKS = [
  { href: '/catalog', label: 'Catalog', match: ['/catalog', '/workspace'] },
  {
    href: '/research-areas',
    label: 'Research',
    match: ['/research-areas', '/synthesis', '/learn', '/glossary', '/trials'],
  },
  { href: '/compounds', label: 'Compounds', match: ['/compounds'] },
  { href: '/tools/reconstitution-calculator', label: 'Calculator', match: ['/tools'] },
] as const

function isActive(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const agentActive = isActive(pathname, ['/research'])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-4 w-4 text-[#0B1220]"
              aria-hidden
            >
              <path d="M4 5c4.5 0 7.5 4 7.5 7S15.5 19 20 19" />
              <path d="M20 5c-4.5 0-7.5 4-7.5 7S8.5 19 4 19" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-tight">AmericanPeptide</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1.5 md:flex">
            {/* Lead feature: the Peptide Agent */}
            <Link
              href="/research"
              aria-current={agentActive ? 'page' : undefined}
              className={
                'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ' +
                (agentActive
                  ? 'border-[#2DD4A8]/50 bg-[#2DD4A8]/20 text-accent'
                  : 'border-[#2DD4A8]/30 bg-[#2DD4A8]/10 text-accent hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/20')
              }
            >
              <Sparkles className="h-4 w-4" />
              Peptide Agent
            </Link>

            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.match)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-accent'
                      : 'rounded-lg px-3 py-1.5 text-sm text-ink/65 transition-colors hover:bg-ink/[0.04] hover:text-ink'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <CommandPalette />

          <ThemeToggle />

          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/[0.08] bg-ink/[0.02] text-ink/75 transition-colors hover:bg-ink/[0.06] hover:text-ink md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-mobile-nav" className="border-t border-ink/[0.06] bg-surface/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <Link
              href="/research"
              aria-current={agentActive ? 'page' : undefined}
              className="mb-1 flex items-center gap-2 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-2 text-sm font-medium text-accent"
            >
              <Sparkles className="h-4 w-4" />
              Peptide Agent
            </Link>
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.match)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'rounded-lg bg-[#2DD4A8]/[0.08] px-3 py-2 text-sm font-medium text-accent'
                      : 'rounded-lg px-3 py-2 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
