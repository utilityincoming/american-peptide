import Link from 'next/link'
import { GLOSSARY } from '@/lib/glossary'

/**
 * Link the first glossary term found in a paragraph. Later terms stay plain
 * so a short description does not become a link farm.
 */
export default function GlossaryText({ text }: { text: string }) {
  const lower = text.toLowerCase()
  let hit: { index: number; length: number; slug: string } | null = null
  for (const entry of GLOSSARY) {
    const term = entry.term.toLowerCase()
    if (term.length < 5) continue
    const index = lower.indexOf(term)
    if (index < 0) continue
    if (!hit || index < hit.index || (index === hit.index && term.length > hit.length)) {
      hit = { index, length: entry.term.length, slug: entry.slug }
    }
  }
  if (!hit) return <>{text}</>
  return (
    <>
      {text.slice(0, hit.index)}
      <Link href={`/glossary/${hit.slug}`} className="underline decoration-ink/30 underline-offset-2 hover:text-accent">
        {text.slice(hit.index, hit.index + hit.length)}
      </Link>
      {text.slice(hit.index + hit.length)}
    </>
  )
}
