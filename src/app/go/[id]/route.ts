// Tracked affiliate redirect: /go/<vendor-id>
//
// Keeps the referral parameter server-side and gives us one chokepoint to
// attach analytics / rate the outbound later. Only redirects to a vendor whose
// affiliate relationship is active; everything else falls back to the catalog.

import { NextResponse, after } from 'next/server'
import { VENDORS } from '@/lib/vendors'
import { IS_APP_BUILD } from '@/lib/platform'
import { recordReferralClick, recordBotClick } from '@/lib/referrals'
import { isNonHumanClick } from '@/lib/bot-detect'
import { COMMUNITY_REF_ID, COMMUNITY_URL } from '@/lib/community'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Reference-only on the Play (TWA) build: never route out to a vendor, even
  // via a deep link. Fall back to the catalog.
  if (IS_APP_BUILD) {
    return NextResponse.redirect(new URL('/catalog', req.url), 302)
  }

  const { id } = await params

  // Classify the hit once, from headers only. A non-human hit (crawler, link
  // unfurler, prefetch, uptime probe) still gets redirected — we only divert its
  // click OUT of the human referral count and into a separate bot counter, so
  // our numbers match what a partner actually sees. See lib/bot-detect.
  const { bot } = isNonHumanClick(req.headers)

  // The community (Telegram) is not a vendor, but it rides the same chokepoint
  // so a join click lands in the same no-PII referral counter. No ?p= handling
  // and no vendor lookup - the destination is a fixed constant.
  if (id === COMMUNITY_REF_ID) {
    after(async () => {
      try {
        await (bot ? recordBotClick(COMMUNITY_REF_ID) : recordReferralClick(COMMUNITY_REF_ID))
      } catch {
        /* analytics is a courtesy; never surface a store error to the redirect */
      }
    })
    return NextResponse.redirect(COMMUNITY_URL, 302)
  }

  const vendor = VENDORS.find((v) => v.id === id)

  // ?p=<catalog-slug> selects a per-product deep link when the partner supplied
  // one. The slug is only ever used as a KEY into our own map — never as a URL —
  // so an unknown or hostile value can't redirect anywhere except the vendor's
  // normal destination.
  const slug = new URL(req.url).searchParams.get('p')
  const productUrl = slug ? vendor?.affiliate?.productUrls?.[slug] : undefined

  const dest =
    vendor?.affiliate?.active && (productUrl || vendor.affiliate.url)
      ? (productUrl ?? vendor.affiliate.url!)
      : null

  if (!vendor || !dest) {
    return NextResponse.redirect(new URL('/catalog', req.url), 302)
  }

  // Best-effort, no-PII referral analytics on the single outbound chokepoint
  // (see lib/referrals). Scheduled via after() so a slow or failing store can
  // never delay or break the redirect — the outbound link is the product. The
  // per-product counter fires only for a real deep link, not a bare ?p= slug.
  const productSlug = productUrl ? (slug ?? undefined) : undefined
  after(async () => {
    try {
      // A bot's product deep link is not a real intent signal, so bots are
      // counted only at the vendor level, never per-product.
      await (bot ? recordBotClick(vendor.id) : recordReferralClick(vendor.id, productSlug))
    } catch {
      /* analytics is a courtesy; never surface a store error to the redirect */
    }
  })

  return NextResponse.redirect(dest, 302)
}
