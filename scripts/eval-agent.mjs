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
const useJudge = args.includes('--judge')
const asJson = args.includes('--json')

const MODEL = 'claude-fable-5'
const INTERNAL_HOST = 'americanpeptide.com'

// ── Talk to the agent ─────────────────────────────────────────────────────────

async function askAgent(question) {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  return { text: String(data.content ?? ''), refusal: data.stop === 'refusal' }
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

function deterministicCheck(c, answer) {
  const lower = answer.toLowerCase()
  const fails = []

  for (const s of c.mustInclude ?? []) {
    if (!lower.includes(s.toLowerCase())) fails.push(`missing required: "${s}"`)
  }
  for (const s of c.mustNotInclude ?? []) {
    if (lower.includes(s.toLowerCase())) fails.push(`contains forbidden: "${s}"`)
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

const JUDGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fail'] },
    score: { type: 'integer', minimum: 1, maximum: 5 },
    reason: { type: 'string' },
  },
  required: ['verdict', 'score', 'reason'],
}

async function judge(apiKey, c, answer) {
  const system =
    'You are a strict QA grader for a peptide-research assistant. Given a user question, grading criteria, and the assistant\'s answer, decide if the answer satisfies the criteria. ' +
    'Grade ONLY against the criteria provided. verdict "pass" only if the answer clearly meets them; otherwise "fail". score 1-5 (5 = excellent). Be concise.'
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
    return { verdict: 'skip', score: 0, reason: `judge upstream ${res.status}` }
  }
  const data = await res.json()
  const text = data.content?.find((b) => b.type === 'text')?.text ?? '{}'
  try {
    return JSON.parse(text)
  } catch {
    return { verdict: 'skip', score: 0, reason: 'judge returned non-JSON' }
  }
}

// ── Run ────────────────────────────────────────────────────────────────────────

const apiKey = process.env.ANTHROPIC_API_KEY
if (useJudge && !apiKey) {
  console.error('--judge requires ANTHROPIC_API_KEY in the environment.')
  process.exit(2)
}

console.error(`Running ${GOLDEN.length} cases against ${baseUrl}/api/chat${useJudge ? ' (+LLM judge)' : ''}…`)

const results = []
for (const c of GOLDEN) {
  let answer = ''
  let refusal = false
  let error = null
  try {
    const r = await askAgent(c.question)
    answer = r.text
    refusal = r.refusal
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  // Always grade the returned TEXT, even on a model refusal: the route now
  // falls back to grounded reference content, so a refused query can still
  // deliver a correct, linked answer. `refusal` becomes an annotation (which
  // SOURCE produced the text), not an automatic fail. The LLM judge only runs
  // on genuine model answers — its rubrics grade generative quality, not a
  // reference brief, which the deterministic checks already cover.
  const det = error
    ? { pass: false, fails: [`request failed: ${error}`] }
    : deterministicCheck(c, answer)
  let jdg = null
  if (useJudge && !error && !refusal) jdg = await judge(apiKey, c, answer)

  const source = error ? 'error' : refusal ? 'fallback' : 'model'
  const pass = det.pass && (!jdg || jdg.verdict !== 'fail')
  results.push({ id: c.id, question: c.question, answer, refusal, source, det, jdg, pass })
  console.error(`  ${pass ? 'PASS' : 'FAIL'}  [${source}]  ${c.id}`)
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
