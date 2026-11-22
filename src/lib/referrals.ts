// Referral-click analytics for the /go/<id> affiliate chokepoint.
//
// PRIVACY: counts are keyed ONLY by vendor id and, for product deep links, the
// catalog slug. No IP, user agent, timestamp, referrer, or any per-click
// identifier is stored or derived — there is no personal data here, by design.
//
// RELIABILITY: writes are best-effort and must never block or break the outbound
// redirect. The /go route schedules recordReferralClick() via `after()` (so it
// runs after the 302 is sent) and Promise.allSettled swallows partial failures.
// The redirect is the product; the counter is a courtesy.

import { kv } from './kv'
import { VENDORS } from './vendors'
import { COMMUNITY_REF_ID } from './community'

const PREFIX = 'go:clk'
const CNV_PREFIX = 'go:cnv' // conversion (sale) counters
const REV_PREFIX = 'go:rev' // revenue counters, in integer minor units (cents)
// Monthly buckets self-expire after ~13 months — long enough to read a rolling
// year of history, short enough that the keyspace can't grow without bound.
const MONTH_TTL_SEC = 60 * 60 * 24 * 400
// A per-order marker that both dedupes a postback and self-expires, so the
// idempotency keyspace stays bounded by orders within the window.
const ORDER_TTL_SEC = 60 * 60 * 24 * 400

const vendorAllKey = (id: string) => `${PREFIX}:v:${id}`
const vendorMonthKey = (id: string, ym: string) => `${PREFIX}:v:${id}:${ym}`
const productAllKey = (id: string, slug: string) => `${PREFIX}:vp:${id}:${slug}`

const cnvAllKey = (id: string) => `${CNV_PREFIX}:v:${id}`
const cnvMonthKey = (id: string, ym: string) => `${CNV_PREFIX}:v:${id}:${ym}`
const cnvProductKey = (id: string, slug: string) => `${CNV_PREFIX}:vp:${id}:${slug}`
const revAllKey = (id: string) => `${REV_PREFIX}:v:${id}`
const revMonthKey = (id: string, ym: string) => `${REV_PREFIX}:v:${id}:${ym}`
const orderSeenKey = (id: string, orderId: string) => `${CNV_PREFIX}:ord:${id}:${orderId}`

/** Current UTC year-month, e.g. "2026-08". */
function utcMonth(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** The trailing `n` UTC year-months, most recent first. */
function recentMonths(n: number): string[] {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    out.push(utcMonth(d))
    d.setUTCMonth(d.getUTCMonth() - 1)
  }
  return out
}

/**
 * Record one referral click. Best-effort and non-throwing. Bumps an all-time and
 * a current-month counter for the vendor; bumps an all-time counter for the
 * vendor×compound ONLY when the click used a real per-product deep link (`slug`
 * set). Callers pass the slug only when productUrls resolved it — never a raw,
 * unrecognized ?p= value.
 */
export async function recordReferralClick(vendorId: string, slug?: string): Promise<void> {
  const ops: Promise<unknown>[] = [
    kv.incr(vendorAllKey(vendorId)),
    kv.incrWithExpiry(vendorMonthKey(vendorId, utcMonth()), MONTH_TTL_SEC),
  ]
  if (slug) ops.push(kv.incr(productAllKey(vendorId, slug)))
  await Promise.allSettled(ops)
}

export type ConversionOutcome = 'recorded' | 'duplicate'

/**
 * Record one affiliate conversion (a sale reported via the signed postback).
 * Idempotent on (vendorId, orderId): the first call for an order bumps the
 * conversion + revenue counters; a retry with the same order id is a no-op and
 * returns 'duplicate'. Revenue is stored in integer cents to avoid float drift.
 *
 * Callers must have ALREADY verified the postback signature — this function
 * trusts its inputs. Best-effort writes mirror recordReferralClick: a store hit
 * never throws, so a partner's postback always gets a clean ack.
 */
export async function recordConversion(input: {
  vendorId: string
  orderId: string
  amountCents: number
  slug?: string
}): Promise<ConversionOutcome> {
  const { vendorId, orderId, amountCents, slug } = input

  // Idempotency gate: INCR a self-expiring per-order key. Only the first writer
  // sees 1; retries see >1 and skip, so an at-least-once partner (or our own
  // retry) can't double-count a sale. INCR is atomic on Upstash, so this holds
  // under concurrent deliveries of the same order.
  let first = true
  try {
    const seen = await kv.incrWithExpiry(orderSeenKey(vendorId, orderId), ORDER_TTL_SEC)
    first = seen <= 1
  } catch {
    // If even the dedupe marker can't be written, fall through and record —
    // under-counting a real sale is worse than a rare double-count.
  }
  if (!first) return 'duplicate'

  const ops: Promise<unknown>[] = [
    kv.incr(cnvAllKey(vendorId)),
    kv.incrWithExpiry(cnvMonthKey(vendorId, utcMonth()), MONTH_TTL_SEC),
    kv.incrBy(revAllKey(vendorId), amountCents), // all-time: no expiry
    kv.incrBy(revMonthKey(vendorId, utcMonth()), amountCents, MONTH_TTL_SEC),
  ]
  if (slug) ops.push(kv.incr(cnvProductKey(vendorId, slug)))
  await Promise.allSettled(ops)
  return 'recorded'
}

