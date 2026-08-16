// Sanity-check a regenerated verification manifest against the committed one.
//
//   node scripts/check-verification-delta.mjs [--summary out.md]
//
// Run AFTER scripts/gen-verification.mjs, before anything commits or opens a PR.
//
// Why this exists: gen-verification.mjs writes whatever the fact-QA endpoint
// returns. If that pass comes back empty or badly short — a PubChem outage, a
// broken auth token, a regression in the endpoint — the generator happily emits
// a valid TypeScript file containing almost nothing, and every on-page
// "verified" badge silently disappears. That has happened: a refresh once took
// the manifest from 36 entries to 0, and because a missing entry degrades
// gracefully by design, the build stayed green and the loss went unnoticed.
//
// A build cannot catch this. Graceful degradation is the correct runtime
// behavior AND the thing that hides the failure, so the only place to catch it
// is here, by comparing entry counts before the change can travel any further.
//
// The distinction that matters is generator-broke vs data-drifted:
//   - a wholesale collapse means the pass failed → exit non-zero, ship nothing;
//   - a small drop means a compound genuinely stopped resolving → let it through
//     as a reviewable diff, but surface it so nobody rubber-stamps the PR.

import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const FILE = 'src/lib/verification.ts'

/** Fraction of entries that may disappear before we call the pass broken. */
const COLLAPSE_RATIO = 0.25

/** Pull the entry slugs out of a verification.ts source string. */
function slugsIn(source) {
  return new Set(
    [...source.matchAll(/^\s+'([a-z0-9-]+)':\s*\{\s*cid:/gm)].map((m) => m[1]),
  )
}

function committedSource() {
  try {
    return execFileSync('git', ['show', `HEAD:${FILE}`], { encoding: 'utf8' })
  } catch {
    // No committed baseline (first run, shallow checkout) — nothing to compare.
    return null
  }
}

const nextSource = fs.readFileSync(FILE, 'utf8')
const next = slugsIn(nextSource)
const prevSource = committedSource()
const prev = prevSource ? slugsIn(prevSource) : null

const added = prev ? [...next].filter((s) => !prev.has(s)).sort() : []
const removed = prev ? [...prev].filter((s) => !next.has(s)).sort() : []

const lines = []
const say = (l) => {
  lines.push(l)
  console.log(l)
}

say(`Verification manifest: ${prev ? prev.size : '—'} → ${next.size} entries`)
if (added.length) say(`Added (${added.length}): ${added.join(', ')}`)
if (removed.length) say(`Removed (${removed.length}): ${removed.join(', ')}`)
if (prev && !added.length && !removed.length) {
  say('No entries added or removed — value/date drift only.')
}

const summaryPath = process.argv.includes('--summary')
  ? process.argv[process.argv.indexOf('--summary') + 1]
  : null
if (summaryPath) fs.writeFileSync(summaryPath, lines.join('\n') + '\n')

// ── The gate ────────────────────────────────────────────────────────────────

if (next.size === 0) {
  console.error(
    '\nFAIL: the regenerated manifest is empty. The fact-QA pass returned nothing —\n' +
      'treat this as an upstream/auth failure, not as data. Refusing to ship it.',
  )
  process.exit(1)
}

if (prev && prev.size > 0) {
  const lost = removed.length / prev.size
  if (lost > COLLAPSE_RATIO) {
    console.error(
      `\nFAIL: ${removed.length} of ${prev.size} entries (${Math.round(lost * 100)}%) ` +
        `stopped resolving in one pass.\nThat is a broken verification run, not drift. ` +
        'Refusing to ship it.',
    )
    process.exit(1)
  }
  if (removed.length > 0) {
    console.log(
      `\nNote: ${removed.length} entry/entries lost verification. Within tolerance, ` +
        'so this proceeds as a reviewable diff — read the removals before merging.',
    )
  }
}

console.log('\nManifest delta is sane.')
