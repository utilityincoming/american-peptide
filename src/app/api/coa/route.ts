import { NextRequest, NextResponse } from 'next/server'
import { analyzeCoa } from '@/lib/coa'
import { enforceApiAccess } from '@/lib/api-auth'
import { CORS_HEADERS } from '@/lib/catalog-api'

export const runtime = 'nodejs'

// POST /api/coa — decode + grade a pasted Certificate of Analysis.
//
// Rule-based, credit-free. The COA text is analyzed in-memory and NOT stored or
// logged. Metered through the same tiered access as the rest of the API.
export async function POST(req: NextRequest) {
  const access = await enforceApiAccess(req, 'coa')
  if (!access.ok) return access.response

  let text = ''
  try {
    const body = await req.json()
    text = typeof body?.text === 'string' ? body.text : ''
  } catch {
    return NextResponse.json({ error: 'Send JSON { "text": "<COA text>" }.' }, { status: 400, headers: CORS_HEADERS })
  }
  if (text.trim().length < 20) {
    return NextResponse.json(
      { error: 'Paste the full COA text (at least a few lines) to analyze.' },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const report = analyzeCoa(text)
  return NextResponse.json(report, { headers: { ...CORS_HEADERS, ...access.headers } })
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
