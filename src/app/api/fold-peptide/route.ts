import { NextRequest } from 'next/server'

// Server-side proxy to ESMFold (Meta) — folds a peptide sequence into a PDB
// structure. Free, no API key. Proxied so the browser avoids CORS and we can
// validate input/output. Research-use; predictions are estimates.

const ESMFOLD_URL = 'https://api.esmatlas.com/foldSequence/v1/pdb/'
const MAX_LEN = 400 // ESMFold public endpoint limit

export async function POST(request: NextRequest) {
  let sequence = ''
  try {
    const body = await request.json()
    sequence = String(body.sequence ?? '')
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  sequence = sequence.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '')
  if (sequence.length < 2) {
    return Response.json({ error: 'A sequence of at least 2 residues is required.' }, { status: 400 })
  }
  if (sequence.length > MAX_LEN) {
    return Response.json(
      { error: `Sequence too long for in-browser folding (max ${MAX_LEN} residues). Use AlphaFold Server for large designs.` },
      { status: 400 },
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 55000)
  try {
    const res = await fetch(ESMFOLD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: sequence,
      signal: controller.signal,
    })
    const text = await res.text()
    if (!res.ok || !text.includes('ATOM')) {
      return Response.json(
        { error: 'The folding service is unavailable right now. Try again, or use AlphaFold Server.' },
        { status: 502 },
      )
    }
    return Response.json({ pdb: text, length: sequence.length })
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return Response.json(
      {
        error: aborted
          ? 'Folding timed out — the service may be busy. Try again shortly.'
          : 'Could not reach the folding service.',
      },
      { status: 504 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
