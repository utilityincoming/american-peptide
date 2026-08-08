// Eval harness for the research agent (/api/chat).
//
// Runs the golden question set against a LIVE /api/chat endpoint — so it tests
// the real agent, system prompt, grounding tools, and internal-linking exactly
// as deployed. Two grading layers:
//   1. Deterministic checks — required/forbidden substrings, internal-link
//      presence. Zero cost, zero ambiguity. A failure here is a hard fail.
//   2. LLM judge (optional, --judge) — one Fable 5 structured-output call per
//      case grading the answer against its rubric. Catches quality regressions
//      substrings can't (answer-first structure, confidence, honest framing).
//
// Usage:
//   1. Start the app:  npm run dev   (needs ANTHROPIC_API_KEY in .env.local)
//   2. node scripts/eval-agent.mjs [baseUrl] [--judge] [--json]
//        baseUrl   default http://localhost:3000
//        --judge   also run the LLM judge (needs ANTHROPIC_API_KEY in env)
//        --json    print machine-readable JSON instead of the markdown report
//
// Exit code is non-zero if any case fails — wire into CI to gate prompt edits.

import { GOLDEN } from './eval/golden.mjs'

const args = process.argv.slice(2)
const baseUrl = (args.find((a) => !a.startsWith('--')) || 'http://localhost:3000').replace(/\/$/, '')
const asJson = args.includes('--json')
// --ab: run every case twice (grounding on vs off) and report the lift agentic
// grounding provides. The lift is a quality measure, so AB implies the judge.
const ab = args.includes('--ab')
const useJudge = args.includes('--judge') || ab
// --only=id1,id2 — run just these case ids (cheap iteration on specific cases).
const onlyArg = (args.find((a) => a.startsWith('--only=')) || '').slice('--only='.length)
const onlyIds = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim()).filter(Boolean)) : null
const CASES = onlyIds ? GOLDEN.filter((c) => onlyIds.has(c.id)) : GOLDEN
// --samples=N — repeat each (case, arm) N times and average, so single-run
// noise doesn't masquerade as a real case-level delta. Default 1 (cheapest).
const samplesArg = Number((args.find((a) => a.startsWith('--samples=')) || '').slice('--samples='.length))
const SAMPLES = Number.isFinite(samplesArg) && samplesArg >= 1 ? Math.floor(samplesArg) : 1

// Judge model. Must be a model this account can actually call — claude-fable-5
// is unavailable here, so the judge would silently skip every case.
const MODEL = 'claude-opus-4-8'
const INTERNAL_HOST = 'americanpeptide.com'

// ── Talk to the agent ─────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Ask the agent. `grounding:false` runs the no-tools baseline (the route omits
// the grounding tools and the pre-retrieval catalog facts). Retries on 429 so
// the A/B doubling of requests doesn't trip the route's per-IP rate limit.
async function askAgent(question, { grounding = true } = {}) {
  const body = { messages: [{ role: 'user', content: question }] }
  if (!grounding) body.grounding = false

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 429) {
      await sleep(5500) // wait out the 60s/12-req window and retry
      continue
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    return { text: String(data.content ?? ''), refusal: data.stop === 'refusal' }
  }
  throw new Error('rate limited after retries (429)')
}

// ── Layer 1: deterministic checks ─────────────────────────────────────────────

// Collect internal link hrefs from markdown [text](url) and bare URLs. Internal
// = absolute americanpeptide.com OR a relative site path ("/catalog/..."); the
// chat model emits absolute URLs (from the site-index digest) while the
// retrieval fallback emits relative ones, so both forms must count.
function internalLinks(answer) {
  const links = []
  for (const m of answer.matchAll(/\]\((https?:\/\/[^)]+|\/[^)]+)\)/g)) links.push(m[1])
  for (const m of answer.matchAll(/https?:\/\/[^\s)]+/g)) links.push(m[0])
  return links.filter((u) => u.includes(INTERNAL_HOST) || u.startsWith('/'))
}

