// One-shot migration: convert hardcoded dark-only color classes to theme tokens
// so light mode works via a single class swap on <html>. Idempotent-ish — run
// once. Reports per-rule counts. Only touches className-style color utilities.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Collect .tsx files under src/
function walk(dir, acc = []) {
  const { readdirSync, statSync } = require('node:fs')
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (p.endsWith('.tsx')) acc.push(p)
  }
  return acc
}
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const root = process.cwd()
const files = walk(join(root, 'src'))

// Ordered replacement rules. Each: [regex, replacement, label]
const rules = [
  // 1) white -> ink (foreground + overlays). Preserves /opacity and /[0.0x].
  //    Properties that take a color and are used with `white` in this codebase.
  [/\b(text|bg|border|ring|divide|from|to|via|fill|stroke|outline|decoration|placeholder|caret)-white\b/g, '$1-ink', 'white→ink'],

  // 2) Surface backgrounds -> tokens (these must flip light/dark).
  [/\bbg-\[#0B1220\]/g, 'bg-surface', 'bg #0B1220→surface'],
  [/\b(from|to|via)-\[#0B1220\]/g, '$1-surface', 'gradient #0B1220→surface'],
  [/\bbg-\[#040810\]/g, 'bg-surface-deep', 'bg #040810→surface-deep'],
  [/\bbg-\[#0F1828\]/g, 'bg-panel', 'bg #0F1828→panel'],
  [/\bbg-\[#0F1A2E\]/g, 'bg-panel', 'bg #0F1A2E→panel'],

  // 3) Teal used as TEXT -> accent token (darkens for contrast on light).
  //    Teal as bg/border/gradient/fill stays literal — bright teal reads fine
  //    as a fill on a light surface.
  [/\btext-\[#2DD4A8\]/g, 'text-accent', 'text #2DD4A8→accent'],
  [/\btext-\[#34D399\]/g, 'text-accent', 'text #34D399→accent'],
  [/\btext-\[#5EEBC8\]/g, 'text-accent', 'text #5EEBC8→accent'],
]

const totals = {}
let changedFiles = 0

for (const file of files) {
  const orig = readFileSync(file, 'utf8')
  let out = orig
  for (const [re, repl, label] of rules) {
    out = out.replace(re, (m, ...rest) => {
      totals[label] = (totals[label] || 0) + 1
      // Support $1 substitution manually for the group rules.
      return repl.replace('$1', rest[0] ?? '')
    })
  }
  if (out !== orig) {
    writeFileSync(file, out, 'utf8')
    changedFiles++
  }
}

console.log('Files changed:', changedFiles)
for (const [label, n] of Object.entries(totals)) console.log(`  ${label}: ${n}`)
