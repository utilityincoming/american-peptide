import { ImageResponse } from 'next/og'
import { ogImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'AmericanPeptide.com — Cited peptide research'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    ogImage({
      eyebrow: 'Cited peptide research',
      title: 'American Peptide',
      subtitle:
        'Catalog, research tools and source records.',
    }),
    { ...size, fonts },
  )
}
