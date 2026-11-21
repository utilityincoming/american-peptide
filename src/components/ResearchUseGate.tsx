'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
import {
  ensureResearchAck,
  hasAcked,
  registerPresenter,
  setAcked,
  subscribe,
} from '@/lib/research-ack'

const SESSION_DISMISS_KEY = 'amp-research-ack-dismissed'

const TITLE = 'Research & educational use only'

function DisclaimerBody() {
  return (
    <>
      <p>
        AmericanPeptide.com is a computational research and educational
        reference. It is <span className="text-ink/80">not a medical device</span>{' '}
        and does not provide medical advice, diagnosis, treatment, dosing
        protocols, or an offer to sell any compound.
      </p>
      <p>
        All content — including chemistry data, calculators, and AI-generated
        output — is for informational purposes and requires independent
        validation. Consult a qualified professional and comply with applicable
        laws before any experimental use.
      </p>
    </>
  )
}

/**
 * Renders two surfaces for the research-use disclaimer and wires the shared
 * acknowledgment (see src/lib/research-ack.ts):
 *
 *  1. A slim, non-blocking, dismissible banner for first-time visitors. It never
 *     covers the page or locks scroll, so the viewer sees real content first.
 *  2. A blocking modal raised on demand the first time a viewer starts a
 *     research action (AI chat, peptide analysis) without having acknowledged.
 *
 * Returning visitors who already acknowledged see neither. Renders nothing on
 * the server / until mounted, so it never blocks SEO crawling or causes a
 * hydration mismatch.
 */
export default function ResearchUseGate() {
  // Ambient banner visibility.
  const [showBanner, setShowBanner] = useState(false)
  // On-demand blocking modal, resolved by the awaiting research action.
  const [modal, setModal] = useState<{ resolve: (v: boolean) => void } | null>(null)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  // Decide whether to show the ambient banner, and keep it in sync if the
  // acknowledgment is granted elsewhere (e.g. via the modal).
  useEffect(() => {
    const sync = () => {
      let dismissed = false
      try {
        dismissed = window.sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'
      } catch {
        /* ignore */
      }
      setShowBanner(!hasAcked() && !dismissed)
    }
    sync()
    return subscribe(sync)
  }, [])

  // Register the imperative presenter so research actions can raise the modal.
  useEffect(() => {
    registerPresenter(
      () =>
        new Promise<boolean>((resolve) => {
          setModal({ resolve })
        }),
    )
    return () => registerPresenter(null)
  }, [])

  // While the modal is open, lock scroll and focus the primary action.
  useEffect(() => {
    if (!modal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    confirmRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [modal])

  const acknowledge = useCallback(() => {
    setAcked() // persists + notifies subscribers (banner hides)
  }, [])

  const dismissBanner = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowBanner(false)
  }, [])

  const confirmModal = useCallback(() => {
    acknowledge()
    modal?.resolve(true)
    setModal(null)
  }, [acknowledge, modal])

  const cancelModal = useCallback(() => {
    modal?.resolve(false)
    setModal(null)
  }, [modal])

  return (
    <>
      {showBanner && !modal && (
        <div
          role="region"
          aria-label={TITLE}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
        >
          <div className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-2xl border border-hairline bg-panel/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5">
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent sm:inline-flex">
              <FlaskConical className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 text-sm leading-relaxed text-ink/60">
              <p>
                <span className="font-semibold text-ink">{TITLE}.</span>{' '}
                AmericanPeptide.com is a computational research &amp; educational
                reference — <span className="text-ink/80">not a medical device</span>.
                No medical advice, diagnosis, dosing, or offer to sell. AI output
                requires independent validation.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={acknowledge}
                  className="rounded-lg bg-[#7EE0B5] px-4 py-2 text-sm font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EE0B5]/60"
                >
                  I understand
                </button>
                <a
                  href="/methodology"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                >
                  Learn more
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss notice"
              className="-m-1 shrink-0 rounded-lg p-1 text-ink/40 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EE0B5]/60"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="research-ack-title"
          aria-describedby="research-ack-body"
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={cancelModal}
            className="absolute inset-0 cursor-default bg-surface-deep/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-hairline bg-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-7">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
              <FlaskConical className="h-5 w-5" strokeWidth={1.75} />
            </div>

            <h2
              id="research-ack-title"
              className="mb-3 text-xl font-bold tracking-tight text-ink"
            >
              {TITLE}
            </h2>

            <div
              id="research-ack-body"
              className="space-y-3 text-sm leading-relaxed text-ink/60"
            >
              <DisclaimerBody />
              <p className="text-ink/50">
                Acknowledge to continue with this research tool.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                ref={confirmRef}
                type="button"
                onClick={confirmModal}
                className="w-full rounded-xl bg-[#7EE0B5] px-5 py-3 text-sm font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EE0B5]/60"
              >
                I understand — continue
              </button>
              <button
                type="button"
                onClick={cancelModal}
                className="w-full rounded-xl px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EE0B5]/60"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { ensureResearchAck }
