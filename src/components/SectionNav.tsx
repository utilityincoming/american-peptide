'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Contextual, in-page section sub-navigation. Instead of header dropdowns, the
// deep links for the Catalog and Research sections surface as a subtle bar that
// appears only while you're inside that section — integrated into the page, not
// stacked into the global header.

interface SectionTab {
  href: string
  label: string
}
interface Section {
  match: string[]
  tabs: SectionTab[]
}

const SECTIONS: Section[] = [
  // Catalog section removed — Compare and Workspace are surfaced on the catalog
  // page itself, so the whole catalog/compare/workspace area has no sub-nav.
  {
    match: ['/research', '/research-areas', '/synthesis', '/learn', '/glossary', '/trials'],
    tabs: [
      { href: '/research', label: 'Peptide Agent' },
      { href: '/research-areas', label: 'Research Areas' },
      { href: '/synthesis', label: 'Synthesis' },
      { href: '/learn/compatibility', label: 'Compatibility' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/trials', label: 'Clinical Trials' },
    ],
  },
]

// Pages that opt out of the section sub-nav. These surface their in-section
// features on the page itself instead: the Peptide Agent stays a focused,
// chrome-free workspace, and the catalog exposes Compare + Workspace inline.
const HIDE_ON_EXACT = new Set(['/research', '/catalog'])

function inPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

// Pick the most specific matching tab so e.g. /catalog/compare highlights
// "Compare", not "Browse" (which would also prefix-match /catalog).
function activeHref(pathname: string, tabs: SectionTab[]): string | null {
  const matches = tabs.filter((t) => inPath(pathname, t.href))
  if (matches.length === 0) return null
  return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href
}

export default function SectionNav() {
  const pathname = usePathname() ?? '/'
  if (HIDE_ON_EXACT.has(pathname)) return null
  const section = SECTIONS.find((s) => s.match.some((m) => inPath(pathname, m)))
  if (!section) return null
  const active = activeHref(pathname, section.tabs)

  return (
    <div className="border-b border-ink/[0.05] bg-surface/60">
      <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 md:px-6">
        {section.tabs.map((t) => {
          const isActive = t.href === active
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                'whitespace-nowrap rounded-full px-3 py-1 text-[13px] transition-colors ' +
                (isActive
                  ? 'bg-[#2DD4A8]/[0.12] font-medium text-accent'
                  : 'text-ink/50 hover:bg-ink/[0.04] hover:text-ink/80')
              }
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
