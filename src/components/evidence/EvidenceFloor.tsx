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
  const present = TIER_ORDER.filter((t) => floor.distribution[t])

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-ink/[0.08] bg-ink/[0.03] px-3 py-1 ${className}`}
    >
      <span className="text-[11px] uppercase tracking-wide text-ink/45">Evidence floor</span>
      <span className={`text-xs font-semibold ${hue.text}`}>{TIERS[floor.floor].label}</span>

      {showDistribution && present.length > 0 && (
        <span className="flex items-center gap-2 border-l border-ink/10 pl-2.5">
          {present.map((t) => (
            <span
              key={t}
              title={`${floor.distribution[t]} ${TIERS[t].label} claim${
                floor.distribution[t] === 1 ? '' : 's'
              }`}
              className="inline-flex items-center gap-1 text-[10px] tabular-nums text-ink/55"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${HUE_CLASSES[TIER_HUE[t]].dot}`} />
              {TIERS[t].short}
              <span className="text-ink/35">{floor.distribution[t]}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  )
}
