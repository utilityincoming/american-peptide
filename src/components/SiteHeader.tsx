'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sparkles, X } from 'lucide-react'
import CommandPalette from './CommandPalette'
import ThemeToggle from './ThemeToggle'
import { BrandMark } from './BrandMark'

// The Peptide Agent leads as a prominent, standalone CTA. The rest are plain
// top-level categories; their deep links surface as the in-page SectionNav.
// Trials is no longer top-level — it lives at the tail of the Research section.
const NAV_LINKS = [
  { href: '/catalog', label: 'Catalog', match: ['/catalog', '/compounds', '/workspace', '/compare'] },
  {
    href: '/research-areas',
    label: 'Research',
    match: ['/research-areas', '/synthesis', '/learn', '/glossary', '/trials'],
  },
  { href: '/tools', label: 'Tools', match: ['/tools', '/research-workspace', '/compounds/builder'] },
] as const

const MOBILE_QUICK_LINKS = NAV_LINKS.filter((link) => link.href !== '/research-areas')
const MOBILE_MENU_LINKS = NAV_LINKS.filter((link) => link.href === '/research-areas')

function isActive(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function isNavActive(pathname: string, link: (typeof NAV_LINKS)[number]) {
  return pathname === '/compounds/builder' ? link.href === '/tools' : isActive(pathname, link.match)
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const agentActive = isActive(pathname, ['/research'])
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Publish the live header height as a CSS variable so full-height app views
  // (e.g. the /research chat shell) can size themselves to the remaining
  // viewport instead of overflowing by a header's height. Tracks breakpoint
  // changes and nav wrapping via ResizeObserver.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const root = document.documentElement
    const set = () => root.style.setProperty('--app-header-h', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      ref={headerRef}
      className="site-shell sticky top-0 z-40 border-b border-hairline bg-surface"
    >
      <div className="site-shell-container flex items-center justify-between py-3">
        <BrandMark className="shrink-0 [&>span]:sr-only md:[&>span]:not-sr-only" />

        <div className="flex items-center gap-2">
          <nav aria-label="Primary" className="hidden items-center gap-1.5 md:flex">
            {/* Lead feature: the Peptide Agent */}
            <Link
              href="/research"
              aria-current={agentActive ? 'page' : undefined}
              className={
                'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ' +
                (agentActive
                  ? 'border-accent/50 bg-accent/20 text-accent'
                  : 'border-accent/30 bg-accent/10 text-accent hover:border-accent/50 hover:bg-accent/20')
              }
            >
              <Sparkles className="h-4 w-4" />
              Peptide Agent
            </Link>

            {NAV_LINKS.map((link) => {
              const active = isNavActive(pathname, link)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-accent'
                      : 'rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-fill-strong hover:text-ink'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <nav aria-label="Catalog and tools" className="flex gap-3 text-sm text-ink-muted md:hidden">
            {MOBILE_QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isNavActive(pathname, link) ? 'page' : undefined}
                className="py-1 hover:text-ink aria-[current=page]:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <CommandPalette />

          <ThemeToggle />

          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-fill text-ink/75 transition-colors hover:bg-fill-strong hover:text-ink md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div id="site-mobile-nav" hidden={!open} className="border-t border-hairline bg-surface md:hidden">
        <nav aria-label="Primary" className="site-shell-container flex flex-col gap-1 py-3">
          <Link
            href="/research"
            aria-current={agentActive ? 'page' : undefined}
            className="mb-1 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-medium text-accent"
          >
            <Sparkles className="h-4 w-4" />
            Peptide Agent
          </Link>
          {MOBILE_MENU_LINKS.map((link) => {
            const active = isNavActive(pathname, link)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'rounded-lg bg-accent/[0.08] px-3 py-2 text-sm font-medium text-accent'
                    : 'rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-fill-strong hover:text-ink'
                }
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
