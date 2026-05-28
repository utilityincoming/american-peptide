'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Dna, Search, ExternalLink, FlaskConical } from 'lucide-react'

interface Compound {
  cid: number
  name: string
  molecularFormula: string | null
  molecularWeight: string | null
}

type Status = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export default function CompoundsPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [results, setResults] = useState<Compound[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!debounced) {
      setStatus('idle')
      setResults([])
      return
    }

    const controller = new AbortController()
    setStatus('loading')

    ;(async () => {
      try {
        const res = await fetch(
          `/api/pubchem?name=${encodeURIComponent(debounced)}`,
          { signal: controller.signal },
        )

        if (res.status === 404) {
          setResults([])
          setStatus('empty')
          return
        }

        const data = await res.json()

        if (!res.ok) {
          setErrorMsg(data.error || 'Search failed')
          setStatus('error')
          return
        }

        setResults(data.compounds ?? [])
        setStatus(data.compounds?.length ? 'success' : 'empty')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setErrorMsg(err instanceof Error ? err.message : 'Network error')
        setStatus('error')
      }
    })()

    return () => controller.abort()
  }, [debounced])

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
          <FlaskConical className="h-4 w-4 text-[#2DD4A8]" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-sm font-medium">Compound Search</span>
          <span className="ml-2 hidden text-xs text-white/30 sm:inline">PubChem</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* ── PeptideForge CTA ── */}
        <Link
          href="/compounds/builder"
          className="group mb-8 flex items-center gap-4 overflow-hidden rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-5 transition-all hover:border-[#2DD4A8]/35 hover:shadow-[0_8px_40px_rgba(45,212,168,0.08)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-[#2DD4A8]">
            <Dna className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">PeptideForge</h2>
              <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                New
              </span>
            </div>
            <p className="mt-0.5 text-xs text-white/55">
              Build your own peptide residue by residue — live chemistry,
              challenges, and XP.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#2DD4A8] transition-transform group-hover:translate-x-0.5">
            Open builder
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* ── Search bar ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-[#2DD4A8]/25">
            <Search className="h-4 w-4 flex-shrink-0 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search peptides or compounds (e.g. semaglutide, oxytocin, melittin)…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
              autoFocus
            />
            {status === 'loading' && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2DD4A8]/30 border-t-[#2DD4A8]" />
            )}
          </div>
          <p className="mt-2 ml-1 text-[10px] text-white/20">
            Data source: PubChem (NIH National Library of Medicine)
          </p>
        </div>

        {/* ── States ── */}
        {status === 'idle' && (
          <div className="py-16 text-center text-sm text-white/30">
            Type a compound name to search PubChem.
          </div>
        )}

        {status === 'empty' && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
            <p className="text-sm text-white/55">No compound found</p>
            <p className="mt-1 text-xs text-white/30">
              Try a different name, IUPAC identifier, or common synonym.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4">
            <p className="text-sm text-red-300/90">Search error</p>
            <p className="mt-1 text-xs text-red-300/60">{errorMsg}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <CompoundCard key={c.cid} compound={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CompoundCard({ compound }: { compound: Compound }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] transition-colors hover:border-[#2DD4A8]/20">
      <div className="flex h-48 items-center justify-center border-b border-white/[0.06] bg-white/[0.03] p-4">
        {imgError ? (
          <span className="text-xs text-white/30">Structure unavailable</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG`}
            alt={`2D structure of ${compound.name}`}
            className="max-h-full max-w-full object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white/90">
            {compound.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-white/35">CID {compound.cid}</p>
        </div>

        <div className="flex-1 space-y-1.5 text-xs">
          {compound.molecularFormula && (
            <div className="flex justify-between gap-2">
              <span className="text-white/40">Formula</span>
              <span className="font-mono text-[#2DD4A8]/90">{compound.molecularFormula}</span>
            </div>
          )}
          {compound.molecularWeight && (
            <div className="flex justify-between gap-2">
              <span className="text-white/40">MW</span>
              <span className="font-mono text-white/70">{compound.molecularWeight} g/mol</span>
            </div>
          )}
        </div>

        <a
          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] py-2 text-xs text-white/55 transition-colors hover:border-[#2DD4A8]/25 hover:bg-[#2DD4A8]/[0.05] hover:text-[#2DD4A8]"
        >
          View on PubChem
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
