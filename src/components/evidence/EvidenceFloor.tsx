import type { Claim, EvidenceFloor as EvidenceFloorData } from '@/lib/evidence/types'
import { TIERS, TIER_HUE, TIER_ORDER, computeEvidenceFloor } from '@/lib/evidence/types'
import { HUE_CLASSES } from './tierStyles'

// The page-level rollup chip (§6): "Evidence floor: Preclinical", sat near the
// title so a reader calibrates before scrolling. The floor is the LOWEST tier
// among load-bearing claims — computed, never asserted.

type EvidenceFloorProps = {
  /** A precomputed floor… */
  floor?: EvidenceFloorData
  /** …or the claims to compute it from. */
  claims?: Claim[]
  /**
   * Which claims count toward the floor (default: all). Exclude identity/reference
   * fields so the floor reflects a page's empirical claims, not its molecular weight.
   */
  loadBearing?: (c: Claim) => boolean
  showDistribution?: boolean
  className?: string
}

export default function EvidenceFloor({
  floor: floorProp,
  claims,
  loadBearing,
  showDistribution = true,
  className = '',
}: EvidenceFloorProps) {
  const floor =
    floorProp ?? (claims ? computeEvidenceFloor(claims, loadBearing) ?? undefined : undefined)
  if (!floor) return null

  const hue = HUE_CLASSES[TIER_HUE[floor.floor]]
  const referenceIdentityCount =
    claims && loadBearing
      ? claims.filter((c) => c.tier === 'reference' && !loadBearing(c)).length
      : 0
  const excludedCommunityCount =
    claims && loadBearing
      ? claims.filter((c) => c.tier === 'community' && !loadBearing(c)).length
      : 0

  // Include verified reference chemistry (REF) alongside load-bearing primary/sourcing
  // tiers in the primary chip distribution, and render optional community preset
  // conventions (COMM) in their own separate badge/tooltip.
  const primaryDistribution: Partial<Record<typeof TIER_ORDER[number], number>> = {
    ...floor.distribution,
  }
  if (referenceIdentityCount > 0) {
    primaryDistribution.reference =
      (primaryDistribution.reference ?? 0) + referenceIdentityCount
  }
  const present = TIER_ORDER.filter((t) => primaryDistribution[t])

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-hairline bg-fill px-3 py-1">
        <span className="text-[11px] uppercase tracking-wide text-ink/55">Evidence floor</span>
        <span className={`text-xs font-semibold ${hue.text}`}>{TIERS[floor.floor].label}</span>

        {showDistribution && present.length > 0 && (
          <span className="flex items-center gap-2 border-l border-hairline-strong pl-2.5">
            {present.map((t) => (
              <span
                key={t}
                title={`${primaryDistribution[t]} ${TIERS[t].label} claim${
                  primaryDistribution[t] === 1 ? '' : 's'
                }`}
                className="inline-flex items-center gap-1 text-[10px] tabular-nums text-ink/55"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${HUE_CLASSES[TIER_HUE[t]].dot}`} />
                {TIERS[t].short}
                <span className="text-ink/55">{primaryDistribution[t]}</span>
              </span>
            ))}
          </span>
        )}
      </span>

      {showDistribution && excludedCommunityCount > 0 && (
        <span
          title={`${excludedCommunityCount} optional Community reference preset${
            excludedCommunityCount === 1 ? '' : 's'
          } (vial strength, reconstitution volume, reference amount — calculation conventions, separate from the primary evidence floor)`}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-fill px-2.5 py-1 text-[10px] tabular-nums text-ink/55"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${HUE_CLASSES[TIER_HUE.community].dot}`} />
          <span className="uppercase tracking-wide text-ink/50">Preset notes</span>
          <span className={`font-semibold ${HUE_CLASSES[TIER_HUE.community].text}`}>
            {TIERS.community.short} {excludedCommunityCount}
          </span>
        </span>
      )}
    </span>
  )
}
