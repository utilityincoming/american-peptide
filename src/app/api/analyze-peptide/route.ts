import { NextRequest } from 'next/server'
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit'
import { MODELS, shouldFailover } from '@/lib/models'
import { reserveRun, meter, isOwnerBypass, isSameOriginBrowser, isLikelyBot } from '@/lib/agent-quota'

// Research-use AI analysis of a designed peptide sequence. Mirrors the fetch
// pattern in /api/chat (no SDK dependency). Returns markdown text.

const MAX_SEQUENCE_LEN = 200 // residues; longer designs aren't bench-realistic here

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

  // Same caller screening as /api/chat: site UI only, no scripts or crawlers.
  if (!isOwnerBypass(request)) {
    if (!isSameOriginBrowser(request)) {
      void meter('analyze', { 'denied:origin': 1 })
      return Response.json({ error: 'This endpoint is only available from the site itself.' }, { status: 403 })
    }
    if (isLikelyBot(request.headers.get('user-agent'))) {
      void meter('analyze', { 'denied:bot': 1 })
      return Response.json({ error: 'Automated clients are not permitted.' }, { status: 403 })
    }
  }

  // Per-IP rate limit — one model call per request, so a looser cap than chat.
  const rl = await rateLimit(clientKey(request, 'analyze'), { limit: 20, windowSec: 60 })
  if (!rl.ok) {
    return tooManyRequests(rl, 'Too many analyses. Please wait a moment and try again.')
  }

  let body: AnalyzeBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const sequence = (body.sequence ?? '')
    .toUpperCase()
    .replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '')
    .slice(0, MAX_SEQUENCE_LEN)
  if (sequence.length < 2) {
    return Response.json({ error: 'A sequence of at least 2 residues is required.' }, { status: 400 })
  }

  // Daily free allowance (separate from the chat agent's) + the shared site-wide
  // spend ceiling. Reserved only once the input is known to be valid.
  const run = await reserveRun(request, 'analyze')
  const headers: Record<string, string> = run.setCookie ? { 'Set-Cookie': run.setCookie } : {}
  if (!run.allowed) {
    return run.reason === 'quota'
      ? Response.json(
          {
            error: `You've used today's ${run.quota?.limit ?? ''} free AI analyses. Your allowance resets at midnight UTC.`,
            code: 'quota_exhausted',
            quota: run.quota,
          },
          { status: 402, headers },
        )
      : Response.json(
          { error: 'AI analysis has reached its capacity for today. Please try again tomorrow.', code: 'capacity' },
          { status: 503, headers },
        )
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
    // Try each model in the failover chain; advance only on a retryable
    // upstream failure (model unavailable, overload, 5xx).
    for (const model of MODELS) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          // Cache the static rules block: reused on every analysis at ~0.1x.
          system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      const rawText = await response.text()
      if (!response.ok) {
        // Log detail server-side; don't echo the upstream body to the client.
        console.error(`[analyze] model ${model} error ${response.status}: ${rawText.slice(0, 500)}`)
        if (shouldFailover(response.status)) continue
        break
      }
      const data = JSON.parse(rawText)
      // Find the text block rather than assuming index 0 (robust to thinking/other blocks).
      const textBlock = Array.isArray(data.content)
        ? data.content.find((b: { type?: string }) => b?.type === 'text')
        : null
      const content = textBlock?.text || 'No analysis generated.'
      void meter('analyze', {
        answered: 1,
        'tokens_in:anthropic':
          (data.usage?.input_tokens ?? 0) +
          (data.usage?.cache_creation_input_tokens ?? 0) +
          (data.usage?.cache_read_input_tokens ?? 0),
        'tokens_out:anthropic': data.usage?.output_tokens ?? 0,
      })
      return Response.json({ content, ...(run.quota ? { quota: run.quota } : {}) }, { headers })
    }
    await run.refund()
    return Response.json({ error: 'AI analysis service returned an error.' }, { status: 502, headers })
  } catch (err) {
    await run.refund()
    return Response.json(
      { error: err instanceof Error ? err.message : 'Analysis request failed.' },
      { status: 500 },
    )
  }
}
