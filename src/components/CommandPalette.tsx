'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  FlaskConical,
  Layers,
  Compass,
  CornerDownLeft,
  ArrowDown,
  ArrowUp,
  X,
} from 'lucide-react'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'

type ItemKind = 'peptide' | 'category' | 'page'

interface CommandItem {
  id: string
  kind: ItemKind
  label: string
  subtitle?: string
  hint?: string
  href: string
  keywords: string
}

const PAGES: CommandItem[] = [
  {
    id: 'page-home',
    kind: 'page',
    label: 'Home',
    href: '/',
    keywords: 'home landing americanpeptide',
  },
  {
    id: 'page-catalog',
    kind: 'page',
    label: 'Catalog',
    subtitle: 'Browse the full peptide reference',
    href: '/catalog',
    keywords: 'catalog browse peptides reference',
  },
  {
    id: 'page-learn',
    kind: 'page',
    label: 'Learn',
    subtitle: 'Synthesis, research areas & glossary',
    href: '/learn',
    keywords: 'learn education hub resources guides synthesis glossary research areas terminology',
  },
  {
    id: 'page-synthesis',
    kind: 'page',
    label: 'Synthesis',
    subtitle: 'How peptides are made — cost & cold chain',
    href: '/synthesis',
    keywords: 'synthesis manufacturing how peptides are made spps hplc purification lyophilization cost coa cold chain quality purity',
  },
  {
    id: 'page-compatibility',
    kind: 'page',
    label: 'Compatibility & Stability',
    subtitle: 'Mixing, degradation & handling chemistry',
    href: '/learn/compatibility',
    keywords: 'compatibility stability mixing blend combine pairing stacking degradation reconstitution storage handling matrix',
  },
  {
    id: 'page-blend-calculator',
    kind: 'page',
    label: 'Blend Calculator (Beta)',
    subtitle: 'Combine peptides into one vial — blend math',
    href: '/tools/blend-calculator',
    keywords: 'blend calculator combine mix multiple peptides one vial doses draw volume beta',
  },
  {
    id: 'page-design-lab',
    kind: 'page',
    label: 'Design Lab (Beta)',
    subtitle: 'Sequence properties: MW, charge, pI, GRAVY, ε280',
    href: '/tools/design-lab',
    keywords: 'design lab sequence properties molecular weight net charge isoelectric point pi gravy hydropathy extinction coefficient builder beta',
  },
  {
    id: 'page-research-areas',
    kind: 'page',
    label: 'Research Areas',
    subtitle: 'Browse peptides by indication',
    href: '/research-areas',
    keywords: 'research areas indication use case weight loss wound healing cognition longevity guide',
  },
  {
    id: 'page-glossary',
    kind: 'page',
    label: 'Glossary',
    subtitle: 'Peptide terms & definitions',
    href: '/glossary',
    keywords: 'glossary terms definitions dictionary meaning what is reconstitution glp-1 gravy',
  },
  {
    id: 'page-research',
    kind: 'page',
    label: 'Research Agent',
    subtitle: 'AI research assistant',
    href: '/research',
    keywords: 'research agent chat ai assistant claude',
  },
  {
    id: 'page-trials',
    kind: 'page',
    label: 'Clinical Trials',
    subtitle: 'ClinicalTrials.gov search',
    href: '/trials',
    keywords: 'trials clinical clinicaltrials studies recruiting phase',
  },
  {
    id: 'page-compounds',
    kind: 'page',
    label: 'Compound Search',
    subtitle: 'PubChem structure explorer',
    href: '/compounds',
    keywords: 'compounds pubchem structure molecule chemistry cid',
  },
  {
    id: 'page-builder',
    kind: 'page',
    label: 'PeptideForge',
    subtitle: 'Build a peptide & earn XP',
    href: '/compounds/builder',
    keywords: 'peptideforge builder build amino acid sequence game xp challenge',
  },
  {
    id: 'page-calculator',
    kind: 'page',
    label: 'Reconstitution Calculator',
    subtitle: 'Dose, dilution, and syringe-unit math',
    href: '/tools/reconstitution-calculator',
    keywords: 'tools calculator reconstitution dose dilution syringe insulin units',
  },
  {
    id: 'page-melanocortin',
    kind: 'page',
    label: 'Melanocortin Research Hub',
    href: '/melanocortin',
    keywords: 'melanocortin mc1r mc3r mc4r mc5r pt-141 bremelanotide',
  },
  {
    id: 'page-developers',
    kind: 'page',
    label: 'Developers / API',
    subtitle: 'Open catalog JSON API',
    href: '/developers',
    keywords: 'developers api json open data catalog endpoint integrate cc-by',
  },
]

const PEPTIDE_ITEMS: CommandItem[] = PEPTIDES.map((p) => ({
  id: `peptide-${p.slug}`,
  kind: 'peptide',
  label: p.name,
  subtitle: p.shortDescription,
  hint: p.aliases?.length ? `aka ${p.aliases.join(', ')}` : undefined,
  href: `/catalog/${p.slug}`,
  keywords: [
    p.name,
    ...(p.aliases ?? []),
    p.shortDescription,
    ...p.categories,
  ]
    .join(' ')
    .toLowerCase(),
}))

