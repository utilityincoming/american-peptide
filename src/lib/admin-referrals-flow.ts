// Admin referrals dashboard — the client-side state machine.
//
// Pure: no React, no DOM, no fetch. The page (/admin/referrals) holds this state
// in useReducer and dispatches events; everything it renders is derived by the
// selectors at the bottom. The network call lives in admin-referrals-client.ts.
// Tests: admin-referrals-flow.test.ts.
//
// One machine — loading the Bearer-gated GET /api/admin/referrals:
//
//      idle ──load_started──▶ loading ──load_succeeded──▶ loaded
//        ▲                       │
//        └──── error ◀──load_failed  (load_started retries from error/loaded)
//
// `error` carries a code: 'unauthorized' (401 — bad/empty admin key),
// 'unavailable' (503 — no ADMIN_SECRET set in prod), or 'network'.

import type { ReferralStats, VendorReferralStats } from './referrals'

export type ErrorCode = 'unauthorized' | 'unavailable' | 'network'

export type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; stats: ReferralStats }
  | { status: 'error'; code: ErrorCode; message: string }

export type Event =
  | { type: 'load_started' }
  | { type: 'load_succeeded'; stats: ReferralStats }
  | { type: 'load_failed'; code: ErrorCode; message: string }

export const initialState: State = { status: 'idle' }

export function reducer(state: State, event: Event): State {
  switch (event.type) {
    case 'load_started':
      return { status: 'loading' }
    case 'load_succeeded':
      return { status: 'loaded', stats: event.stats }
    case 'load_failed':
      return { status: 'error', code: event.code, message: event.message }
    default:
      return state
  }
}

// ── Derived view model ────────────────────────────────────────────────────────

export interface VendorRow {
  id: string
  name: string
  active: boolean
  /** Human (counted) clicks. */
  clicks: number
  /** Filtered non-human hits — not part of `clicks`. */
  botClicks: number
  /** botClicks / (clicks + botClicks), 0..1. */
  botShare: number
  conversions: number
  revenueCents: number
  conversionRate: number
  epcCents: number
}

export function toVendorRow(v: VendorReferralStats): VendorRow {
  const total = v.allTime + v.botClicks
  return {
    id: v.id,
    name: v.name,
    active: v.active,
    clicks: v.allTime,
    botClicks: v.botClicks,
    botShare: total > 0 ? v.botClicks / total : 0,
    conversions: v.conversions,
    revenueCents: v.revenueCents,
    conversionRate: v.conversionRate,
    epcCents: v.epcCents,
  }
}

/** Dollars from integer cents, e.g. 4999 → "$49.99". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** A 0..1 ratio as a whole-number percent, e.g. 0.1234 → "12%". */
export function formatPct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export interface DashboardView {
  rows: VendorRow[]
  totals: {
    clicks: number
    botClicks: number
    botShare: number
    conversions: number
    revenueCents: number
  }
  community: { clicks: number }
  persistent: boolean
  generated: string
}

/** Shape the loaded stats for the table (vendors sorted by human clicks). */
export function toDashboardView(stats: ReferralStats): DashboardView {
  const rows = stats.vendors.map(toVendorRow).sort((a, b) => b.clicks - a.clicks)
  const totalBot = stats.totalBotClicks
  const total = stats.totalAllTime + totalBot
  return {
    rows,
    totals: {
      clicks: stats.totalAllTime,
      botClicks: totalBot,
      botShare: total > 0 ? totalBot / total : 0,
      conversions: stats.totalConversions,
      revenueCents: stats.totalRevenueCents,
    },
    community: { clicks: stats.community.allTime },
    persistent: stats.persistent,
    generated: stats.generated,
  }
}
