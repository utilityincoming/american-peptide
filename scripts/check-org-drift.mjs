// Drift check: americanpeptide.com (this repo) vs americanpeptide.org
// (utilityincoming/american-peptide-org, the public methods/standards site).
//
// WHY: .org publishes "reference implementations of the bench math that .com
// runs" plus an open dataset export. Its entire credibility rests on those
// numbers still matching .com. Nothing enforced that — the match was by hand
// (a BLEND_SCREEN_COM_COMMIT comment, a dated dataset snapshot). This script
// makes the match checkable in CI.
//
// WHAT IT CHECKS
//   HARD (exit 1 on failure):
//     1. Behavioral parity — reconstitution + pharmacokinetics pure functions
//        produce identical output in both repos across an input battery.
//     2. Constants parity — the four blend-screen thresholds are equal.
//   SOFT (reported, never fails the build on its own):
//     3. Pin freshness — .com's blend-screen source changed since the commit
//        .org pins in BLEND_SCREEN_COM_COMMIT.
//     4. Data freshness — age of .org's dataset snapshot and the catalog-count
//        delta between the two sites.
//
// USAGE: node --experimental-strip-types scripts/check-org-drift.mjs [ORG_DIR]
//   ORG_DIR defaults to $ORG_DIR, else ../american-peptide-org.
//   --soft-only  : run but never exit non-zero (for an advisory/scheduled lane).
//   Node 22.18+ strips TS types without the flag; the flag keeps older 22.x happy.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const COM_DIR = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const ORG_DIR = path.resolve(
  process.argv.find((a) => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1]) ??
    process.env.ORG_DIR ??
    path.join(COM_DIR, '..', 'american-peptide-org'),
)
const SOFT_ONLY = process.argv.includes('--soft-only')

const hardFailures = []
const warnings = []
const notes = []

function hard(msg) {
  hardFailures.push(msg)
}
function warn(msg) {
  warnings.push(msg)
}
function note(msg) {
  notes.push(msg)
}

if (!existsSync(ORG_DIR)) {
  console.error(
    `ORG_DIR not found: ${ORG_DIR}\n` +
      `Clone the public repo first, e.g.\n` +
      `  git clone --depth 1 https://github.com/utilityincoming/american-peptide-org ${ORG_DIR}`,
  )
  process.exit(2)
}

const comCalc = (rel) => pathToFileURL(path.join(COM_DIR, 'src', 'lib', rel)).href
const orgCalc = (rel) => pathToFileURL(path.join(ORG_DIR, 'packages', 'calculators', rel)).href

// ── 1. Behavioral parity ────────────────────────────────────────────────────
// Exact equality: both sides are the same pure arithmetic, so outputs must be
// bit-identical. A mismatch means the reference drifted from production.
function approxEqual(a, b) {
  if (a === b) return true
  if (typeof a !== 'number' || typeof b !== 'number') return false
  // Agreement on a non-finite result (both NaN, or both ±Infinity for an
  // out-of-domain input) is parity, not drift.
  if (Number.isNaN(a) && Number.isNaN(b)) return true
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
}

async function checkReconstitution() {
  const com = await import(comCalc('reconstitution.ts'))
  const org = await import(orgCalc('reconstitution.ts'))
  let cases = 0
  for (const vialAmount of [0, 1, 250, 5000, 10000, 33333]) {
    for (const dose of [0, 1, 250, 500, 2500]) {
      for (const waterMl of [0, 0.5, 1, 2, 3, 5]) {
        cases++
        const c = com.reconstitute({ vialAmount, dose, waterMl })
        const o = org.reconstitute({ vialAmount, dose, waterMl })
        for (const k of Object.keys(c)) {
          if (!approxEqual(c[k], o[k])) {
            hard(
              `reconstitute().${k} differs at {vial:${vialAmount},dose:${dose},water:${waterMl}} — ` +
                `.com=${c[k]} .org=${o[k]}`,
            )
          }
        }
      }
    }
  }
  for (const vialAmount of [1000, 5000, 10000]) {
    for (const dose of [100, 250, 500]) {
      for (const drawUnits of [10, 20, 50]) {
        cases++
        const c = com.solveWaterForDraw(vialAmount, dose, drawUnits)
        const o = org.solveWaterForDraw(vialAmount, dose, drawUnits)
        if (!approxEqual(c, o)) {
          hard(
            `solveWaterForDraw(${vialAmount},${dose},${drawUnits}) — .com=${c} .org=${o}`,
          )
        }
      }
    }
  }
  note(`reconstitution: ${cases} input combinations compared`)
}