export interface VendorReferralStats {
  id: string
  name: string
  active: boolean
  allTime: number
  months: { month: string; clicks: number }[]
  byProduct: { slug: string; clicks: number }[]
  /** Conversions (sales) reported via the signed postback. */
  conversions: number
  conversionMonths: { month: string; conversions: number }[]
  /** All-time revenue in integer minor units (cents). */
  revenueCents: number
  revenueMonths: { month: string; revenueCents: number }[]
  /** conversions / clicks, 0 when no clicks. */
  conversionRate: number
  /** Earnings per click in cents (revenueCents / clicks), 0 when no clicks. */
  epcCents: number
}

/**
 * The sourcing-community (Telegram) chokepoint. Not a vendor and not part of
 * `totalAllTime` (which is a vendor-outbound sum) — surfaced on its own so a
 * join click is readable instead of written to a key nothing reads.
 */
export interface CommunityReferralStats {
  allTime: number
  months: { month: string; clicks: number }[]
}

export interface ReferralStats {
  generated: string
  persistent: boolean
  months: string[]
  totalAllTime: number
  totalConversions: number
  totalRevenueCents: number
  community: CommunityReferralStats
  vendors: VendorReferralStats[]
}

const num = (v: string | null): number => Number(v) || 0

/**
 * Read the full referral picture for the admin endpoint. Reads only known keys —
 * per vendor: the all-time counter, the last `monthsBack` monthly buckets, and
 * one counter per slug the vendor actually published a deep link for. No SCAN,
 * so cost is bounded by the vendor list, not the keyspace.
 */
export async function getReferralStats(monthsBack = 6): Promise<ReferralStats> {
  const months = recentMonths(monthsBack)
  const vendors = await Promise.all(
    VENDORS.map(async (v): Promise<VendorReferralStats> => {
      const productSlugs = Object.keys(v.affiliate?.productUrls ?? {})
      const [allTime, monthVals, productVals, conversions, cnvMonthVals, revenueCents, revMonthVals] =
        await Promise.all([
          kv.get(vendorAllKey(v.id)).then(num),
          Promise.all(months.map((m) => kv.get(vendorMonthKey(v.id, m)).then(num))),
          Promise.all(
            productSlugs.map(async (slug) => ({
              slug,
              clicks: num(await kv.get(productAllKey(v.id, slug))),
            })),
          ),
          kv.get(cnvAllKey(v.id)).then(num),
          Promise.all(months.map((m) => kv.get(cnvMonthKey(v.id, m)).then(num))),
          kv.get(revAllKey(v.id)).then(num),
          Promise.all(months.map((m) => kv.get(revMonthKey(v.id, m)).then(num))),
        ])
      return {
        id: v.id,
        name: v.name,
        active: Boolean(v.affiliate?.active),
        allTime,
        months: months.map((month, i) => ({ month, clicks: monthVals[i] })),
        byProduct: productVals
          .filter((p) => p.clicks > 0)
          .sort((a, b) => b.clicks - a.clicks),
        conversions,
        conversionMonths: months.map((month, i) => ({ month, conversions: cnvMonthVals[i] })),
        revenueCents,
        revenueMonths: months.map((month, i) => ({ month, revenueCents: revMonthVals[i] })),
        conversionRate: allTime > 0 ? conversions / allTime : 0,
        epcCents: allTime > 0 ? revenueCents / allTime : 0,
      }
    }),
  )
  vendors.sort((a, b) => b.allTime - a.allTime)

  // The community counter shares the go:clk:v:<id> namespace under the reserved
  // `community` id (see lib/community) — read the same keys the /go route writes.
  const [communityAllTime, communityMonthVals] = await Promise.all([
    kv.get(vendorAllKey(COMMUNITY_REF_ID)).then(num),
    Promise.all(months.map((m) => kv.get(vendorMonthKey(COMMUNITY_REF_ID, m)).then(num))),
  ])

  return {
    generated: new Date().toISOString(),
    persistent: kv.persistent,
    months,
    totalAllTime: vendors.reduce((sum, v) => sum + v.allTime, 0),
    totalConversions: vendors.reduce((sum, v) => sum + v.conversions, 0),
    totalRevenueCents: vendors.reduce((sum, v) => sum + v.revenueCents, 0),
    community: {
      allTime: communityAllTime,
      months: months.map((month, i) => ({ month, clicks: communityMonthVals[i] })),
    },
    vendors,
  }
}
