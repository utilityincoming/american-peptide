import { NextRequest } from 'next/server'

// Research-use AI analysis of a designed peptide sequence. Mirrors the fetch
// pattern in /api/chat (no SDK dependency). Returns markdown text.

interface AnalyzeBody {
  sequence?: string
  pH?: number
  properties?: Record<string, string | number>
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI analysis is not configured (missing ANTHROPIC_API_KEY).' },
      { status: 500 },
    )
  }

  let body: AnalyzeBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const sequence = (body.sequence ?? '').toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '')
  if (sequence.length < 2) {
    return Response.json({ error: 'A sequence of at least 2 residues is required.' }, { status: 400 })
  }

  const propLines = body.properties
    ? Object.entries(body.properties)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : '(none provided)'

  const userPrompt = `Analyze this research peptide design.

Sequence (1-letter): ${sequence}
pH context: ${body.pH ?? 7.4}
Computed properties:
${propLines}

Give a concise, research-framed analysis with these short sections (markdown headings):
1. **Snapshot** — one or two sentences on what kind of peptide this looks like.
2. **Charge & solubility** — interpret net charge / pI / GRAVY for handling and solubility.
3. **Stability & synthesis** — flag oxidation-prone residues, disulfides, aspartimide motifs, aggregation/"difficult sequence" risks.
4. **Similar known peptides** — note any well-characterized peptides with comparable motifs/properties, clearly as comparisons (do not assert identity).
Keep it under ~350 words.`

  const system = `You are a peptide design analyst for AmericanPeptide.com, a research-use platform. Analyze designed peptide sequences from their composition and computed properties.

Rules:
- Research and educational framing only. This is NOT medical advice, dosing, or administration guidance, and not an offer for sale. Do not suggest human use, doses, or routes of administration.
- Be specific and scientific but concise. Use the provided computed properties; do not invent numbers.
- Discuss chemistry: charge/solubility, oxidation (Met/Cys/Trp), disulfides, aspartimide-prone motifs (Asp/Asn-X), hydrophobic aggregation / difficult sequences, proline effects.
- When comparing to known peptides, frame as similarity/precedent, never as a claim that the design IS that peptide.
- Output clean markdown. No preamble like "Great question."`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const rawText = await response.text()
    if (!response.ok) {
      return Response.json({ error: rawText }, { status: response.status })
    }
    const data = JSON.parse(rawText)
    const content = data.content?.[0]?.text || 'No analysis generated.'
    return Response.json({ content })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Analysis request failed.' },
      { status: 500 },
    )
  }
}