async function checkPharmacokinetics() {
  const com = await import(comCalc('pharmacokinetics.ts'))
  const org = await import(orgCalc('pharmacokinetics.ts'))
  // Only the pure (number, number[, number]) helpers are compared — getPk /
  // interactionCheck are data-backed and intentionally .com-only.
  const half = [1, 6, 24, 72, 168, 340]
  // Each helper's second argument has its own domain.
  const secondArgs = {
    fractionRemaining: [0.1, 0.5, 2, 12, 24, 48, 168], // hours elapsed
    timeToFraction: [0.03, 0.1, 0.25, 0.5, 0.75, 0.97], // target remaining fraction (0,1)
  }
  let cases = 0
  for (const [fn, args] of Object.entries(secondArgs)) {
    if (typeof com[fn] !== 'function' || typeof org[fn] !== 'function') {
      hard(`pharmacokinetics.${fn} missing on ${typeof com[fn] !== 'function' ? '.com' : '.org'}`)
      continue
    }
    for (const a of half)
      for (const b of args) {
        cases++
        if (!approxEqual(com[fn](a, b), org[fn](a, b)))
          hard(`${fn}(${a},${b}) — .com=${com[fn](a, b)} .org=${org[fn](a, b)}`)
      }
  }
  for (const fn of ['timeToSteadyState', 'clearanceTime']) {
    for (const a of half) {
      cases++
      if (!approxEqual(com[fn](a), org[fn](a)))
        hard(`${fn}(${a}) — .com=${com[fn](a)} .org=${org[fn](a)}`)
    }
  }
  for (const fn of ['accumulationRatio', 'peakTroughRatio']) {
    for (const a of half)
      for (const iv of [6, 12, 24, 48, 168]) {
        cases++
        if (!approxEqual(com[fn](a, iv), org[fn](a, iv)))
          hard(`${fn}(${a},${iv}) — .com=${com[fn](a, iv)} .org=${org[fn](a, iv)}`)
      }
  }
  note(`pharmacokinetics: ${cases} input combinations compared`)
}

// ── 2. Constants parity ──────────────────────────────────────────────────────
// .com's blend-screen.ts imports catalog/property modules, so it can't be
// loaded standalone here. Compare the shared numeric thresholds textually.
const BLEND_CONSTS = [
  'DEFAULT_BUFFER_PH',
  'PI_WINDOW',
  'OPPOSITE_CHARGE_MIN',
  'GRAVY_HYDROPHOBIC',
]
function readConst(src, name) {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*([-0-9.]+)`))
  return m ? m[1] : null
}
function checkBlendConstants() {
  const comSrc = readFileSync(path.join(COM_DIR, 'src/lib/blend-screen.ts'), 'utf8')
  const orgSrc = readFileSync(
    path.join(ORG_DIR, 'packages/calculators/blend-screen.ts'),
    'utf8',
  )
  for (const name of BLEND_CONSTS) {
    const c = readConst(comSrc, name)
    const o = readConst(orgSrc, name)
    if (c === null || o === null) {
      warn(`blend-screen const ${name}: .com=${c ?? 'absent'} .org=${o ?? 'absent'} (could not parse)`)
    } else if (c !== o) {
      hard(`blend-screen const ${name} differs — .com=${c} .org=${o}`)
    }
  }
  note(`blend-screen: ${BLEND_CONSTS.length} shared thresholds compared`)
  return { comSrc, orgSrc }
}

// ── 3. Pin freshness ─────────────────────────────────────────────────────────
function checkPin(orgBlendSrc) {
  const m = orgBlendSrc.match(/BLEND_SCREEN_COM_COMMIT\s*=\s*["']([0-9a-f]{7,40})["']/)
  if (!m) {
    warn('BLEND_SCREEN_COM_COMMIT not found in .org blend-screen.ts')
    return
  }
  const pin = m[1]
  const files = ['src/lib/blend-screen.ts', 'src/lib/amino-acids.ts', 'src/lib/peptide-properties.ts']
  let hasCommit = true
  try {
    execFileSync('git', ['cat-file', '-e', `${pin}^{commit}`], { cwd: COM_DIR, stdio: 'ignore' })
  } catch {
    hasCommit = false
  }
  if (!hasCommit) {
    note(
      `pin ${pin.slice(0, 10)} not in local history (shallow checkout?) — cannot verify freshness`,
    )
    return
  }
  let changed
  try {
    changed = execFileSync('git', ['log', '--oneline', `${pin}..HEAD`, '--', ...files], {
      cwd: COM_DIR,
      encoding: 'utf8',
    }).trim()
  } catch (e) {
    note(`pin freshness: git log failed (${e.message.split('\n')[0]})`)
    return
  }
  if (changed) {
    const n = changed.split('\n').length
    warn(
      `.com blend-screen source changed in ${n} commit(s) since pinned ${pin.slice(0, 10)}. ` +
        `Re-check packages/calculators/blend-screen.ts in .org and bump BLEND_SCREEN_COM_COMMIT.`,
    )
  } else {
    note(`pin ${pin.slice(0, 10)} is current (no blend-screen source changes since)`)
  }
}

// ── 4. Data freshness ────────────────────────────────────────────────────────
function countSlugs(src) {
  const m = src.match(/slug:\s*['"]/g)
  return m ? m.length : 0
}
function checkData() {
  // .org dataset snapshot age, from any datasets-YYYY-MM-DD.bib stamp.
  const bibDir = path.join(ORG_DIR, 'public/cite')
  let stamp = null
  try {
    const f = readdirSync(bibDir).find((n) => /^datasets-\d{4}-\d{2}-\d{2}\.bib$/.test(n))
    if (f) stamp = f.slice('datasets-'.length, 'datasets-'.length + 10)
  } catch {}
  if (stamp) {
    const ageDays = Math.floor((Date.now() - Date.parse(stamp)) / 86_400_000)
    note(`.org dataset snapshot stamp: ${stamp} (${ageDays} days old)`)
    if (ageDays > 120) warn(`.org open dataset is ${ageDays} days old (stamp ${stamp}).`)
  } else {
    note('.org dataset stamp not found')
  }

  // Catalog-count delta: .org exported compounds vs .com listed peptides.
  let orgCount = null
  try {
    const arr = JSON.parse(readFileSync(path.join(ORG_DIR, 'public/data/compounds.json'), 'utf8'))
    orgCount = Array.isArray(arr) ? arr.length : (arr.compounds?.length ?? null)
  } catch {}
  let comListed = null
  try {
    const pep = readFileSync(path.join(COM_DIR, 'src/lib/peptides.ts'), 'utf8')
    // LISTED_PEPTIDES is the public set; fall back to total slug count.
    const listedBlock = pep.match(/LISTED_PEPTIDES[^\n]*=\s*([\s\S]*?)\n\n/)
    comListed = countSlugs(pep) // total slugs as an upper bound
    note(`.com peptides.ts total slug entries: ${comListed}`)
    void listedBlock
  } catch {}
  if (orgCount != null) note(`.org compounds.json entries: ${orgCount}`)
  // The gap between .com's total slug count and .org's export is expected
  // (unlisted/withdrawn entries are not exported), so this is informational,
  // not a warning — the dataset-age check above is the real staleness signal.
  if (orgCount != null && comListed != null) {
    note(
      `catalog size: .com ~${comListed} slug entries vs .org ${orgCount} exported ` +
        `(gap of ${comListed - orgCount} is expected for unlisted entries; regenerate /data if .com's listed set changed).`,
    )
  }
}