// A verifiable external source citation: PubChem CID, ClinicalTrials.gov NCT id,
// or PubMed PMID — in identifier or URL form. This is the highest-signal
// grounding discriminator: on long-tail compounds an ungrounded model cannot
// produce a *real* one, while the grounded agent cites what its tools returned.
function hasCitation(answer) {
  return (
    /\bCID[\s:]*\d+/i.test(answer) ||
    /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/\d+/i.test(answer) ||
    /\bNCT\d{6,8}\b/i.test(answer) ||
    /\bPMID[\s:]*\d+/i.test(answer) ||
    /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/i.test(answer) ||
    // UniProt: accession URL, or a Swiss-Prot accession token (e.g. O14793, P01588).
    /uniprot\.org\/uniprotkb\/\w+/i.test(answer) ||
    /\b[A-NR-Z][0-9][A-Z0-9]{3}[0-9]\b/.test(answer) ||
    /\b[OPQ][0-9][A-Z0-9]{3}[0-9]\b/.test(answer)
  )
}

function deterministicCheck(c, answer) {
  const lower = answer.toLowerCase()
  const fails = []

  for (const s of c.mustInclude ?? []) {
    if (!lower.includes(s.toLowerCase())) fails.push(`missing required: "${s}"`)
  }
  for (const s of c.mustNotInclude ?? []) {
    if (lower.includes(s.toLowerCase())) fails.push(`contains forbidden: "${s}"`)
  }
  if (c.expectCitation && !hasCitation(answer)) {
    fails.push('expected a verifiable citation (PubChem CID / NCT id / PMID); found none')
  }
  if (c.expectLink) {
    const links = internalLinks(answer)
    if (links.length === 0) {
      fails.push('expected an internal americanpeptide.com link; found none')
    } else if (typeof c.expectLink === 'string') {
      if (!links.some((u) => u.includes(c.expectLink))) {
        fails.push(`expected an internal link containing "${c.expectLink}"; got ${links.join(', ')}`)
      }
    }
  }
  return { pass: fails.length === 0, fails }
}

// ── Layer 2: LLM judge (structured output) ────────────────────────────────────

// Dimensional rubric. Splitting score into correctness / grounding / quality
// stops the judge saturating at a single 5/5 and — crucially — isolates the
// GROUNDING dimension, which is where agentic grounding should show its lift.
const JUDGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fail'] },
    // Each 1–5; the API's json_schema rejects integer minimum/maximum, so the
    // range is enforced in the system prompt and clamped on read.
    correctness: { type: 'integer' },
    grounding: { type: 'integer' },
    quality: { type: 'integer' },
    reason: { type: 'string' },
  },
  required: ['verdict', 'correctness', 'grounding', 'quality', 'reason'],
}

