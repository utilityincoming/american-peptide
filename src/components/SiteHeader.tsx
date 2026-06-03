'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import CommandPalette from './CommandPalette'

const NAV_LINKS = [
  { href: '/catalog', label: 'Catalog', match: ['/catalog'] },
  { href: '/synthesis', label: 'Synthesis', match: ['/synthesis'] },
  { href: '/research', label: 'Research', match: ['/research'] },
  { href: '/trials', label: 'Trials', match: ['/trials'] },
  { href: '/compounds', label: 'Compounds', match: ['/compounds'] },
  {
    href: '/tools/reconstitution-calculator',
    label: 'Calculator',
    match: ['/tools'],
  },
] as const

function isActive(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)

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
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0B1220]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0B1220]/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
        >
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
          <span className="text-[14px] font-semibold tracking-tight">
            AmericanPeptide
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.match)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-[#2DD4A8]'
                      : 'rounded-lg px-3 py-1.5 text-sm text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <CommandPalette />

          <Link
            href="/research"
            className="ml-1 hidden rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3.5 py-1.5 text-sm font-medium text-[#2DD4A8] transition-all hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/20 md:inline-block"
          >
            Launch App →
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="site-mobile-nav"
          className="border-t border-white/[0.06] bg-[#0B1220]/95 backdrop-blur md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.match)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'rounded-lg bg-[#2DD4A8]/[0.08] px-3 py-2 text-sm font-medium text-[#2DD4A8]'
                      : 'rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/research"
              className="mt-1 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-2 text-center text-sm font-medium text-[#2DD4A8]"
            >
              Launch App →
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
