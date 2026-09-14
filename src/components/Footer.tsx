import Link from 'next/link'
import { IS_APP_BUILD } from '@/lib/platform'
import { FOOTER_CONTENT_LINKS, FOOTER_COMPLIANCE_LINKS } from '@/lib/internal-links'

// /sources is deliberately NOT a footer link. The sourcing index earns a
// site-wide slot only once it shows it helps readers; until then it stays
// reachable the way it was designed to be found — from the monograph of a
// compound someone is already reading, plus the sitemap for search.
// Site-wide navigation is the claim that everyone needs it, and that claim
// isn't evidenced yet.
//
// The sourcing (/us-peptides) link is web-only: the Play/TWA build ships no
// affiliate layer, so it is filtered out on that build. Every other link is
// build-agnostic and is asserted (in internal-links.test.ts) to be a sitemap
// page — internal linking is limited to the sitemap's indexable set.
const contentLinks = FOOTER_CONTENT_LINKS.filter(
  (l) => !(IS_APP_BUILD && l.href === '/us-peptides'),
)

export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.06] bg-surface px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/45">
          {contentLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {FOOTER_COMPLIANCE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-ink/30"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
          <p className="text-xs leading-relaxed text-amber-400/60">
            <span className="font-semibold text-amber-400/80">Research Disclaimer: </span>
            AmericanPeptide.com is an AI-assisted computational research platform, not a
            medical device or clinical decision-support system. All AI-generated outputs —
            including peptide sequences, binding predictions, and literature syntheses —
            are computational hypotheses requiring independent experimental validation.
            This platform does not provide medical advice, diagnosis, or treatment
            recommendations. Researchers must apply rigorous scientific judgment and comply
            with applicable institutional and regulatory guidelines before acting on any
            output.
          </p>
        </div>

        <p className="text-xs text-ink/30">© 2026 AmericanPeptide.com</p>
      </div>
    </footer>
  )
}
