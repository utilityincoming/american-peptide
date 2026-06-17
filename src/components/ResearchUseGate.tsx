'use client'

import { useEffect, useRef, useState } from 'react'
import { FlaskConical } from 'lucide-react'

const STORAGE_KEY = 'amp-research-ack'
// Bump to re-prompt all users if the acknowledgment wording materially changes.
const ACK_VERSION = '1'

/**
 * One-time "research & educational use only" acknowledgment shown on first
 * launch. Makes the research-use positioning explicit (important for the
 * App Store reviewer / guideline 4.2 medical framing) and is persisted per
 * device so returning visitors aren't re-prompted.
 *
 * Renders nothing on the server and until mounted, so it never blocks SEO
 * crawling (page content is in the DOM behind the overlay) and avoids a
 * hydration mismatch.
 */
export default function ResearchUseGate() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== ACK_VERSION) {
        setOpen(true)
      }
    } catch {
      // If storage is unavailable, show once (don't trap the user in a loop).
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    buttonRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function acknowledge() {
    try {
      window.localStorage.setItem(STORAGE_KEY, ACK_VERSION)
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="research-ack-title"
      aria-describedby="research-ack-body"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-surface-deep/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ink/[0.08] bg-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-7">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-accent">
          <FlaskConical className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <h2
          id="research-ack-title"
          className="mb-3 text-xl font-bold tracking-tight text-ink"
        >
          Research &amp; educational use only
        </h2>

        <div
          id="research-ack-body"
          className="space-y-3 text-sm leading-relaxed text-ink/60"
        >
          <p>
            AmericanPeptide.com is a computational research and educational
            reference. It is <span className="text-ink/80">not a medical
            device</span> and does not provide medical advice, diagnosis,
            treatment, dosing protocols, or an offer to sell any compound.
          </p>
          <p>
            All content — including chemistry data, calculators, and
            AI-generated output — is for informational purposes and requires
            independent validation. Consult a qualified professional and comply
            with applicable laws before any experimental use.
          </p>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={acknowledge}
          className="mt-6 w-full rounded-xl bg-[#2DD4A8] px-5 py-3 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4A8]/60"
        >
          I understand
        </button>
      </div>
    </div>
  )
}
