import { Check, ChevronDown, Minus, ShieldAlert } from 'lucide-react'
import type { Vendor } from '@/lib/vendors'

// Featured-partner comparison block.
//
// Promotes the paid featured partner HONESTLY — by leading on the axes it
// genuinely wins (the diligence a trust checkbox can't carry: a known US
// operator, card-processor underwriting, real chargeback protection, a
// negotiated discount) set against a GENERIC "typical research vendor"
// baseline. It never claims a win the vendor's own data doesn't support:
// where the partner is only at parity or weaker (COA matched to your lot),
// the row says so.
//
// The de-emphasis rule, per the trust standard: promotion may reorder and
// quiet the FINE PRINT, but never hide it. The safety-critical line (request
// a lot-specific COA) stays visible; the transactional caveats live in an
// accessible <details> expander — in the DOM, keyboard-reachable, announced
// by screen readers — not display:none. The FTC disclosure is unaffected.

interface Row {
  label: string
  /** The partner's standing on this axis. */
  partner: string
  /** What a generic, un-vetted research vendor typically offers. */
  typical: string
  /** 'win' → partner advantage; 'parity' → no honest edge to claim. */
  kind: 'win' | 'parity'
}

// The comparison axes. Wins first (relationship / US ops / payment rails /
// buyer protection) — the substance of the spotlightNote — then the parity
// row that keeps the testing story honest. The reader-facing discount is
// carried by the offer banner in SourcingCard, so it is not duplicated here.
const BASE_ROWS: Row[] = [
  {
    label: 'Who runs it',
    partner: 'Known US operators, vetted directly',
    typical: 'Anonymous storefront',
    kind: 'win',
  },
  {
    label: 'Ships from',
    partner: 'Stateside',
    typical: 'Often overseas',
    kind: 'win',
  },
  {
    label: 'Payment',
    partner: 'Major credit cards',
    typical: 'Crypto / wire only',
    kind: 'win',
  },
  {
    label: 'Buyer protection',
    partner: 'Card-processor underwritten — chargeback protection on every order',
    typical: 'None (crypto is final)',
    kind: 'win',
  },
]

// The testing/COA row is DERIVED from the vendor's own signals so the story
// stays honest for any future spotlight partner: only a per-batch, lot-matched
// COA earns a 'win'; anything less shows as parity, because a static per-SKU
// certificate is exactly what a typical vendor also publishes.
function testingRow(v: Vendor): Row {
  return v.trust.perBatchTesting
    ? {
        label: 'Testing & COA',
        partner: 'Per-batch COA, matchable to your specific lot',
        typical: 'One static COA reused across lots',
        kind: 'win',
      }
    : {
        label: 'Testing & COA',
        partner: 'COA published per product (not lot-matched)',
        typical: 'COA published per product (not lot-matched)',
        kind: 'parity',
      }
}

export default function SpotlightComparison({
  vendor,
  accent = '#2DD4A8',
  className = '',
}: {
  vendor: Vendor
  accent?: string
  className?: string
}) {
  const rows: Row[] = [...BASE_ROWS, testingRow(vendor)]
  // Safety line shows only when the COA is NOT lot-matched — the one caveat
  // that stays conspicuous rather than folding into the fine print.
  const showCoaWarning = !vendor.trust.perBatchTesting

  return (
    <div className={className}>
      {/* The sell — relationship diligence a checkbox column can't carry. */}
      {vendor.spotlightNote && (
        <p className="mb-3 border-l-2 pl-3 text-[11px] leading-relaxed text-ink/70"
           style={{ borderColor: `${accent}59` }}>
          {vendor.spotlightNote}
        </p>
      )}

      {/* Honest, attribute-by-attribute contrast vs a generic vendor. */}
      <div className="overflow-hidden rounded-lg border border-ink/10">
        <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-ink/10 bg-ink/[0.03] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-ink/45">
          <span>{vendor.name}</span>
          <span className="text-right">vs. typical vendor</span>
        </div>
        <ul className="divide-y divide-ink/[0.06]">
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[1fr_auto] items-start gap-x-3 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">
                  {r.label}
                </p>
                <p className="mt-0.5 flex items-start gap-1.5 text-xs leading-snug text-ink/75">
                  {r.kind === 'win' ? (
                    <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: accent }} strokeWidth={2.5} />
                  ) : (
                    <Minus className="mt-0.5 h-3 w-3 shrink-0 text-ink/40" strokeWidth={2.5} />
                  )}
                  {r.partner}
                </p>
              </div>
              <p className="pt-[15px] text-right text-[11px] leading-snug text-ink/40">
                {r.typical}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Safety-critical line stays conspicuous — never tucked away. */}
      {showCoaWarning && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-400/80">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
          <span>
            The published COA is one certificate per product, not matched to your vial —
            request a lot-specific COA before use.
          </span>
        </p>
      )}

      {/* Transactional fine print: de-emphasized but fully accessible. */}
      {vendor.notes && (
        <details className="group mt-2">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-ink/45 transition-colors hover:text-ink/70">
            <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
            The fine print
          </summary>
          <p className="mt-1.5 pl-4 text-[11px] leading-relaxed text-ink/50">
            {vendor.notes}
          </p>
        </details>
      )}
    </div>
  )
}