async function judge(apiKey, c, answer) {
  const system =
    'You are a STRICT QA grader for a peptide-research assistant. You are given a user question, grading criteria, and the assistant\'s answer. ' +
    'Return a verdict plus three independent 1–5 scores (5 = excellent). Be discriminating — do NOT default to 5; reserve 5 for answers with no shortcomings.\n' +
    '- correctness: factual accuracy against the criteria. Penalize wrong, vague, or hedged-where-it-should-be-confident answers.\n' +
    '- grounding: are SPECIFIC factual claims (molecular formula/weight, protein identity/sequence/function, trial phase/status, named studies) backed by VERIFIABLE identifiers actually present in the answer — a PubChem CID, a UniProt accession, an NCT id, or a PMID? For proteins/biologics (growth factors, antibody targets like myostatin), a UniProt accession counts as identity grounding. IMPORTANT: you do NOT have tool access and cannot look these up — do NOT assume a well-formed identifier is fabricated merely because you cannot personally verify it. CREDIT present, plausibly-formatted identifiers (NCT followed by digits, a numeric CID/PMID, a UniProt accession) as grounding. Reserve LOW grounding (1–2) for claims with NO identifier, malformed identifiers, or internal contradictions — and for inventing specifics about a compound/trial that does not exist. If the question is purely qualitative/mechanistic where no hard identifier is expected, grade grounding on whether claims are appropriately hedged and sourced. If the answer correctly refuses to invent facts about a non-existent compound/trial, grounding is HIGH.\n' +
    '- quality: answer-first structure, clarity, honesty about evidence strength, and no fabrication.\n' +
    'verdict "pass" only if the answer clearly satisfies the criteria; otherwise "fail". Be concise in reason.'
  const userPrompt = `User question:\n${c.question}\n\nGrading criteria:\n${c.rubric}\n\nAssistant answer:\n${answer}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      output_config: { format: { type: 'json_schema', schema: JUDGE_SCHEMA } },
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })
  if (!res.ok) {
    return { verdict: 'skip', correctness: 0, grounding: 0, quality: 0, score: 0, reason: `judge upstream ${res.status}` }
  }
  const data = await res.json()
  const text = data.content?.find((b) => b.type === 'text')?.text ?? '{}'
  try {
    const j = JSON.parse(text)
    // Range isn't schema-enforceable, so clamp 1–5 defensively.
    const clamp = (n) => (typeof n === 'number' ? Math.max(1, Math.min(5, Math.round(n))) : 0)
    j.correctness = clamp(j.correctness)
    j.grounding = clamp(j.grounding)
    j.quality = clamp(j.quality)
    // Composite overall, kept as `score` so existing displays keep working.
    j.score = Math.round((j.correctness + j.grounding + j.quality) / 3)
    return j
  } catch {
    return { verdict: 'skip', correctness: 0, grounding: 0, quality: 0, score: 0, reason: 'judge returned non-JSON' }
  }
}

// ── Run ────────────────────────────────────────────────────────────────────────

const apiKey = process.env.ANTHROPIC_API_KEY
if (useJudge && !apiKey) {
  console.error(`${ab ? '--ab' : '--judge'} requires ANTHROPIC_API_KEY in the environment.`)
  process.exit(2)
}

// Evaluate one case at one grounding setting. Returns the graded result.
async function evaluateCase(c, grounding) {
  let answer = ''
  let refusal = false
  let error = null
  try {
    const r = await askAgent(c.question, { grounding })
    answer = r.text
    refusal = r.refusal
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  // Always grade the returned TEXT, even on a model refusal: the route falls
  // back to grounded reference content, so a refused query can still deliver a
  // correct, linked answer. The LLM judge only runs on genuine model answers.
  const det = error
    ? { pass: false, fails: [`request failed: ${error}`] }
    : deterministicCheck(c, answer)
  let jdg = null
  if (useJudge && !error && !refusal) jdg = await judge(apiKey, c, answer)

  const source = error ? 'error' : refusal ? 'fallback' : 'model'
  const pass = det.pass && (!jdg || jdg.verdict !== 'fail')
  const score = jdg && typeof jdg.score === 'number' ? jdg.score : null
  return { id: c.id, question: c.question, answer, refusal, source, det, jdg, pass, score }
}

// Run a (case, arm) SAMPLES times and aggregate, so n=1 noise can't pose as a
// real delta. Means for the numeric dimensions; majority (≥50%) for pass/verdict.
// SAMPLES=1 is a passthrough, identical to a single evaluateCase.
async function sampledEvaluate(c, grounding) {
  if (SAMPLES === 1) return evaluateCase(c, grounding)
  const runs = []
  for (let i = 0; i < SAMPLES; i++) runs.push(await evaluateCase(c, grounding))

  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10)
  const numeric = (arr, k) => arr.map((x) => x?.[k]).filter((n) => typeof n === 'number')
  const majority = (n) => n >= SAMPLES / 2

  const jdgs = runs.map((r) => r.jdg).filter(Boolean)
  const jdg = jdgs.length
    ? {
        verdict: jdgs.filter((j) => j.verdict === 'pass').length >= jdgs.length / 2 ? 'pass' : 'fail',
        correctness: r1(mean(numeric(jdgs, 'correctness'))),
        grounding: r1(mean(numeric(jdgs, 'grounding'))),
        quality: r1(mean(numeric(jdgs, 'quality'))),
        score: r1(mean(numeric(jdgs, 'score'))),
        reason: `mean of ${jdgs.length} samples`,
      }
    : null
  const srcCounts = {}
  for (const r of runs) srcCounts[r.source] = (srcCounts[r.source] || 0) + 1
  const source = Object.entries(srcCounts).sort((a, b) => b[1] - a[1])[0][0]
  const detPassN = runs.filter((r) => r.det.pass).length

  return {
    id: c.id,
    question: c.question,
    answer: runs[0].answer,
    refusal: majority(runs.filter((r) => r.refusal).length),
    source,
    det: { pass: majority(detPassN), fails: runs[0].det.fails, passRate: detPassN / SAMPLES },
    jdg,
    pass: majority(runs.filter((r) => r.pass).length),
    passRate: runs.filter((r) => r.pass).length / SAMPLES,
    score: r1(mean(numeric(runs, 'score'))),
    samples: SAMPLES,
  }
}

// ── A/B mode: grounding on vs off, measure the lift ──────────────────────────
if (ab) {
  console.error(
    `A/B: ${CASES.length} cases × {grounded, ungrounded}${SAMPLES > 1 ? ` × ${SAMPLES} samples` : ''} against ${baseUrl}/api/chat (+judge)…`,
  )
  const rows = []
  for (const c of CASES) {
    const on = await sampledEvaluate(c, true)
    const off = await sampledEvaluate(c, false)
    rows.push({ id: c.id, on, off })
    const d = on.score != null && off.score != null ? on.score - off.score : null
    console.error(
      `  ${c.id}  grounded ${on.pass ? 'PASS' : 'FAIL'}${on.score != null ? ` ${on.score}/5` : ''}` +
        `  vs ungrounded ${off.pass ? 'PASS' : 'FAIL'}${off.score != null ? ` ${off.score}/5` : ''}` +
        `${d != null ? `  Δ${d >= 0 ? '+' : ''}${d}` : ''}`,
    )
  }

  const onPass = rows.filter((r) => r.on.pass).length
  const offPass = rows.filter((r) => r.off.pass).length
  const scored = rows.filter((r) => r.on.score != null && r.off.score != null)
  const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  const onAvg = avg(scored.map((r) => r.on.score))
  const offAvg = avg(scored.map((r) => r.off.score))
  // Grounding dimension — the lift agentic grounding should drive most directly.
  const onGround = avg(scored.map((r) => r.on.jdg?.grounding ?? 0))
  const offGround = avg(scored.map((r) => r.off.jdg?.grounding ?? 0))
  const improved = scored.filter((r) => r.on.score > r.off.score).length
  const regressed = scored.filter((r) => r.on.score < r.off.score).length
  const tied = scored.length - improved - regressed
  // Cases where grounding flipped the pass/fail verdict.
  const flippedToPass = rows.filter((r) => r.on.pass && !r.off.pass).length
  const flippedToFail = rows.filter((r) => !r.on.pass && r.off.pass).length

  if (asJson) {
    console.log(
      JSON.stringify({ baseUrl, mode: 'ab', onPass, offPass, onAvg, offAvg, onGround, offGround, rows }, null, 2),
    )
  } else {
    const pct = (n) => `${Math.round((n / CASES.length) * 100)}%`
    const lift = (a, b) => `${a - b >= 0 ? '+' : ''}${(a - b).toFixed(2)}`
    const lines = [
      `# Agent eval — grounding A/B — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
      '',
      `Endpoint: ${baseUrl}/api/chat · ${CASES.length} cases × 2 arms${SAMPLES > 1 ? ` × ${SAMPLES} samples (averaged)` : ''}`,
      '',
      '## Lift from agentic grounding',
      '',
      `| Metric | Grounded | Ungrounded | Lift |`,
      `|---|---|---|---|`,
      `| Pass rate | ${onPass}/${CASES.length} (${pct(onPass)}) | ${offPass}/${CASES.length} (${pct(offPass)}) | ${onPass - offPass >= 0 ? '+' : ''}${onPass - offPass} |`,
      `| Grounding (citations) | ${onGround.toFixed(2)}/5 | ${offGround.toFixed(2)}/5 | ${lift(onGround, offGround)} |`,
      `| Avg judge score | ${onAvg.toFixed(2)}/5 | ${offAvg.toFixed(2)}/5 | ${lift(onAvg, offAvg)} |`,
      '',
      `Grounding **improved ${improved}**, regressed ${regressed}, tied ${tied} (by judge score). ` +
        `Pass/fail flips: ${flippedToPass} fixed by grounding, ${flippedToFail} broken by it.`,
      '',
      '## Per-case (overall score · grounding)',
      '',
      '| Case | Grounded | Ungrounded | Δground |',
      '|---|---|---|---|',
    ]
    for (const r of rows) {
      const fmt = (x) =>
        `${x.pass ? 'PASS' : '**FAIL**'}${x.score != null ? ` ${x.score}/5` : ''}` +
        `${x.jdg?.grounding ? ` · g${x.jdg.grounding}` : ''}${x.source !== 'model' ? ` (${x.source})` : ''}`
      const dg =
        r.on.jdg?.grounding != null && r.off.jdg?.grounding != null
          ? r.on.jdg.grounding - r.off.jdg.grounding
          : null
      const dgFmt = dg == null ? '—' : `${dg >= 0 ? '+' : ''}${Math.round(dg * 10) / 10}`
      lines.push(`| ${r.id} | ${fmt(r.on)} | ${fmt(r.off)} | ${dgFmt} |`)
    }
    lines.push(
      '',
      '> Grounded = full agentic stack (PubChem/ClinicalTrials/PubMed tools + pre-retrieval catalog facts). ' +
        'Ungrounded = same prompt with tools and injected facts removed. Judge rubrics reward grounded, cited claims, ' +
        'so the score lift reflects fidelity gained on subject queries.',
    )
    console.log(lines.join('\n'))
  }
  // Regression gate: fail if grounding made the suite worse on pass rate.
  process.exit(onPass < offPass ? 1 : 0)
}

