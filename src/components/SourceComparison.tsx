import { ArrowUpRight, Check, Info } from 'lucide-react'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import {
  getSpotlightVendor,
  getVendorsForPeptide,
  isAffiliate,
  trustScore,
  vendorHref,
  vendorTier,
  VENDOR_TIERS,
} from '@/lib/vendors'
import { vendorClaimTier, vendorPurityClaim } from '@/lib/evidence/from-vendors'
import { TierBadge } from '@/components/evidence'

/**
 * The GHK-Cu aggregator's core surface, reusable for any compound: vendors that
 * carry `slug`, ranked STRICTLY by the provenance tier of their purity claim
 * (documented → third_party, claimed → vendor_reported), with trustScore as the
 * within-tier order. Placement is by tier, not commission — the paid partner is
 * disclosed inline at its honest tier, never pinned above it. A missing COA date
 * is surfaced rather than hidden, and read correctly: a warning for a static,
 * reused certificate, a neutral note for a vendor that dates every lot. Renders
 * nothing on the Play (TWA) build, where the vendor helpers gate outbound links.
 */
export default function SourceComparison({ slug }: { slug: string }) {
  const vendors = getVendorsForPeptide(slug)
  if (vendors.length === 0) {
    return (
      <p className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5 text-sm text-ink/55">
        No trust-ranked sources are on file for this compound yet.
      </p>
    )
  }

  const spotlight = getSpotlightVendor(slug)
  const groups = VENDOR_TIERS.map((band) => ({
    band,
    vendors: vendors.filter((v) => vendorTier(v) === band.id),
  })).filter((g) => g.vendors.length > 0)

  return (
    <div className="space-y-8">
      {groups.map(({ band, vendors: bandVendors }) => {
        const claimTier = vendorClaimTier(bandVendors[0])
        return (
          <div key={band.id}>
            <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
              <TierBadge tier={claimTier} />
              <h3 className="text-sm font-semibold text-ink/85">{band.label}</h3>
              <span className="text-xs text-ink/35">
                {bandVendors.length} source{bandVendors.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-ink/45">{band.blurb}</p>

            <div className="space-y-3">
              {bandVendors.map((v) => {
                const claim = vendorPurityClaim(v)
                const hasPct = typeof claim.value === 'number'
                const t = v.trust
                const signals: string[] = []
                if (t.thirdPartyTested) signals.push('Independent HPLC/MS')
                if (t.perBatchTesting) signals.push('Per-batch COA')
                if (t.reshipPolicy) signals.push('Reship on loss')
                if (t.refundPolicy) signals.push('Refund policy')
                const affiliate = isAffiliate(v)
                const featured = spotlight?.id === v.id

                return (
                  <div
                    key={v.id}
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink/90">{v.name}</p>
                          {featured && (
                            <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                              Featured partner · paid
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink/45">{v.blurb}</p>
                      </div>
                      <span
                        className="shrink-0 text-[11px] tabular-nums text-ink/40"
                        title="Transparency score — the within-tier sort key"
                      >
                        {trustScore(v)}/100
                      </span>
                    </div>

                    {/* The purity claim, tiered by the vendor's transparency band */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-ink/[0.06] pt-3">
                      <span className="text-[11px] uppercase tracking-wide text-ink/40">
                        Listed purity
                      </span>
                      <span className="text-sm font-medium text-ink/85">
                        {hasPct ? `${claim.value}%` : 'Not stated'}
                      </span>
                      <TierBadge claim={claim} showDate />
                      {!claim.provenance.retrieved_at &&
                        (t.perBatchTesting ? (
                          // A per-batch vendor has no single site-wide COA date
                          // BY DESIGN — the date that matters is the one on your
                          // lot's certificate. Flagging that as "undated" would
                          // read as a deficiency when it's the stronger practice.
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink/45">
                            <Info className="h-3 w-3 shrink-0" strokeWidth={2} />
                            Dated per lot — match the report number on your vial&rsquo;s COA
                          </span>
                        ) : (
                          // A static, reused COA is the case where a missing date
                          // is genuinely load-bearing: nothing ties the paperwork
                          // to the vial in the box.
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80">
                            <Info className="h-3 w-3 shrink-0" strokeWidth={2} />
                            COA undated — request a lot-matched, dated COA
                          </span>
                        ))}
                    </div>

                    {signals.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {signals.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 rounded-full border border-ink/[0.08] bg-ink/[0.02] px-2 py-0.5 text-[11px] text-ink/60"
                          >
                            <Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {v.notes && (
                      <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink/40">
                        <Info className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
                        <span>{v.notes}</span>
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <a
                        href={vendorHref(v, slug)}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        Visit {v.name}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      {affiliate && v.affiliate?.offer && (
                        <span className="text-[11px] text-ink/55">
                          {v.affiliate.offer}
                          {v.affiliate.code && (
                            <>
                              {' '}
                              Code{' '}
                              <span className="font-mono font-semibold text-ink/75">
                                {v.affiliate.code}
                              </span>
                            </>
                          )}
                        </span>
                      )}
                      {affiliate && (
                        <span className="text-[10px] uppercase tracking-wide text-ink/35">
                          Affiliate link
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <AffiliateDisclosure />
    </div>
  )
}
