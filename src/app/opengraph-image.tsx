import { ImageResponse } from 'next/og'
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'AmericanPeptide.com — AI-powered peptide research'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: 'AI-powered peptide research',
      title: 'Peptide science, verified and mapped.',
      subtitle:
        'A research-grade catalog cross-referenced against PubChem, with sourcing ranked by transparency — never commission.',
    }),
    { ...size },
  )
}
