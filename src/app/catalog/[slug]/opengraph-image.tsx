import { ImageResponse } from 'next/og'
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
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
  return new ImageResponse(
    ogImage({
      eyebrow: p?.categories?.[0] ? label(p.categories[0]) : 'Research peptide',
      title: p?.name ?? 'Peptide',
      subtitle: p?.shortDescription,
    }),
    { ...size },
  )
}
