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
// Monthly buckets self-expire after ~13 months — long enough to read a rolling
// year of history, short enough that the keyspace can't grow without bound.
const MONTH_TTL_SEC = 60 * 60 * 24 * 400

const vendorAllKey = (id: string) => `${PREFIX}:v:${id}`
const vendorMonthKey = (id: string, ym: string) => `${PREFIX}:v:${id}:${ym}`
const productAllKey = (id: string, slug: string) => `${PREFIX}:vp:${id}:${slug}`

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

export interface VendorReferralStats {
  id: string
  name: string
  active: boolean
  allTime: number
  months: { month: string; clicks: number }[]
  byProduct: { slug: string; clicks: number }[]
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
      const [allTime, monthVals, productVals] = await Promise.all([
        kv.get(vendorAllKey(v.id)).then(num),
        Promise.all(months.map((m) => kv.get(vendorMonthKey(v.id, m)).then(num))),
        Promise.all(
          productSlugs.map(async (slug) => ({
            slug,
            clicks: num(await kv.get(productAllKey(v.id, slug))),
          })),
        ),
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
    community: {
      allTime: communityAllTime,
      months: months.map((month, i) => ({ month, clicks: communityMonthVals[i] })),
    },
    vendors,
  }
}
