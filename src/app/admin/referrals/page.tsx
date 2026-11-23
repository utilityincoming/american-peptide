'use client'

// Admin referrals dashboard. A thin viewer over the Bearer-gated
// GET /api/admin/referrals: enter the admin key once (kept in localStorage,
// sent only as an Authorization header), and read the human-vs-bot click split
// alongside conversions and revenue. All state lives in the reducer in
// lib/admin-referrals-flow; fetching lives in lib/admin-referrals-client.

import { useEffect, useReducer, useState } from 'react'
import {
  reducer,
  initialState,
  toDashboardView,
  formatCents,
  formatPct,
} from '@/lib/admin-referrals-flow'
import { fetchReferralStats, importConversions } from '@/lib/admin-referrals-client'

const KEY_STORAGE = 'ap_admin_key'

export default function AdminReferralsPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [key, setKey] = useState('')
  const [months, setMonths] = useState(6)
  const [ready, setReady] = useState(false)

  // Rehydrate the saved key once on mount (localStorage is client-only, so this
  // can't run during SSR render), then auto-load if we have one. Setting state
  // from the stored value is the intended "sync from an external store" case.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    let saved = ''
    try {
      saved = localStorage.getItem(KEY_STORAGE) ?? ''
    } catch {
      /* private mode / blocked storage — just start empty */
    }
    if (saved) setKey(saved)
    setReady(true)
    if (saved) void load(saved, months)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function load(k: string, m: number) {
    dispatch({ type: 'load_started' })
    const result = await fetchReferralStats(k.trim(), m)
    if (result.ok) {
      try {
        if (k.trim()) localStorage.setItem(KEY_STORAGE, k.trim())
      } catch {
        /* non-fatal */
      }
      dispatch({ type: 'load_succeeded', stats: result.stats })
    } else {
      dispatch({ type: 'load_failed', code: result.code, message: result.message })
    }
  }

  const view = state.status === 'loaded' ? toDashboardView(state.stats) : null

  // "Record a sale" form — feeds the import endpoint for partners who report
  // sales in their own dashboard (ABSIM, Paramount, Amino Club) rather than via
  // the S2S postback.
  const [form, setForm] = useState({ vendor: '', orderId: '', amount: '', product: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function submitConversion(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormMsg(null)
    const result = await importConversions(key.trim(), [
      {
        vendor: form.vendor,
        orderId: form.orderId.trim(),
        amount: form.amount.trim(),
        product: form.product.trim() || undefined,
      },
    ])
    setSubmitting(false)
    if (!result.ok) {
      setFormMsg({ kind: 'err', text: result.message })
      return
    }
    const { recorded, duplicate, invalid } = result.summary
    if (recorded) {
      setFormMsg({ kind: 'ok', text: `Recorded sale for order ${form.orderId.trim()}.` })
      setForm((f) => ({ ...f, orderId: '', amount: '', product: '' }))
      void load(key, months) // refresh the table
    } else if (duplicate) {
      setFormMsg({ kind: 'err', text: 'Already recorded (duplicate order id).' })
    } else {
      setFormMsg({ kind: 'err', text: result.firstError ?? `Not recorded (${invalid} invalid).` })
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Referrals</h1>
      <p className="mt-1 text-sm text-ink/60">
        Human vs. bot clicks, conversions, and revenue from the <code>/go</code> chokepoint.
      </p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void load(key, months)
        }}
      >
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          Admin key
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ADMIN_SECRET"
            className="w-64 rounded border border-ink/20 bg-transparent px-2 py-1.5 font-mono text-sm text-ink"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          Months
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded border border-ink/20 bg-transparent px-2 py-1.5 text-sm text-ink"
          >
            {[1, 3, 6, 12, 13].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="rounded bg-ink px-4 py-1.5 text-sm font-medium text-bg disabled:opacity-50"
        >
          {state.status === 'loading' ? 'Loading…' : 'Load'}
        </button>
      </form>

      {ready && state.status === 'idle' && (
        <p className="mt-6 text-sm text-ink/50">Enter the admin key to load referral stats.</p>
      )}

      {state.status === 'error' && (
        <p className="mt-6 rounded border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}

      {view && (
        <section className="mt-8">
          {!view.persistent && (
            <p className="mb-4 rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Store is not persistent (no Upstash configured) — these counts are in-memory and
              per-instance, so they reset and under-report. Not a real picture.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Human clicks" value={view.totals.clicks.toLocaleString()} />
            <Stat
              label="Bot (filtered)"
              value={`${view.totals.botClicks.toLocaleString()} · ${formatPct(view.totals.botShare)}`}
            />
            <Stat label="Conversions" value={view.totals.conversions.toLocaleString()} />
            <Stat label="Revenue" value={formatCents(view.totals.revenueCents)} />
            <Stat label="Community" value={view.community.clicks.toLocaleString()} />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 px-3 text-right">Human</th>
                  <th className="py-2 px-3 text-right">Bot</th>
                  <th className="py-2 px-3 text-right">Bot %</th>
                  <th className="py-2 px-3 text-right">Conv.</th>
                  <th className="py-2 px-3 text-right">Conv. rate</th>
                  <th className="py-2 px-3 text-right">Revenue</th>
                  <th className="py-2 pl-3 text-right">EPC</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((r) => (
                  <tr key={r.id} className="border-b border-ink/10">
                    <td className="py-2 pr-3">
                      {r.name}
                      {!r.active && <span className="ml-2 text-xs text-ink/40">(inactive)</span>}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink/50">
                      {r.botClicks.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink/50">
                      {formatPct(r.botShare)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.conversions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatPct(r.conversionRate)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatCents(r.revenueCents)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums">{formatCents(r.epcCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-ink/40">
            Bot clicks are filtered non-human /go hits (crawlers, unfurlers, prefetch) and are not
            counted as referrals. Generated {new Date(view.generated).toLocaleString()}.
          </p>

          <div className="mt-10 rounded border border-ink/15 p-4">
            <h2 className="text-sm font-semibold text-ink">Record a sale</h2>
            <p className="mt-1 text-xs text-ink/55">
              For partners who report sales in their own dashboard. Idempotent by order id — safe to
              re-enter.
            </p>
            <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={submitConversion}>
              <label className="flex flex-col gap-1 text-xs text-ink/60">
                Vendor
                <select
                  required
                  value={form.vendor}
                  onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                  className="rounded border border-ink/20 bg-transparent px-2 py-1.5 text-sm text-ink"
                >
                  <option value="">Select…</option>
                  {view.rows
                    .filter((r) => r.active)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink/60">
                Order id
                <input
                  required
                  value={form.orderId}
                  onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                  className="w-36 rounded border border-ink/20 bg-transparent px-2 py-1.5 font-mono text-sm text-ink"
                  placeholder="#1234"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink/60">
                Amount ($)
                <input
                  required
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-24 rounded border border-ink/20 bg-transparent px-2 py-1.5 text-sm text-ink"
                  placeholder="49.99"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink/60">
                Product slug <span className="text-ink/35">(optional)</span>
                <input
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  className="w-40 rounded border border-ink/20 bg-transparent px-2 py-1.5 font-mono text-sm text-ink"
                  placeholder="semaglutide"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-ink px-4 py-1.5 text-sm font-medium text-bg disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Record'}
              </button>
            </form>
            {formMsg && (
              <p
                className={`mt-2 text-xs ${
                  formMsg.kind === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}
              >
                {formMsg.text}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/15 px-3 py-2">
      <div className="text-xs text-ink/50">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{value}</div>
    </div>
  )
}
