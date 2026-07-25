// FTC affiliate disclosure.
//
// Required by the vendor scaffold (see src/lib/vendors.ts) on every surface that
// renders a live affiliate link. Keep the language plain and unavoidable —
// the disclosure has to be clear and conspicuous, not buried.

export default function AffiliateDisclosure({
  className = '',
}: {
  className?: string
}) {
  return (
    <p className={`text-[10px] leading-relaxed text-ink/35 ${className}`}>
      <span className="font-semibold text-ink/50">Affiliate disclosure.</span>{' '}
      AmericanPeptide does not sell peptides. This is an independent third-party
      vendor, and we may earn a commission if you register or buy through this
      link — at no extra cost to you. Listing and ranking are based on published
      transparency signals, never on commission. A vendor can pay for prominence
      only where you see the “Featured partner” label — it buys position, never a
      better trust score, and never changes the ranking below it.
    </p>
  )
}
