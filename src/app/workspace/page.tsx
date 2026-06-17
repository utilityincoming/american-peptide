'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Newspaper,
  Star,
  Lock,
  Check,
  X,
  FlaskRound,
  FileSearch,
  ArrowRight,
} from 'lucide-react'
import {
  getWatchlist,
  removeWatch,
  getSeen,
  markSeen,
  getSavedDesigns,
  type SavedDesign,
} from '@/lib/workspace'

interface ResearchItem {
  id: string
  title: string
  meta: string
  url: string
  kind: 'trial' | 'article'
}
interface WatchedPeptide {
  slug: string
  name: string
  items: ResearchItem[]
}

export default function WorkspacePage() {
  const [slugs, setSlugs] = useState<string[]>([])
  const [data, setData] = useState<Record<string, WatchedPeptide>>({})
  const [seen, setSeen] = useState<Record<string, Set<string>>>({})
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    const wl = getWatchlist()
    setSlugs(wl)
    setDesigns(getSavedDesigns())
    setSeen(Object.fromEntries(wl.map((s) => [s, getSeen(s)])))
    setReady(true)
    if (wl.length === 0) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/freshness?slugs=${encodeURIComponent(wl.join(','))}`)
      const json = await res.json()
      const map: Record<string, WatchedPeptide> = {}
      for (const r of json.results ?? []) {
        const items: ResearchItem[] = [
          ...r.trials.map((t: { nctId: string; title: string; status: string | null; phase: string | null }) => ({
            id: t.nctId,
            title: t.title,
            meta: [t.status, t.phase, t.nctId].filter(Boolean).join(' · '),
            url: `https://clinicaltrials.gov/study/${t.nctId}`,
            kind: 'trial' as const,
          })),
          ...r.articles.map((a: { pmid: string; title: string; journal: string | null; date: string | null }) => ({
            id: a.pmid,
            title: a.title,
            meta: [a.journal, a.date, `PMID ${a.pmid}`].filter(Boolean).join(' · '),
            url: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
            kind: 'article' as const,
          })),
        ]
        map[r.slug] = { slug: r.slug, name: r.name, items }
      }
      setData(map)
    } catch {
      /* freshness unavailable — show watchlist without research */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function remove(slug: string) {
    removeWatch(slug)
    setSlugs((prev) => prev.filter((s) => s !== slug))
  }

  function markAllSeen(slug: string) {
    const ids = (data[slug]?.items ?? []).map((i) => i.id)
    markSeen(slug, ids)
    setSeen((prev) => ({ ...prev, [slug]: new Set([...(prev[slug] ?? []), ...ids]) }))
  }

  const hasNothing = ready && slugs.length === 0 && designs.length === 0

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Star className="h-4 w-4 text-accent" />
          Workspace
        </span>
      </header>

      <section className="border-b border-ink/[0.06] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Your research workspace</h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55">
            Peptides you’re tracking, with the latest trials and publications, plus your saved Design-Lab
            sequences.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink/40">
            <Lock className="h-3.5 w-3.5 text-accent/70" />
            Private to this browser — stored locally, never uploaded.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-4xl space-y-10">
          {hasNothing && (
            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-10 text-center">
              <Star className="mx-auto mb-3 h-8 w-8 text-ink/20" />
              <p className="mb-1 text-sm font-medium text-ink/70">Your workspace is empty</p>
              <p className="mx-auto mb-5 max-w-md text-sm text-ink/45">
                Add peptides from the catalog to track their latest research, and save sequences in the Design
                Lab to collect them here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] hover:bg-[#34ddb0]"
                >
                  Browse the catalog <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tools/design-lab"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 px-5 py-2.5 text-sm font-medium text-ink/60 hover:border-ink/20 hover:text-ink"
                >
                  <FlaskRound className="h-4 w-4" /> Open Design Lab
                </Link>
              </div>
            </div>
          )}

          {/* Watchlist */}
          {slugs.length > 0 && (
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Watchlist · {slugs.length}
              </h2>
              <div className="space-y-5">
                {slugs.map((slug) => {
                  const wp = data[slug]
                  const seenSet = seen[slug] ?? new Set<string>()
                  const items = wp?.items ?? []
                  const newCount = items.filter((i) => !seenSet.has(i.id)).length
                  return (
                    <div key={slug} className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/catalog/${slug}`}
                            className="text-base font-semibold text-ink/90 hover:text-accent"
                          >
                            {wp?.name ?? slug}
                          </Link>
                          {newCount > 0 && (
                            <span className="rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.10] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                              {newCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/tools/coa-decoder`}
                            className="hidden items-center gap-1 text-xs text-ink/40 hover:text-accent sm:inline-flex"
                          >
                            <FileSearch className="h-3.5 w-3.5" /> Check a COA
                          </Link>
                          <button
                            onClick={() => remove(slug)}
                            aria-label={`Remove ${wp?.name ?? slug}`}
                            className="text-ink/30 transition-colors hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {loading && !wp ? (
                        <p className="text-xs text-ink/35">Loading latest research…</p>
                      ) : items.length === 0 ? (
                        <p className="text-xs text-ink/35">No recent trials or publications found.</p>
                      ) : (
                        <>
                          <ul className="space-y-1.5">
                            {items.slice(0, 8).map((i) => {
                              const isNew = !seenSet.has(i.id)
                              const Icon = i.kind === 'trial' ? FlaskConical : Newspaper
                              return (
                                <li key={i.id}>
                                  <a
                                    href={i.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.03]"
                                  >
                                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/60" />
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-sm leading-snug text-ink/75 group-hover:text-ink/90">
                                        {isNew && <span className="mr-1.5 text-accent">●</span>}
                                        {i.title}
                                      </span>
                                      <span className="block text-[11px] text-ink/35">{i.meta}</span>
                                    </span>
                                  </a>
                                </li>
                              )
                            })}
                          </ul>
                          {newCount > 0 && (
                            <button
                              onClick={() => markAllSeen(slug)}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/55 transition-colors hover:border-ink/20 hover:text-ink"
                            >
                              <Check className="h-3.5 w-3.5" /> Mark all as seen
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Saved designs */}
          {designs.length > 0 && (
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Saved Design-Lab sequences · {designs.length}
              </h2>
              <div className="space-y-2">
                {designs.map((d) => (
                  <div
                    key={d.seq}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3"
                  >
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-ink/75">{d.seq}</code>
                    <Link
                      href={`/tools/design-lab?s=${encodeURIComponent(d.seq)}`}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <FlaskRound className="h-3.5 w-3.5" /> Open
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
