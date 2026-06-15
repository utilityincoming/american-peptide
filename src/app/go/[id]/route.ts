// Tracked affiliate redirect: /go/<vendor-id>
//
// Keeps the referral parameter server-side and gives us one chokepoint to
// attach analytics / rate the outbound later. Only redirects to a vendor whose
// affiliate relationship is active; everything else falls back to the catalog.

import { NextResponse } from 'next/server'
import { VENDORS } from '@/lib/vendors'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const vendor = VENDORS.find((v) => v.id === id)
  const dest =
    vendor?.affiliate?.active && vendor.affiliate.url
      ? vendor.affiliate.url
      : null

  if (!dest) {
    return NextResponse.redirect(new URL('/catalog', req.url), 302)
  }

  return NextResponse.redirect(dest, 302)
}