const CATEGORY_ITEMS: CommandItem[] = CATEGORIES.map((c) => ({
  id: `cat-${c.id}`,
  kind: 'category',
  label: `${c.label} peptides`,
  subtitle: c.blurb,
  href: `/catalog/category/${c.id}`,
  keywords: [c.label, c.id, c.blurb].join(' ').toLowerCase(),
}))

interface Group {
  title: string
  Icon: typeof FlaskConical
  items: CommandItem[]
}

function buildGroups(query: string): Group[] {
  const q = query.trim().toLowerCase()
  const filter = (items: CommandItem[]) =>
    q ? items.filter((i) => i.keywords.includes(q)) : items

  const peptides = filter(PEPTIDE_ITEMS)
  const categories = filter(CATEGORY_ITEMS)
  const pages = filter(
    PAGES.map((p) => ({
      ...p,
      keywords: `${p.keywords} ${p.label.toLowerCase()}`,
    })),
  )

  return [
    { title: 'Peptides', Icon: FlaskConical, items: q ? peptides : peptides.slice(0, 8) },
    { title: 'Categories', Icon: Layers, items: categories },
    { title: 'Pages', Icon: Compass, items: pages },
  ].filter((g) => g.items.length > 0)
}

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const groups = useMemo(() => buildGroups(query), [query])
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === '/' && !open) {
        const target = e.target as HTMLElement | null
        const tag = target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable)
          return
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelected(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-cmd-index="${selected}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected, open])

  const choose = useCallback(
    (item: CommandItem) => {
      setOpen(false)
      router.push(item.href)
    },
    [router],
  )

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (flat.length ? (s + 1) % flat.length : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) =>
        flat.length ? (s - 1 + flat.length) % flat.length : 0,
      )
      return
    }
    if (e.key === 'Enter') {
      const item = flat[selected]
      if (item) {
        e.preventDefault()
        choose(item)
      }
    }
  }

  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh] pb-8"
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#040810]/75 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F1828] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-white/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search peptides, categories, tools…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                aria-label="Search query"
                aria-controls="cmd-results"
                aria-activedescendant={
                  flat[selected] ? `cmd-${flat[selected].id}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd className="hidden rounded border border-white/[0.10] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-white/40 sm:inline">
                esc
              </kbd>
            </div>

            <div
              ref={listRef}
              id="cmd-results"
              role="listbox"
              className="max-h-[60vh] overflow-y-auto px-2 py-2"
            >
              {flat.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-white/40">
                  No results for{' '}
                  <span className="text-white/70">&ldquo;{query}&rdquo;</span>.
                  Try a peptide name, alias, or category.
                </div>
              ) : (
                groups.map((g) => {
                  const startIndex = flat.indexOf(g.items[0])
                  return (
                    <div key={g.title} className="mb-1">
                      <div className="flex items-center gap-2 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        <g.Icon className="h-3 w-3 text-[#2DD4A8]/70" />
                        {g.title}
                      </div>
                      {g.items.map((item, i) => {
                        const idx = startIndex + i
                        const active = idx === selected
                        return (
                          <button
                            type="button"
                            key={item.id}
                            id={`cmd-${item.id}`}
                            role="option"
                            aria-selected={active}
                            data-cmd-index={idx}
                            onMouseEnter={() => setSelected(idx)}
                            onClick={() => choose(item)}
                            className={
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ' +
                              (active
                                ? 'bg-[#2DD4A8]/[0.10] text-white'
                                : 'text-white/80 hover:bg-white/[0.04]')
                            }
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="truncate text-sm font-medium">
                                  {item.label}
                                </span>
                                {item.hint && (
                                  <span className="truncate text-[11px] text-white/35">
                                    {item.hint}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-white/45">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            <CornerDownLeft
                              className={
                                'h-3.5 w-3.5 shrink-0 transition-opacity ' +
                                (active
                                  ? 'text-[#2DD4A8] opacity-100'
                                  : 'opacity-0')
                              }
                            />
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.015] px-4 py-2 text-[11px] text-white/40">
              <div className="flex items-center gap-3">
                <Hint icon={<ArrowDown className="h-3 w-3" />}>
                  <Hint icon={<ArrowUp className="h-3 w-3" />}>navigate</Hint>
                </Hint>
                <Hint icon={<CornerDownLeft className="h-3 w-3" />}>open</Hint>
              </div>
              <span>
                {flat.length} result{flat.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Hint({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-white/[0.10] bg-white/[0.03] text-white/55">
        {icon}
      </span>
      <span>{children}</span>
    </span>
  )
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    const ua = navigator.userAgent || navigator.platform || ''
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua))
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open search"
        className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/55 transition-colors hover:border-white/[0.15] hover:text-white md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-white/[0.10] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-white/45">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  )
}
