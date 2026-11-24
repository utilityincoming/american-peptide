import { ImageResponse } from 'next/og'
import { ogImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Peptide Agent — AmericanPeptide.com'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: 'Cited peptide research',
      title: 'Peptide Agent',
      subtitle: 'Cited answers from research sources.',
      residues: 5,
    }),
    { ...size, fonts: await loadOgFonts() },
  )
}
