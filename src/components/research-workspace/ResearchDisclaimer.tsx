export default function ResearchDisclaimer() {
  return (
    <aside
      className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm leading-relaxed text-ink/80"
      role="note"
    >
      <p className="font-medium text-ink">Research and education only. Not medical advice.</p>
      <p className="mt-1 text-ink/70">
        Mass, charge, GRAVY, extinction, and synthesis flags are computational hypotheses.
        They need experimental validation. Trial rows are registry records, not treatment
        recommendations. Catalog facts are from AmericanPeptide.com under{' '}
        <a
          className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
          href="https://creativecommons.org/licenses/by/4.0/"
        >
          CC BY 4.0
        </a>
        .
      </p>
    </aside>
  )
}
