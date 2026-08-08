// Visible "Last updated" stamp, rendered as a machine-readable <time>. Kept in
// lockstep with the dateModified in a page's JSON-LD so the freshness signal
// agrees in both the DOM (what answer engines read) and the structured data.
//
// Renders nothing when there is no valid date — a page never shows a freshness
// claim it can't back up.
export default function LastUpdated({
  date,
  label = 'Last updated',
  className = 'text-[11px] text-ink/40',
}: {
  date?: string | null
  label?: string
  className?: string
}) {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null

  const iso = d.toISOString().slice(0, 10)
  const human = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <p className={className}>
      {label}{' '}
      <time dateTime={iso} className="tabular-nums">
        {human}
      </time>
    </p>
  )
}
