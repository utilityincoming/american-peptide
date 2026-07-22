import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'AI Agent' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/methodology', label: 'The Standard' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/tools/reconstitution-calculator', label: 'Peptide Calculator' },
  { href: '/developers', label: 'Developers / API' },
  { href: '/privacy', label: 'Privacy' },
]

export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.06] bg-surface px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/45">
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

        <p className="text-xs text-ink/30">© 2026 AmericanPeptide.com</p>
      </div>
    </footer>
  )
}
