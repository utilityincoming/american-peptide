import { ImageResponse } from 'next/og'
import { ogImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Compound Search — AmericanPeptide.com'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: 'Cited peptide research',
      title: 'Compound Search',
      subtitle: 'Find structures and PubChem records.',
      residues: 4,
    }),
    { ...size, fonts: await loadOgFonts() },
  )
}
