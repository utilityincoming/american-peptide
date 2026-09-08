'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Copy-to-clipboard controls for the press page. Kept as the page's only client
 * island so the media kit itself stays a static server component — the boilerplate
 * and hex swatches are the two things a journalist or partner actually wants to
 * lift, so those get a one-click copy with transient confirmation.
 */

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      window.setTimeout(() => setDone(false), 1300)
    } catch {
      /* clipboard blocked (insecure context, denied permission) — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? 'Copied to clipboard' : label}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        done
          ? 'border-[#2DD4A8] bg-[#2DD4A8] text-[#0B1220]'
          : 'border-ink/15 text-ink/60 hover:border-accent hover:text-ink'
      }`}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? 'Copied' : label}
    </button>
  )
}

export function HexSwatch({ name, hex }: { name: string; hex: string }) {
  const [done, setDone] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex)
      setDone(true)
      window.setTimeout(() => setDone(false), 1200)
    } catch {
      /* no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${name} ${hex}`}
      className="group overflow-hidden rounded-xl border border-ink/[0.08] bg-surface-deep text-left transition-colors hover:border-accent"
    >
      <span className="block h-12 w-full" style={{ background: hex }} />
      <span className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-xs text-ink/80">{name}</span>
        <span className={`font-mono text-[11px] uppercase ${done ? 'text-accent' : 'text-ink/40'}`}>
          {done ? 'Copied' : hex}
        </span>
      </span>
    </button>
  )
}
