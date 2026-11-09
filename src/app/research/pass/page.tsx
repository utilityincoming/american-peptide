'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Dna, KeyRound } from 'lucide-react'

interface PassStatus {
  enabled: boolean
  pass: { expiresAt: string } | null
  limit?: number
  remaining?: number
  offer: { available: boolean; price: string; days: number }
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return { ok: res.ok, data }
  } catch {
    return { ok: false, data: { error: 'Network error. Please check your connection and try again.' } }
  }
}

export default function ResearchPassPage() {
  const [status, setStatus] = useState<PassStatus | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const loadStatus = async () => {
      try {
        const res = await fetch('/api/pass')
        if (res.ok) setStatus(await res.json())
      } catch {
        // leave status null — the page still renders the redeem form
      }
    }

    const run = async () => {
      // Returning from Stripe: confirm the payment server-side and activate.
      const sessionId = new URLSearchParams(window.location.search).get('session_id')
      if (sessionId) {
        setClaiming(true)
        const { ok, data } = await postJson('/api/pass/claim', { sessionId })
        if (ok && typeof data.code === 'string') setIssuedCode(data.code)
        else setClaimError(typeof data.error === 'string' ? data.error : 'Could not confirm the payment.')
        setClaiming(false)
      }
      await loadStatus()
    }
    run()
  }, [])

  const buy = async () => {
    if (buying) return
    setBuying(true)
    setBuyError(null)
    const { ok, data } = await postJson('/api/pass/checkout', {})
    if (ok && typeof data.url === 'string') {
      window.location.assign(data.url)
      return
    }
    setBuyError(typeof data.error === 'string' ? data.error : 'Could not start checkout.')
    setBuying(false)
  }

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || redeeming) return
    setRedeeming(true)
    setRedeemError(null)
    const { ok, data } = await postJson('/api/pass', { code })
    if (ok) {
      setCode('')
      try {
        const res = await fetch('/api/pass')
        if (res.ok) setStatus(await res.json())
      } catch {
        // status refresh is cosmetic; the cookie is already set
      }
    } else {
      setRedeemError(typeof data.error === 'string' ? data.error : "That code isn't valid.")
    }
    setRedeeming(false)
  }

  const copyCode = async () => {
    if (!issuedCode) return
    try {
      await navigator.clipboard.writeText(issuedCode)
      setCopied(true)
    } catch {
      // clipboard unavailable — the code is on screen to copy by hand
    }
  }

  const offer = status?.offer
  const price = offer?.price ?? '$29.99'
  const days = offer?.days ?? 30
  const freeLimit = status?.limit ?? 5
  const active = status?.pass ?? null

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
          Everyone gets <strong className="text-ink/90">{freeLimit} free Peptide Agent searches every week</strong>.
          A Research Pass removes the limit for {days} days for a one-time{' '}
          <strong className="text-ink/90">{price}</strong>.
        </p>

        {/* ── Just purchased ── */}
        {claiming && (
          <div role="status" className="mt-8 rounded-2xl border border-hairline bg-fill p-5 text-sm text-ink/65">
            Confirming your payment…
          </div>
        )}
        {claimError && (
          <div role="alert" className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/[0.06] p-5 text-sm text-ink/80">
            {claimError}
          </div>
        )}
        {issuedCode && (
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
                {issuedCode}
              </code>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs text-ink/70 transition-colors hover:bg-fill-strong hover:text-ink"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>
          </div>
        )}

        {/* ── Active pass ── */}
        {active && (
          <div className="mt-6 rounded-2xl border border-hairline bg-fill p-5 text-sm">
            <p className="font-medium text-ink/90">Research Pass active</p>
            <p className="mt-1 text-xs text-ink/60">
              No weekly limit until {fmtDate(active.expiresAt)}. The pass does not renew automatically.
            </p>
            <Link
              href="/research"
              className="mt-4 inline-block rounded-xl bg-[#5BA88C] px-4 py-2 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#6FBF9A]"
            >
              Open the Peptide Agent
            </Link>
          </div>
        )}

        {/* ── Offer ── */}
        {!active && !claiming && !issuedCode && (
          <div className="mt-8 rounded-2xl border border-hairline bg-fill p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{price}</span>
              <span className="text-sm text-ink/55">one-time · {days} days</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              {[
                `No weekly limit on Peptide Agent searches for ${days} days`,
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
            {offer && !offer.available ? (
              <p className="mt-5 text-sm text-ink/55">
                The Research Pass isn&rsquo;t on sale yet. Your {freeLimit} free weekly searches still apply.
              </p>
            ) : (
              <button
                onClick={buy}
                disabled={buying || !offer}
                className="mt-5 rounded-xl bg-[#5BA88C] px-5 py-2.5 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#6FBF9A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buying ? 'Opening secure checkout…' : `Get the Research Pass — ${price}`}
              </button>
            )}
            {buyError && (
              <p role="alert" className="mt-3 text-xs text-red-400">
                {buyError}
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink/45">
              Payment is handled by Stripe; your card details never reach this site. After paying you
              return here and receive an access code on screen.
            </p>
          </div>
        )}

        {/* ── Redeem a code ── */}
        {!active && (
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
            {redeemError && (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {redeemError}
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
