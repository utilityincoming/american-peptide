'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, CloudDownload, Loader2, WifiOff } from 'lucide-react'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { GLOSSARY } from '@/lib/glossary'

const STORAGE_KEY = 'amp-reference-cache'

// Every route that makes up the offline reference. Built from the data libs so
// it stays in sync as the catalog/glossary grow.
function buildReferenceUrls(): string[] {
  return [
    '/',
    '/catalog',
    '/glossary',
    '/research-areas',
    '/tools/reconstitution-calculator',
    '/api/catalog',
    ...CATEGORIES.map((c) => `/catalog/category/${c.id}`),
    ...RESEARCH_AREAS.map((a) => `/research-areas/${a.slug}`),
    ...PEPTIDES.map((p) => `/catalog/${p.slug}`),
    ...GLOSSARY.map((t) => `/glossary/${t.slug}`),
  ]
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

interface SavedRecord {
  count: number
  savedAt: string
}

export default function OfflineReference() {
  const [ready, setReady] = useState(false)
  const [online, setOnline] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [saved, setSaved] = useState<SavedRecord | null>(null)

  // Show only once a service worker is actually active (prod). In dev there's
  // no SW, so `ready` never flips and the control stays hidden.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }
    let cancelled = false
    navigator.serviceWorker.ready
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof navigator !== 'undefined') setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Restore prior "saved" state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const rec = JSON.parse(raw) as SavedRecord
        if (typeof rec.count === 'number') {
          setSaved(rec)
          setStatus('saved')
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Listen for the SW's completion message.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }
    const onMessage = (e: MessageEvent) => {
      const data = e.data
      if (!data || data.type !== 'REFERENCE_CACHED') return
      const rec: SavedRecord = {
        count: data.count ?? 0,
        savedAt: new Date().toISOString(),
      }
      setSaved(rec)
      setStatus('saved')
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rec))
      } catch {
        /* ignore */
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () =>
      navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [])

  const download = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return
    setStatus('saving')
    try {
      const reg = await navigator.serviceWorker.ready
      const target = reg.active ?? navigator.serviceWorker.controller
      if (!target) {
        setStatus('error')
        return
      }
      target.postMessage({
        type: 'CACHE_REFERENCE',
        urls: buildReferenceUrls(),
      })
      // Completion arrives via the message listener above.
    } catch {
      setStatus('error')
    }
  }, [])

  if (!ready) return null

  const total = buildReferenceUrls().length

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.08] text-accent">
          {online ? (
            <CloudDownload className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <WifiOff className="h-4 w-4" strokeWidth={1.75} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">
            Use the full reference offline
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink/50">
            {status === 'saved' && saved
              ? `Saved ${saved.count} pages — the catalog and glossary work without a connection.`
              : `Download all ${total} catalog, glossary, and research-area pages for offline use at the bench.`}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {status === 'saving' ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-ink/[0.08] px-4 py-2 text-xs font-medium text-ink/55">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving…
          </span>
        ) : status === 'saved' ? (
          <button
            type="button"
            onClick={download}
            disabled={!online}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.06] px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Saved · Update
          </button>
        ) : (
          <button
            type="button"
            onClick={download}
            disabled={!online}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2DD4A8] px-4 py-2 text-xs font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] disabled:cursor-not-allowed disabled:opacity-50"
            title={!online ? 'Reconnect to download' : undefined}
          >
            <CloudDownload className="h-3.5 w-3.5" />
            Download reference
          </button>
        )}
        {status === 'error' && (
          <p className="mt-1.5 text-[11px] text-amber-400/70">
            Couldn’t save — please try again.
          </p>
        )}
      </div>
    </div>
  )
}