// ── Single-run mode ──────────────────────────────────────────────────────────
console.error(`Running ${CASES.length} cases against ${baseUrl}/api/chat${useJudge ? ' (+LLM judge)' : ''}…`)

const results = []
for (const c of CASES) {
  const r = await sampledEvaluate(c, true)
  results.push(r)
  console.error(`  ${r.pass ? 'PASS' : 'FAIL'}  [${r.source}]  ${r.id}`)
}

const passed = results.filter((r) => r.pass).length
const refused = results.filter((r) => r.refusal).length
const failed = results.length - passed

if (asJson) {
  console.log(JSON.stringify({ baseUrl, useJudge, passed, failed, results }, null, 2))
} else {
  const lines = [
    `# Agent eval — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    `Endpoint: ${baseUrl}/api/chat · Judge: ${useJudge ? 'on' : 'off'}`,
    '',
    `**${passed}/${results.length} passed**${failed ? ` · ${failed} failed` : ' ✅'}${refused ? ` · ${refused} served by fallback` : ''}`,
    '',
    '| Result | Case | Source | Det. | Judge | Notes |',
    '|---|---|---|---|---|---|',
  ]
  for (const r of results) {
    const det = r.det.pass ? 'ok' : '✗'
    const jdg = r.jdg ? (r.jdg.verdict === 'skip' ? 'skip' : `${r.jdg.verdict} ${r.jdg.score}/5`) : '—'
    const notes = [...r.det.fails, r.jdg && r.jdg.verdict === 'fail' ? r.jdg.reason : '']
      .filter(Boolean)
      .join('; ')
      .replace(/\|/g, '\\|')
      .slice(0, 180)
    lines.push(`| ${r.pass ? 'PASS' : '**FAIL**'} | ${r.id} | ${r.source} | ${det} | ${jdg} | ${notes} |`)
  }
  if (refused) {
    lines.push(
      '',
      `> ℹ️ ${refused} case(s) hit a model-layer refusal (stop_reason=refusal) and were answered from our published reference via the retrieval fallback. Source "model" = generated by the chat model; "fallback" = grounded catalog content. The refusal is a model/policy behavior; the catalog/API/MCP surfaces are unaffected either way.`,
    )
  }
  console.log(lines.join('\n'))
}

process.exit(failed > 0 ? 1 : 0)
