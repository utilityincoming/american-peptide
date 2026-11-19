'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Dna, KeyRound } from 'lucide-react'
import { PENDING_QUESTION_KEY, initialPassPage, passPagePanels, passPageReducer } from '@/lib/pass-flow'
import { claimPass, fetchPassSummary, redeemCode, requestCheckoutUrl } from '@/lib/pass-client'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

export default function ResearchPassPage() {
  // Every panel below is derived from this one state — see src/lib/pass-flow.ts.
  const [state, dispatch] = useReducer(passPageReducer, initialPassPage)
  const [code, setCode] = useState('')
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const started = useRef(false)
  const sessionId = useRef<string | null>(null)

  const loadSummary = useCallback(async () => {
    const summary = await fetchPassSummary()
    dispatch(summary ? { type: 'summary_loaded', summary } : { type: 'summary_failed' })
  }, [])

  // Returning from Stripe: confirm the payment server-side and activate. The
  // summary is read afterwards so it reflects the cookie the claim just set.
  const confirmPayment = useCallback(async () => {
    if (!sessionId.current) return
    dispatch({ type: 'claim_started' })
    const result = await claimPass(sessionId.current)
    dispatch(
      result.ok
        ? { type: 'claim_succeeded', code: result.code }
        : { type: 'claim_failed', error: result.error, retryable: result.retryable },
    )
    await loadSummary()
  }, [loadSummary])

  useEffect(() => {
    if (started.current) return
    started.current = true
    const saved = sessionStorage.getItem(PENDING_QUESTION_KEY)
    if (saved?.trim()) setPendingQuestion(saved.trim())

    sessionId.current = new URLSearchParams(window.location.search).get('session_id')
    if (sessionId.current) confirmPayment()
    else loadSummary()
  }, [confirmPayment, loadSummary])

  const panels = passPagePanels(state)
  const { issued, activePass: active } = panels
  const buying = state.checkout.status === 'starting'
  const redeeming = state.redeem.status === 'checking'

  const buy = async () => {
    if (!panels.canBuy) return
    dispatch({ type: 'checkout_started' })
    const result = await requestCheckoutUrl()
    if (result.ok) window.location.assign(result.url)
    else dispatch({ type: 'checkout_failed', error: result.error })
  }

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || redeeming) return
    dispatch({ type: 'redeem_started' })
    const result = await redeemCode(code)
    if (result.ok) {
      setCode('')
      dispatch({ type: 'redeem_succeeded' })
      // The cookie is already set; this refresh only updates what is shown.
      await loadSummary()
    } else {
      dispatch({ type: 'redeem_failed', error: result.error })
    }
  }

  const copyCode = async () => {
    if (!issued) return
    try {
      await navigator.clipboard.writeText(issued.code)
      dispatch({ type: 'code_copied' })
      setTimeout(() => dispatch({ type: 'copy_reset' }), 2000)
    } catch {
      // clipboard unavailable — the code is on screen to copy by hand
    }
  }

  const price = panels.terms?.price ?? '$15'
  const days = panels.terms?.days ?? 30
  const freeLimit = panels.freeLimit ?? 5

  return (
    <div className="min-h-screen bg-surface text-ink">
      <main className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
          <Dna className="h-4 w-4" />
          Research Pass
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Unlimited Peptide Agent searches
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Everyone gets <strong className="text-ink/90">{freeLimit} free Peptide Agent searches every day</strong>.
          A Research Pass removes the limit for {days} days for a one-time{' '}
          <strong className="text-ink/90">{price}</strong>.
        </p>

        {/* ── Just purchased ── */}
        {panels.confirming && (
          <div role="status" className="mt-8 rounded-2xl border border-hairline bg-fill p-5 text-sm text-ink/65">
            Confirming your payment…
          </div>
        )}
        {panels.claimError && (
          <div role="alert" className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/[0.06] p-5 text-sm text-ink/80">
            <p>{panels.claimError.error}</p>
            {panels.claimError.retryable && (
              <>
                <button
                  type="button"
                  onClick={confirmPayment}
                  className="mt-4 rounded-xl bg-[#7EE0B5] px-4 py-2 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
                >
                  Check again
                </button>
                <p className="mt-3 text-xs leading-relaxed text-ink/55">
                  There&rsquo;s no need to pay again &mdash; a completed payment is confirmed here.
                </p>
              </>
            )}
          </div>
        )}
        {issued && (
          <div className="mt-8 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-ink/90">
              <Check className="h-4 w-4 text-accent" />
              Payment confirmed — your pass is active on this device.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink/60">
              This is your access code. Save it now: it is how you unlock the pass on another device or
              browser, or after clearing cookies. We don&rsquo;t have your email, so we can&rsquo;t send it
              to you later.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-base tracking-wider text-ink">
                {issued.code}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs text-ink/70 transition-colors hover:bg-fill-strong hover:text-ink"
              >
                <Copy className="h-3.5 w-3.5" />
                {issued.copied ? 'Copied' : 'Copy code'}
              </button>
            </div>
            <div className="mt-4">
              <Link
                href={pendingQuestion ? '/research?resume=1' : '/research'}
                className="inline-block rounded-xl bg-[#7EE0B5] px-4 py-2.5 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
              >
                {pendingQuestion ? 'Continue your search' : 'Open the Peptide Agent'}
              </Link>
            </div>
            {pendingQuestion && (
              <p className="mt-3 text-xs leading-relaxed text-ink/55">
                Your question is saved and will be asked when you continue.
              </p>
            )}
          </div>
        )}

        {/* ── Active pass ── */}
        {active && (
          <div className="mt-6 rounded-2xl border border-hairline bg-fill p-5 text-sm">
            <p className="font-medium text-ink/90">Research Pass active</p>
            <p className="mt-1 text-xs text-ink/60">
              No daily limit until {fmtDate(active.expiresAt)}. The pass does not renew automatically.
            </p>
            {!issued && (
              <Link
                href={pendingQuestion ? '/research?resume=1' : '/research'}
                className="mt-4 inline-block rounded-xl bg-[#7EE0B5] px-4 py-2 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
              >
                {pendingQuestion ? 'Continue your search' : 'Open the Peptide Agent'}
              </Link>
            )}
          </div>
        )}

        {/* ── Offer ── */}
        {panels.offer !== 'hidden' && (
          <div className="mt-8 rounded-2xl border border-hairline bg-fill p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{price}</span>
              <span className="text-sm text-ink/55">one-time · {days} days</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              {[
                `No daily limit on Peptide Agent searches for ${days} days`,
                'Cited answers grounded in PubChem, ClinicalTrials.gov, PubMed and UniProt',
                'Also covers AI sequence analysis in the Design Lab',
                'No account needed, and it does not renew — nothing to cancel',
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {panels.offer === 'not_on_sale' ? (
              <p className="mt-5 text-sm text-ink/55">
                The Research Pass isn&rsquo;t on sale yet. Your {freeLimit} free daily searches still apply.
              </p>
            ) : (
              <button
                onClick={buy}
                disabled={!panels.canBuy}
                className="mt-5 rounded-xl bg-[#7EE0B5] px-5 py-2.5 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#A6F0CC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buying ? 'Opening secure checkout…' : `Get the Research Pass — ${price}`}
              </button>
            )}
            {state.checkout.status === 'failed' && (
              <p role="alert" className="mt-3 text-xs text-red-400">
                {state.checkout.error}
              </p>
            )}
            {pendingQuestion && (
              <p className="mt-4 text-xs leading-relaxed text-ink/55">
                Your question is saved.{' '}
                <Link href="/research" className="text-accent underline-offset-2 hover:underline">
                  Back to the Peptide Agent
                </Link>
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink/45">
              Payment is handled by Stripe; your card details never reach this site. After paying you
              return here and receive an access code on screen.
            </p>
          </div>
        )}

        {/* ── Redeem a code ── */}
        {panels.showRedeem && (
          <form onSubmit={redeem} className="mt-6 rounded-2xl border border-hairline p-5">
            <label htmlFor="pass-code" className="flex items-center gap-2 text-sm font-medium text-ink/85">
              <KeyRound className="h-4 w-4 text-ink/55" />
              Already have an access code?
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                id="pass-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="APP-XXXX-XXXX-XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-xl border border-hairline bg-fill px-3 py-2 font-mono text-sm text-ink placeholder-ink/25 outline-none focus:border-accent/30"
              />
              <button
                type="submit"
                disabled={!code.trim() || redeeming}
                className="rounded-xl border border-hairline px-4 py-2 text-sm text-ink/80 transition-colors hover:bg-fill-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                {redeeming ? 'Checking…' : 'Unlock'}
              </button>
            </div>
            {state.redeem.status === 'failed' && (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {state.redeem.error}
              </p>
            )}
          </form>
        )}

        <p className="mt-10 text-xs leading-relaxed text-ink/45">
          AmericanPeptide.com is a research and educational reference, not a medical device. The Peptide
          Agent&rsquo;s outputs are computational hypotheses that require independent validation and are not
          medical advice, diagnosis, or treatment. A fair-use limit applies to prevent automated abuse of a
          pass. See our <Link href="/privacy" className="underline underline-offset-2 hover:text-ink/70">privacy policy</Link>.
        </p>
      </main>
    </div>
  )
}
