'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Check } from 'lucide-react'
import { isWatched, toggleWatch } from '@/lib/workspace'

// Adds/removes a peptide from the personal workspace watchlist (localStorage).
// Rendered as a client island on the (server-rendered) catalog detail page.
export default function WatchButton({ slug }: { slug: string }) {
  const [watched, setWatched] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setWatched(isWatched(slug))
    setReady(true)
  }, [slug])

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        onClick={() => setWatched(toggleWatch(slug))}
        aria-pressed={watched}
        className={
          'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ' +
          (watched
            ? 'border-[#2DD4A8]/40 bg-[#2DD4A8]/[0.10] text-[#2DD4A8]'
            : 'border-white/12 text-white/70 hover:border-white/25 hover:text-white')
        }
        style={{ opacity: ready ? 1 : 0.6 }}
      >
        {watched ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
        {watched ? 'In your workspace' : 'Add to workspace'}
      </button>
      {watched && ready && (
        <Link href="/workspace" className="text-xs text-white/45 underline-offset-2 hover:text-[#2DD4A8] hover:underline">
          View workspace →
        </Link>
      )}
    </div>
  )
}
