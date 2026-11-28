export default function MethodsPanel({ items }: { items: { term: string; text: string }[] }) {
  return (
    <details className="rounded-2xl border border-hairline bg-fill px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">Methods and limitations</summary>
      <dl className="mt-3 space-y-3 text-sm text-ink/70">
        {items.map((item) => (
          <div key={item.term}>
            <dt className="font-medium text-ink">{item.term}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
