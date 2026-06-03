'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  Factory,
  Menu,
  X,
} from 'lucide-react'
import CommandPalette from './CommandPalette'

const NAV_LINKS = [
  { href: '/catalog', label: 'Catalog', match: ['/catalog'] },
  { href: '/research', label: 'Research', match: ['/research'] },
  { href: '/trials', label: 'Trials', match: ['/trials'] },
  { href: '/compounds', label: 'Compounds', match: ['/compounds'] },
  {
    href: '/tools/reconstitution-calculator',
    label: 'Calculator',
    match: ['/tools'],
  },
] as const

// Educational surfaces, grouped under a single "Learn" nav item.
const LEARN_LINKS = [
  {
    href: '/synthesis',
    label: 'Synthesis',
    desc: 'How peptides are made — cost, purity, cold chain.',
    Icon: Factory,
  },
  {
    href: '/research-areas',
    label: 'Research Areas',
    desc: 'Browse peptides by indication and use case.',
    Icon: Compass,
  },
  {
    href: '/glossary',
    label: 'Glossary',
    desc: 'Key peptide terms in plain English.',
    Icon: BookOpen,
  },
] as const

const LEARN_MATCH = ['/learn', '/synthesis', '/research-areas', '/glossary']

function isActive(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const learnActive = isActive(pathname, LEARN_MATCH)

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
                <Fragment key={link.href}>
                  <Link
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

                  {/* Learn dropdown — slotted right after Catalog */}
                  {link.href === '/catalog' && (
                    <div className="group relative">
                      <Link
                        href="/learn"
                        aria-current={learnActive ? 'page' : undefined}
                        className={
                          'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ' +
                          (learnActive
                            ? 'font-medium text-[#2DD4A8]'
                            : 'text-white/65 hover:bg-white/[0.04] hover:text-white')
                        }
                      >
                        Learn
                        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                      </Link>

                      <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <div className="w-72 rounded-xl border border-white/[0.08] bg-[#0F1828] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                          {LEARN_LINKS.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                            >
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-[#2DD4A8]">
                                <l.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-white/90">
                                  {l.label}
                                </span>
                                <span className="block text-xs leading-snug text-white/45">
                                  {l.desc}
                                </span>
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/learn"
                            className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#2DD4A8] transition-colors hover:bg-white/[0.04]"
                          >
                            Browse all learning resources
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </Fragment>
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
                <Fragment key={link.href}>
                  <Link
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

                  {/* Learn group — slotted right after Catalog */}
                  {link.href === '/catalog' && (
                    <div className="my-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-1">
                      <Link
                        href="/learn"
                        aria-current={learnActive ? 'page' : undefined}
                        className={
                          'flex items-center justify-between rounded-md px-3 py-2 text-sm ' +
                          (learnActive
                            ? 'font-medium text-[#2DD4A8]'
                            : 'text-white/70 hover:bg-white/[0.04] hover:text-white')
                        }
                      >
                        Learn
                        <span className="text-[10px] uppercase tracking-wider text-white/30">
                          Hub
                        </span>
                      </Link>
                      {LEARN_LINKS.map((l) => {
                        const subActive = isActive(pathname, [l.href])
                        return (
                          <Link
                            key={l.href}
                            href={l.href}
                            aria-current={subActive ? 'page' : undefined}
                            className={
                              'flex items-center gap-2 rounded-md px-3 py-2 pl-5 text-sm ' +
                              (subActive
                                ? 'font-medium text-[#2DD4A8]'
                                : 'text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white')
                            }
                          >
                            <l.Icon className="h-3.5 w-3.5 text-[#2DD4A8]/70" />
                            {l.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </Fragment>
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