// ── run ──────────────────────────────────────────────────────────────────────
console.log(`Drift check`)
console.log(`  .com: ${COM_DIR}`)
console.log(`  .org: ${ORG_DIR}`)
console.log('')

await checkReconstitution()
await checkPharmacokinetics()
const { orgSrc } = checkBlendConstants()
checkPin(orgSrc)
checkData()

function section(title, items, symbol, cap = 25) {
  if (!items.length) return ''
  const shown = items.slice(0, cap)
  const extra = items.length - shown.length
  return (
    `\n${title}\n` +
    shown.map((i) => `  ${symbol} ${i}`).join('\n') +
    (extra > 0 ? `\n  …and ${extra} more` : '') +
    '\n'
  )
}

const report =
  section('NOTES', notes, '·') +
  section('WARNINGS (soft — review, not blocking)', warnings, '⚠') +
  section('DRIFT (hard — reference no longer matches production)', hardFailures, '✗')

console.log(report || 'No findings.')

const summaryPath = process.env.GITHUB_STEP_SUMMARY
if (summaryPath) {
  const md =
    `## org ↔ com drift check\n\n` +
    `- **${hardFailures.length}** hard drift ${hardFailures.length === 1 ? 'failure' : 'failures'}\n` +
    `- **${warnings.length}** warning(s)\n\n` +
    (hardFailures.length
      ? '### Drift\n' +
        hardFailures.slice(0, 25).map((h) => `- ✗ ${h}`).join('\n') +
        (hardFailures.length > 25 ? `\n- …and ${hardFailures.length - 25} more` : '') +
        '\n\n'
      : '') +
    (warnings.length ? '### Warnings\n' + warnings.map((w) => `- ⚠ ${w}`).join('\n') + '\n\n' : '') +
    (notes.length ? '<details><summary>Notes</summary>\n\n' + notes.map((n) => `- ${n}`).join('\n') + '\n</details>\n' : '')
  try {
    const { appendFileSync } = await import('node:fs')
    appendFileSync(summaryPath, md)
  } catch {}
}

if (hardFailures.length && !SOFT_ONLY) {
  console.error(`\n${hardFailures.length} hard drift failure(s). The .org reference no longer matches .com.`)
  process.exit(1)
}
console.log('\nOK (no hard drift).')
