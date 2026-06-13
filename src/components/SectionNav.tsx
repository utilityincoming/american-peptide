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
  {
    match: ['/catalog', '/workspace'],
    tabs: [
      { href: '/catalog', label: 'Browse' },
      { href: '/catalog/compare', label: 'Compare' },
      { href: '/workspace', label: 'Workspace' },
    ],
  },
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
  const section = SECTIONS.find((s) => s.match.some((m) => inPath(pathname, m)))
  if (!section) return null
  const active = activeHref(pathname, section.tabs)

  return (
    <div className="border-b border-white/[0.05] bg-[#0B1220]/60">
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
                  ? 'bg-[#2DD4A8]/[0.12] font-medium text-[#2DD4A8]'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80')
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
