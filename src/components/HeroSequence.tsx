import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { AA_BY_CODE } from '@/lib/amino-acids'
import styles from './HeroSequence.module.css'

const ROW_LENGTH = 5

const categoryLabels = {
  special: 'Special / small',
  acidic: 'Negative',
  basic: 'Positive',
  nonpolar: 'Hydrophobic',
  polar: 'Polar',
  unknown: 'Unclassified',
}

export default function HeroSequence({
  href,
  name,
  sequence,
}: {
  href: string
  name: string
  sequence: string
}) {
  const legend = new Map<keyof typeof categoryLabels, Set<string>>()
  const residues = Array.from(sequence, (letter) => {
    const aminoAcid = AA_BY_CODE[letter]
    const category = letter === 'G' || letter === 'P' ? 'special' : aminoAcid?.category ?? 'unknown'
    const label = categoryLabels[category]
    const letters = legend.get(category) ?? new Set<string>()
    letters.add(letter)
    legend.set(category, letters)
    return { letter, category, label, aminoAcid }
  })

  return (
    <figure
      aria-labelledby="hero-sequence-title"
      className={`${styles.figure} min-w-0 border border-hairline bg-panel`}
    >
      <figcaption className="border-b border-hairline px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span id="hero-sequence-title" className="font-semibold">{name} primary sequence</span>
          <span className="rounded-full border border-hairline px-2 py-0.5 font-scientific text-xs text-ink-muted">
            {residues.length} residues
          </span>
        </div>
        <p className={styles.sequence}>
          <code className="font-scientific" aria-hidden="true">{sequence}</code>
          <span className="sr-only">
            Sequence from the N-terminus to the C-terminus: {residues.map(({ letter }) => letter).join(', ')}.
          </span>
        </p>
      </figcaption>

      <div className="px-4 py-4 sm:px-6">
        <ol role="list" aria-label="Residues in sequence order" className={`${styles.chain} font-scientific`}>
          {residues.map(({ letter, category, label, aminoAcid }, index) => {
            const row = Math.floor(index / ROW_LENGTH)
            const offset = index % ROW_LENGTH
            const reversed = row % 2 === 1
            const column = reversed ? ROW_LENGTH - offset : offset + 1
            const last = index === residues.length - 1
            const edge = reversed ? 'left' : 'right'
            const bond = offset === ROW_LENGTH - 1 ? `turn-${edge}` : edge

            return (
              <li
                key={index}
                className={styles.residue}
                data-category={category}
                data-bond={last ? undefined : bond}
                style={{ gridRow: row + 1, gridColumn: column }}
              >
                <span className="sr-only">
                  {index + 1}. {letter}{aminoAcid && `, ${aminoAcid.name} (${aminoAcid.three})`}, {label}.
                </span>
                <span aria-hidden="true" className={styles.bead}>{letter}</span>
                <span aria-hidden="true" className={styles.index}>
                  {index === 0 && <span className={styles.terminus}>N </span>}
                  {String(index + 1).padStart(2, '0')}
                  {last && <span className={styles.terminus}> C</span>}
                </span>
              </li>
            )
          })}
        </ol>
        <ul role="list" aria-label="Residue class legend" className={styles.legend}>
          {Array.from(legend, ([category, letters]) => (
            <li key={category} data-category={category}>
              <span className={styles.swatch} aria-hidden="true" />
              <span>
                {categoryLabels[category]}{' '}
                <code className="font-scientific">({Array.from(letters).join(', ')})</code>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-hairline px-4 py-3 sm:px-6">
        <Link
          href={href}
          className="inline-flex min-h-8 items-center gap-2 rounded-sm text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Read the {name} monograph
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </figure>
  )
}
