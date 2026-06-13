'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Beaker,
  BookOpen,
  ChevronDown,
  Compass,
  Factory,
  FlaskConical,
  GitCompare,
  Menu,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react'
import CommandPalette from './CommandPalette'

interface NavLeaf {
  href: string
  label: string
  desc: string
  Icon: LucideIcon
}
type NavItem =
  | { kind: 'link'; href: string; label: string; match: readonly string[] }
  | {
      kind: 'menu'
      label: string
      href: string
      match: readonly string[]
      items: readonly NavLeaf[]
      allHref?: string
      allLabel?: string
    }

// Two umbrella categories (Catalog, Research) plus standalone links. Catalog
// holds the catalog itself, the compare tool, and the personal Workspace;
// Research holds the agent, indication guides, and education surfaces.
const NAV: readonly NavItem[] = [
  {
    kind: 'menu',
    label: 'Catalog',
    href: '/catalog',
    match: ['/catalog', '/workspace'],
    items: [
      {
        href: '/catalog',
        label: 'Browse all peptides',
        desc: 'The full peptide & protein catalog.',
        Icon: FlaskConical,
      },
      {
        href: '/catalog/compare',
        label: 'Compare peptides',
        desc: 'Build a side-by-side comparison table.',
        Icon: GitCompare,
      },
      {
        href: '/workspace',
        label: 'Your workspace',
        desc: 'Watchlist, latest research & saved designs.',
        Icon: Star,
      },
    ],
  },
  {
    kind: 'menu',
    label: 'Research',
    href: '/research',
    match: ['/research', '/research-areas', '/synthesis', '/learn', '/glossary'],
    items: [
      {
        href: '/research',
        label: 'Research Agent',
        desc: 'AI assistant for peptide, compound, and trial research.',
        Icon: Sparkles,
      },
      {
        href: '/research-areas',
        label: 'Browse by indication',
        desc: 'Peptides grouped by what they are studied for.',
        Icon: Compass,
      },
      {
        href: '/synthesis',
        label: 'Synthesis',
        desc: 'How peptides are made — cost, purity, cold chain.',
        Icon: Factory,
      },
      {
        href: '/learn/compatibility',
        label: 'Compatibility & stability',
        desc: 'What can be combined, and what degrades peptides.',
        Icon: Beaker,
      },
      {
        href: '/glossary',
        label: 'Glossary',
        desc: 'Key peptide terms in plain English.',
        Icon: BookOpen,
      },
    ],
    allHref: '/learn',
    allLabel: 'Browse all learning resources',
  },
  { kind: 'link', href: '/trials', label: 'Trials', match: ['/trials'] },
  { kind: 'link', href: '/compounds', label: 'Compounds', match: ['/compounds'] },
  { kind: 'link', href: '/tools/reconstitution-calculator', label: 'Calculator', match: ['/tools'] },
]

function isActive(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function DesktopMenu({ item, pathname }: { item: Extract<NavItem, { kind: 'menu' }>; pathname: string }) {
  const active = isActive(pathname, item.match)
  return (
    <div className="group relative">
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={
          'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ' +
          (active ? 'font-medium text-[#2DD4A8]' : 'text-white/65 hover:bg-white/[0.04] hover:text-white')
        }
      >
        {item.label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-72 rounded-xl border border-white/[0.08] bg-[#0F1828] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          {item.items.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-[#2DD4A8]">
                <l.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white/90">{l.label}</span>
                <span className="block text-xs leading-snug text-white/45">{l.desc}</span>
              </span>
            </Link>
          ))}
          {item.allHref && (
            <Link
              href={item.allHref}
              className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#2DD4A8] transition-colors hover:bg-white/[0.04]"
            >
              {item.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ item, pathname }: { item: Extract<NavItem, { kind: 'menu' }>; pathname: string }) {
  const active = isActive(pathname, item.match)
  return (
    <div className="my-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-1">
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={
          'flex items-center justify-between rounded-md px-3 py-2 text-sm ' +
          (active ? 'font-medium text-[#2DD4A8]' : 'text-white/70 hover:bg-white/[0.04] hover:text-white')
        }
      >
        {item.label}
      </Link>
      {item.items.map((l) => {
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
        <Link href="/" className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90">
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
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) =>
              item.kind === 'menu' ? (
                <DesktopMenu key={item.label} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.match) ? 'page' : undefined}
                  className={
                    isActive(pathname, item.match)
                      ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-[#2DD4A8]'
                      : 'rounded-lg px-3 py-1.5 text-sm text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white'
                  }
                >
                  {item.label}
                </Link>
              ),
            )}
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
        <div id="site-mobile-nav" className="border-t border-white/[0.06] bg-[#0B1220]/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) =>
              item.kind === 'menu' ? (
                <MobileMenu key={item.label} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.match) ? 'page' : undefined}
                  className={
                    isActive(pathname, item.match)
                      ? 'rounded-lg bg-[#2DD4A8]/[0.08] px-3 py-2 text-sm font-medium text-[#2DD4A8]'
                      : 'rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white'
                  }
                >
                  {item.label}
                </Link>
              ),
            )}
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
