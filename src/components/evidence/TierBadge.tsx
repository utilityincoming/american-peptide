import type { Claim, Freshness, Tier } from '@/lib/evidence/types'
import { TIERS, TIER_HUE, freshnessFor } from '@/lib/evidence/types'
import { HUE_CLASSES, formatRetrieved } from './tierStyles'

// The tier badge (§6). Renders the `short` code in the tier's hue, immediately
// adjacent to the value it qualifies — never in a footnote or legend-only key.
// Server component: the scope note rides on the native `title` tooltip (hover,
// keyboard, screen readers) and expands inline on mobile for the two lowest
// tiers, where the disclosure is load-bearing. Stale desaturates + ambers the
// date; superseded strikes through.

type TierBadgeProps = {
  /** Pass a full claim to derive tier, freshness, scope note, and date at once… */
  claim?: Claim
  /** …or drive the badge directly, for legends and one-off labels. */
  tier?: Tier
  freshness?: Freshness
  scopeNote?: string
  retrievedAt?: string
  /** Force the retrieved-at stamp on/off. Defaults on where §6 requires it. */
  showDate?: boolean
  /** Link to the successor claim when this one is superseded (§6). */
  supersededHref?: string
  className?: string
}

export default function TierBadge({
  claim,
  tier: tierProp,
  freshness: freshnessProp,
  scopeNote: scopeNoteProp,
  retrievedAt: retrievedAtProp,
  showDate,
  supersededHref,
  className = '',
}: TierBadgeProps) {
  const tier = tierProp ?? claim?.tier
  if (!tier) return null

  const t = TIERS[tier]
  const hue = HUE_CLASSES[TIER_HUE[tier]]
  const freshness = freshnessProp ?? (claim ? freshnessFor(claim) : 'current')
  const scopeNote = scopeNoteProp ?? claim?.scope_note
  const retrievedAt = retrievedAtProp ?? claim?.provenance.retrieved_at

  const stale = freshness === 'stale'
  const superseded = freshness === 'superseded'
  const retracted = freshness === 'retracted'

  const isCommercial = claim?.estimate_kind === 'commercial'
  const dateVisible =
    showDate ?? (tier === 'third_party' || tier === 'vendor_reported' || isCommercial)
  const expandOnMobile =
    (tier === 'vendor_reported' || tier === 'community') && Boolean(scopeNote)

  const tooltip = [t.label, scopeNote].filter(Boolean).join(' — ')

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      <span
        title={tooltip}
        className={[
          'inline-flex items-center rounded-full border px-1.5 py-0.5',
          'text-[10px] font-semibold uppercase tracking-wide',
          hue.text,
          hue.fill,
          hue.border,
          stale ? 'opacity-60 grayscale-[0.4]' : '',
          superseded || retracted ? 'line-through opacity-60' : '',
        ].join(' ')}
      >
        {t.short}
      </span>

      {dateVisible && retrievedAt && (
        <time
          dateTime={retrievedAt}
          className={`text-[10px] tabular-nums ${stale ? 'text-accent-amber' : 'text-ink/40'}`}
        >
          {formatRetrieved(retrievedAt)}
        </time>
      )}

      {superseded && supersededHref && (
        <a href={supersededHref} className="text-[10px] text-accent hover:underline">
          → current
        </a>
      )}

      {expandOnMobile && (
        <span className="basis-full text-[11px] leading-4 text-ink/45 sm:hidden">
          {scopeNote}
        </span>
      )}
    </span>
  )
}
