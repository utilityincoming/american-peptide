import { ImageResponse } from 'next/og'
import { ogImage, loadOgFonts, categoryAccent, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { PEPTIDES, getPeptideBySlug } from '@/lib/peptides'

export const alt = 'AmericanPeptide.com catalog entry'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// Pre-render one share image per catalog molecule, matching the detail page.
export function generateStaticParams() {
  return PEPTIDES.map((p) => ({ slug: p.slug }))
}

const label = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPeptideBySlug(slug)
  const category = p?.categories?.[0]
  const fonts = await loadOgFonts()

  // Fact chips — residue count, mass, FDA — so every card carries its own data.
  const chips: string[] = []
  if (p?.sequence) chips.push(`${p.sequence.length} residues`)
  if (p?.molecularWeight) chips.push(`${Math.round(p.molecularWeight)} Da`)
  if (p?.fdaApproved) chips.push('FDA-approved')

  return new ImageResponse(
    ogImage({
      eyebrow: category ? label(category) : 'Research peptide',
      title: p?.name ?? 'Peptide',
      subtitle: p?.shortDescription,
      accent: categoryAccent(category),
      sequence: p?.sequence,
      residues: p?.sequence?.length,
      chips,
    }),
    { ...size, fonts },
  )
}
