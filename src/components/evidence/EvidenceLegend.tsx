import { TIERS, TIER_ORDER, TIER_HUE, type Tier } from '@/lib/evidence/types'
import { HUE_CLASSES } from './tierStyles'

// "Survey" wayfinding: the evidence tiers drawn as a map legend — a labelled key
// that reads like the legend on a topographic map, so the hue coding used by
// TierBadge across the page has one canonical reference. Each row pairs a color
// key with the tier's full label and its short code. Theme-aware via the shared
// HUE_CLASSES tokens; the brand accents (verdigris/terra/ocean) stay out of this
// key so the semantic tier hues never read as brand flourish, and vice versa.

type EvidenceLegendProps = {
  /** Which tiers to show, highest-weight first. Defaults to all, in tier order. */
  tiers?: Tier[]
  /** Legend heading. */
  title?: string
  className?: string
}

export default function EvidenceLegend({
  tiers = TIER_ORDER,
  title = 'Legend · evidence tier',
  className = '',
}: EvidenceLegendProps) {
  return (
    <div className={`text-ink ${className}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
          {title}
        </span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>

      <dl className="grid gap-2">
        {tiers.map((tier) => {
          const t = TIERS[tier]
          const hue = HUE_CLASSES[TIER_HUE[tier]]
          return (
            <div key={tier} className="flex items-center gap-3">
              <span
                className={`h-3 w-6 flex-none rounded-sm border ${hue.dot} ${hue.border}`}
                aria-hidden="true"
              />
              <dt className="text-[13px]">{t.label}</dt>
              <dd
                className={`ml-auto font-mono text-[10px] uppercase tracking-wide ${hue.text}`}
              >
                {t.short}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
