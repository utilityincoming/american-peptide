import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Building2, Check, ShieldCheck } from 'lucide-react'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import {
  getVendorsForPeptide,
  trustScore,
  vendorHref,
  vendorTier,
  VENDOR_TIERS,
  type Vendor,
} from '@/lib/vendors'

interface SourcingCardProps {
  /** Catalog slugs this class page covers; the card ranks every vendor that carries any of them. */
  slugs: string[]
  /** Accent hex to match the host page (defaults to the site green). */
  accent?: string
  className?: string
}

// Aggregate directory vendors across a class page's catalog slugs, best-trust
// first, deduped by id. Returns [] on the Play (TWA) build — getVendorsForPeptide
// gates outbound vendor links there — which is exactly when we render nothing.
function topVendorsFor(slugs: string[]): Vendor[] {
  const byId = new Map<string, Vendor>()
  for (const slug of slugs) {
    for (const v of getVendorsForPeptide(slug)) byId.set(v.id, v)
  }
  return [...byId.values()].sort((a, b) => trustScore(b) - trustScore(a))
}

/**
 * Sidebar "where to source" card for the SEO class-landing pages.
 *
 * Propagates the GLP-1 hub's trust-gated pattern: instead of a static
 * "marketplace coming soon" placeholder, it surfaces the single highest-trust
 * vendor that carries the page's compounds — ranked by the same transparency
 * signals as the catalog directory (never by commission) — with an FTC
 * disclosure and a link to the full ranked list. On the reference-only Play
 * build (or when no known source exists) it renders nothing, because the
 * trust-ranked directory IS the buying layer; there is no separate marketplace.
 */
export default function SourcingCard({
  slugs,
  accent = '#2DD4A8',
  className = '',
}: SourcingCardProps) {
  const vendors = topVendorsFor(slugs)
  if (vendors.length === 0) return null

  const best = vendors[0]
  const tier = VENDOR_TIERS.find((t) => t.id === vendorTier(best))!
  const t = best.trust
  const signals: string[] = []
  if (t.thirdPartyTested) signals.push('Independent HPLC/MS testing')
  if (t.perBatchTesting) signals.push('Per-batch (lot-level) COA')
  if (t.purityPct) signals.push(`Stated purity ≥ ${t.purityPct}%`)
  if (t.refundPolicy) signals.push('Published refund policy')

  // The primary compound's detail page carries the full trust-ranked panel.
  const allSourcesHref = `/catalog/${slugs[0]}`

  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0D` }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: accent }}
          >
            Where to source · ranked by trust
          </p>
          <p className="truncate text-sm font-semibold text-ink/90">{best.name}</p>
        </div>
        <span className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-semibold text-ink/70">
          {trustScore(best)}/100
        </span>
      </div>

      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-ink/[0.03] px-2 py-0.5 text-[10px] font-medium text-ink/55">
        <ShieldCheck className="h-3 w-3" style={{ color: accent }} />
        {tier.label}
      </div>

      {signals.length > 0 && (
        <ul className="mb-4 space-y-1.5 text-xs">
          {signals.map((s) => (
            <li key={s} className="flex items-start gap-2 text-ink/65">
              <Check
                className="mt-0.5 h-3 w-3 shrink-0"
                style={{ color: accent }}
                strokeWidth={2.5}
              />
              {s}
            </li>
          ))}
        </ul>
      )}

      <a
        href={vendorHref(best)}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        Visit {best.name}
        <ArrowUpRight className="h-4 w-4" />
      </a>

      {best.affiliate?.code && (
        <p className="mt-2 text-center text-[11px] text-ink/45">
          Referral code{' '}
          <span className="font-mono font-semibold text-ink/70">
            {best.affiliate.code}
          </span>
        </p>
      )}

      {vendors.length > 1 && (
        <Link
          href={allSourcesHref}
          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-ink/60 transition-colors hover:text-ink"
        >
          Compare all {vendors.length} vetted sources
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}

      {best.notes && (
        <p className="mt-3 text-[11px] leading-relaxed text-amber-400/70">
          {best.notes}
        </p>
      )}

      <AffiliateDisclosure className="mt-3" />
    </div>
  )
}
