import Link from 'next/link'
import { IS_APP_BUILD } from '@/lib/platform'
import { BrandMark } from './BrandMark'

// /sources is deliberately NOT listed here. The sourcing index earns a footer
// slot only once it shows it helps readers; until then it stays reachable the
// way it was designed to be found — from the monograph of a compound someone is
// already reading, plus the sitemap for search. Site-wide navigation is the
// claim that everyone needs it, and that claim isn't evidenced yet.
const LINKS = [
  { href: '/', label: 'Home' },
  // The sourcing link is web-only: the Play/TWA build ships no affiliate layer.
  ...(IS_APP_BUILD ? [] : [{ href: '/us-peptides', label: 'Buy Peptides' }]),
  { href: '/compounds', label: 'Compounds' },
  { href: '/tools/calculator-beta', label: 'Peptide Calculator Beta' },
  { href: '/developers', label: 'Developers / API' },
]

// Institutional trust links — who we are, how the data is made, how to reach us,
// and the privacy policy. Unlike the product/hub links above, these are the
// pages every reader and crawler expects to find in a footer, so they belong in
// site-wide navigation on their own merits. Keeping them here gives /privacy its
// only internal link and lifts /about and /about/contact out of near-orphan
// depth (contact was reachable only from about, about only from contact) — so
// search stops indexing the trust pages ahead of the site's own wayfinding.
// Shown on every build: the Play/TWA wrapper needs the privacy link in
// particular, and "how the numbers are made" is the whole thesis of the site.
const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
]

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <BrandMark />

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/55">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-ink"
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

        <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/55">
            {COMPANY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-ink/55">© 2026 AmericanPeptide.com</p>
        </div>
      </div>
    </footer>
  )
}
