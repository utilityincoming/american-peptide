// Tracked affiliate redirect: /go/<vendor-id>
//
// Keeps the referral parameter server-side and gives us one chokepoint to
// attach analytics / rate the outbound later. Only redirects to a vendor whose
// affiliate relationship is active; everything else falls back to the catalog.

import { NextResponse, after } from 'next/server'
import { VENDORS } from '@/lib/vendors'
import { IS_APP_BUILD } from '@/lib/platform'
import { recordReferralClick } from '@/lib/referrals'
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

  // The community (Telegram) is not a vendor, but it rides the same chokepoint
  // so a join click lands in the same no-PII referral counter. No ?p= handling
  // and no vendor lookup - the destination is a fixed constant.
  if (id === COMMUNITY_REF_ID) {
    after(async () => {
      try {
        await recordReferralClick(COMMUNITY_REF_ID)
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
      await recordReferralClick(vendor.id, productSlug)
    } catch {
      /* analytics is a courtesy; never surface a store error to the redirect */
    }
  })

  return NextResponse.redirect(dest, 302)
}
