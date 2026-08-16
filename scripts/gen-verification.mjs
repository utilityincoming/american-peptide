// Regenerate src/lib/verification.ts from a live fact-QA manifest pass.
//
//   1. Start the app (dev or prod) and ensure CRON_SECRET allows the call.
//   2. node scripts/gen-verification.mjs http://localhost:3000 [BEARER]
//
// The manifest endpoint (GET /api/jobs/fact-qa?format=manifest) confirms each
// catalog entry against its PubChem record; this script formats the result into
// the committed verification map that powers the on-page provenance badge.

import fs from 'node:fs'

const base = process.argv[2] || 'http://localhost:3000'
const bearer = process.argv[3]
const url = `${base.replace(/\/$/, '')}/api/jobs/fact-qa?format=manifest`

// The pass paces itself against PubChem's rate limit, so it takes ~1 minute in
// good conditions. Bound it explicitly: undici's own 300s headers timeout would
// otherwise surface a bare UND_ERR_HEADERS_TIMEOUT with nothing about what was
// being attempted. The circuit breaker in lib/pubchem-fetch.ts should make a
// blocked run finish long before this fires.
const TIMEOUT_MS = 240_000

let res
try {
  res = await fetch(url, {
    ...(bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : {}),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
} catch (err) {
  const timedOut = err?.name === 'TimeoutError' || err?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT'
  console.error(
    timedOut
      ? `Manifest pass exceeded ${TIMEOUT_MS / 1000}s. PubChem is likely refusing this host, ` +
          'so lookups are retrying and stalling. Nothing was written.'
      : `Manifest fetch failed: ${err}`,
  )
  process.exit(1)
}
if (!res.ok) {
  console.error(`Manifest fetch failed: HTTP ${res.status}`)
  process.exit(1)
}
const manifest = await res.json()
const slugs = Object.keys(manifest).sort()

const entries = slugs
  .map((slug) => {
    const r = manifest[slug]
    return `  '${slug}': { cid: ${r.cid}, molecularFormula: ${
      r.molecularFormula ? `'${r.molecularFormula}'` : 'null'
    }, molecularWeight: ${r.molecularWeight ?? 'null'}, checkedAt: '${r.checkedAt}' },`
  })
  .join('\n')

const out = `// AUTO-GENERATED — do not edit by hand.
// Source: GET /api/jobs/fact-qa?format=manifest  (regenerate via scripts/gen-verification.mjs)
//
// Each entry was confirmed against its PubChem record on \`checkedAt\`. A curated
// pubchemCid is authoritative; name-resolved entries additionally had to contain
// nitrogen and match the catalog molecular weight within tolerance. Only
// confident matches appear here, so the on-page "verified" claim stays honest.

export interface VerificationRecord {
  cid: number
  molecularFormula: string | null
  molecularWeight: number | null
  checkedAt: string
}

export const PUBCHEM_VERIFIED: Record<string, VerificationRecord> = {
${entries}
}

export function getPubchemVerification(slug: string): VerificationRecord | undefined {
  return PUBCHEM_VERIFIED[slug]
}
`

fs.writeFileSync('src/lib/verification.ts', out)
console.log(`Wrote src/lib/verification.ts — ${slugs.length} verified entries.`)
