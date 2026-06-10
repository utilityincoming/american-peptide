import { NextRequest } from 'next/server'
import { runFactQa, reportToMarkdown, buildVerificationManifest } from '@/lib/fact-qa'

// Overnight fact-QA job: verifies catalog chemistry/claims against PubChem +
// ClinicalTrials.gov and returns a findings report. Read-only — never edits.
//
// Trigger via Vercel Cron (recommended) or any scheduler:
//   vercel.json → { "crons": [{ "path": "/api/jobs/fact-qa?llm=1", "schedule": "0 7 * * *" }] }
// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
//
// Query params:
//   limit  (default 25)   — number of catalog entries to check
//   offset (default 0)    — start index, for batching across multiple runs
//   llm    (0|1, def 0)   — also run Fable 5 prose adjudication (costs tokens)
//   format (json|md)      — response shape (default json)

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // seconds; raise/lower to your Vercel plan limit

export async function GET(request: NextRequest) {
  // Auth: if CRON_SECRET is set, require it (Vercel Cron supplies it). If unset,
  // allow in local dev only — never run unauthenticated in production.
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'CRON_SECRET is not set; refusing to run unauthenticated in production.' },
      { status: 503 },
    )
  }

  const sp = request.nextUrl.searchParams
  const limit = Math.min(Math.max(Number(sp.get('limit')) || 25, 1), 200)
  const offset = Math.max(Number(sp.get('offset')) || 0, 0)
  const useLlm = sp.get('llm') === '1'
  const fmt = sp.get('format')
  const format = fmt === 'md' ? 'md' : fmt === 'manifest' ? 'manifest' : 'json'

  // Manifest mode: emit the verified-provenance map that powers the on-page
  // "verified against PubChem" badge. Pipe to src/lib/verification.ts.
  if (format === 'manifest') {
    const checkedAt = new Date().toISOString().slice(0, 10)
    const manifest = await buildVerificationManifest(checkedAt)
    console.log(`[fact-qa] manifest: ${Object.keys(manifest).length} entries verified`)
    return Response.json(manifest)
  }

  if (useLlm && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'llm=1 requested but ANTHROPIC_API_KEY is not configured.' },
      { status: 500 },
    )
  }

  const report = await runFactQa({
    limit,
    offset,
    useLlm,
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // One-line server log so a cron run leaves a trace even if the body isn't stored.
  const { high, medium, low, info } = report.summary
  console.log(
    `[fact-qa] checked=${report.checked} high=${high} medium=${medium} low=${low} info=${info}`,
  )

  if (format === 'md') {
    return new Response(reportToMarkdown(report), {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  }
  return Response.json(report)
}
