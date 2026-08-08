// Google Search Console — organic query expansion report.
//
// Pulls Search Analytics data for a verified property and writes a prioritized
// worklist: striking-distance queries (positions 5-20, one nudge from the top),
// low-CTR high-impression queries (title/meta rewrite candidates), emerging
// queries (rising in the last window), and a full ranked query dump.
//
// Designed for NEW / SPARSE sites: thresholds are low and relative, so even a
// handful of impressions surfaces. If there's barely any data yet, it says so
// plainly instead of returning an empty report.
//
// Zero dependencies — signs the Google service-account JWT with node:crypto and
// calls the REST API directly with fetch (Node 18+).
//
// ── One-time setup ───────────────────────────────────────────────────────────
//   1. In Google Cloud Console: create a project, enable the "Google Search
//      Console API", create a Service Account, and download its JSON key.
//   2. In Search Console → property → Settings → Users and permissions, add the
//      service-account email (client_email from the JSON) as a Full or
//      Restricted user.
//   3. Point the script at the key + property:
//        export GSC_SA_KEY_FILE="C:/Users/waite/.secrets/gsc-sa.json"
//        export GSC_SITE_URL="sc-domain:americanpeptide.com"   # or https://americanpeptide.com/
//      (or pass the site as the first CLI arg)
//
// Run:  node scripts/gsc-report.mjs [siteUrl] [--days=90]
//       npm run gsc -- sc-domain:americanpeptide.com

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createSign } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const positional = args.filter((a) => !a.startsWith('--'))

const SITE_URL = positional[0] || process.env.GSC_SITE_URL
const KEY_FILE = process.env.GSC_SA_KEY_FILE
const DAYS = Number(flags.days || 90)
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const ROW_LIMIT = 25000 // API max per request

// ── Auth: sign a JWT with the service account, exchange for an access token ──
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getAccessToken(keyFile) {
  let sa
  try {
    sa = JSON.parse(await readFile(resolve(keyFile), 'utf8'))
  } catch (e) {
    fail(`Could not read/parse key file at ${keyFile}: ${e.message}`)
  }
  if (!sa.client_email || !sa.private_key) {
    fail('Key file is missing client_email / private_key — is it a service-account JSON?')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  )
  const signingInput = `${header}.${claim}`
  const signature = base64url(
    createSign('RSA-SHA256').update(signingInput).sign(sa.private_key),
  )
  const assertion = `${signingInput}.${signature}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    fail(`Token exchange failed (${res.status}): ${JSON.stringify(json)}`)
  }
  return { token: json.access_token, clientEmail: sa.client_email }
}

// ── Data: query the Search Analytics API ────────────────────────────────────
function ymd(date) {
  return date.toISOString().slice(0, 10)
}

async function queryGSC(token, body) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE_URL,
  )}/searchAnalytics/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json)
    if (res.status === 403) {
      fail(
        `403 from Search Console: ${msg}\n` +
          `→ Make sure the service account is added as a user on the property\n` +
          `  and that GSC_SITE_URL exactly matches the verified property\n` +
          `  (domain properties use the "sc-domain:" prefix).`,
      )
    }
    fail(`Search Console API error (${res.status}): ${msg}`)
  }
  return json.rows || []
}

// Fetch a full window keyed by query (paginating past ROW_LIMIT if needed).
async function fetchQueries(token, startDate, endDate, dimensions = ['query']) {
  const rows = []
  for (let start = 0; ; start += ROW_LIMIT) {
    const batch = await queryGSC(token, {
      startDate,
      endDate,
      dimensions,
      rowLimit: ROW_LIMIT,
      startRow: start,
      dataState: 'all', // include fresh (not-yet-finalized) data — matters for new sites
    })
    rows.push(...batch)
    if (batch.length < ROW_LIMIT) break
  }
  return rows
}

// ── Report helpers ───────────────────────────────────────────────────────────
const pct = (n) => `${(n * 100).toFixed(1)}%`
const round = (n) => Math.round(n * 10) / 10

function mdTable(headers, rows) {
  if (!rows.length) return '_none_\n'
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n')
  return `${head}\n${sep}\n${body}\n`
}

function csvEscape(v) {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!SITE_URL) {
    fail(
      'No site URL. Pass one as the first arg or set GSC_SITE_URL.\n' +
        '  e.g. node scripts/gsc-report.mjs "sc-domain:americanpeptide.com"',
    )
  }
  if (!KEY_FILE) {
    fail(
      'No service-account key. Set GSC_SA_KEY_FILE to the path of the JSON key.\n' +
        '  See the setup notes at the top of this file.',
    )
  }

  console.log(`\nGSC query report for ${SITE_URL} (last ${DAYS} days)\n`)

  const { token, clientEmail } = await getAccessToken(KEY_FILE)
  console.log(`✓ Authenticated as ${clientEmail}`)

  const end = new Date()
  const start = new Date(end.getTime() - DAYS * 86400_000)
  const startDate = ymd(start)
  const endDate = ymd(end)

  const rows = await fetchQueries(token, startDate, endDate)
  console.log(`✓ Pulled ${rows.length} query rows`)

  // Totals — the first thing to know for a new site: is there ANY signal yet?
  const totals = rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks
      acc.impressions += r.impressions
      return acc
    },
    { clicks: 0, impressions: 0 },
  )

  if (rows.length === 0) {
    console.log(
      '\n⚠ No query data returned. For a brand-new property this is normal —\n' +
        '  GSC needs the site indexed and a few days of impressions before queries appear.\n' +
        '  Re-run in a few days. (Also double-check GSC_SITE_URL matches the verified property.)\n',
    )
  }

  const q = rows.map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))

  // 1. Striking distance — positions 5-20, ordered by impressions (biggest upside).
  const strikingDistance = q
    .filter((r) => r.position >= 5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)

  // 2. Low-CTR opportunities — decent impressions, CTR well below what the
  //    position "should" earn. Title/meta rewrite candidates. For sparse data
  //    we just flag anything with impressions but very few clicks.
  const minImpr = totals.impressions > 500 ? 20 : 3
  const lowCtr = q
    .filter((r) => r.impressions >= minImpr && r.position <= 15 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)

  // 3. Emerging — compare the most recent third of the window vs the prior third.
  const third = Math.max(7, Math.floor(DAYS / 3))
  const recentStart = ymd(new Date(end.getTime() - third * 86400_000))
  const priorStart = ymd(new Date(end.getTime() - third * 2 * 86400_000))
  const priorEnd = ymd(new Date(end.getTime() - third * 86400_000))

  const [recentRows, priorRows] = await Promise.all([
    fetchQueries(token, recentStart, endDate),
    fetchQueries(token, priorStart, priorEnd),
  ])
  const priorMap = new Map(priorRows.map((r) => [r.keys[0], r.impressions]))
  const emerging = recentRows
    .map((r) => ({
      query: r.keys[0],
      recent: r.impressions,
      prior: priorMap.get(r.keys[0]) || 0,
      position: r.position,
    }))
    .map((r) => ({ ...r, delta: r.recent - r.prior }))
    .filter((r) => r.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 30)

  // 4. Question / intent clusters — split the full list by intent marker.
  const INTENT = ['how', 'what', 'why', 'is ', 'vs', 'dosage', 'dose', 'side effect', 'benefit', 'stack', 'half life', 'buy', 'cost', 'price', 'legal', 'reddit', 'results', 'before and after']
  const intentClusters = {}
  for (const marker of INTENT) {
    const hits = q.filter((r) => r.query.toLowerCase().includes(marker.trim()))
    if (hits.length) intentClusters[marker.trim()] = hits.length
  }

  // ── Write outputs ─────────────────────────────────────────────────────────
  const outDir = resolve(__dirname, '../reports/gsc')
  await mkdir(outDir, { recursive: true })
  const stamp = endDate
  const slug = SITE_URL.replace(/^sc-domain:/, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '')
  const mdPath = resolve(outDir, `${slug}-${stamp}.md`)
  const csvPath = resolve(outDir, `${slug}-${stamp}.csv`)

  // Full ranked dump → CSV
  const csv = [
    'query,clicks,impressions,ctr,position',
    ...q
      .sort((a, b) => b.impressions - a.impressions)
      .map((r) =>
        [r.query, r.clicks, r.impressions, round(r.ctr * 100), round(r.position)]
          .map(csvEscape)
          .join(','),
      ),
  ].join('\n')
  await writeFile(csvPath, csv, 'utf8')

  const md = `# GSC query report — ${SITE_URL}

**Window:** ${startDate} → ${endDate} (${DAYS} days)
**Totals:** ${totals.clicks} clicks, ${totals.impressions} impressions across ${q.length} distinct queries

${
  totals.impressions < 50
    ? '> ⚠ **Very little data yet.** This property is new — treat everything below as early signal, not conclusions. Re-run weekly and watch what accretes.\n'
    : ''
}
## 1. Striking distance (positions 5–20)
One improvement — better title, a dedicated section, an internal link — can push these into the top 5 where the clicks are. Highest-ROI list here.

${mdTable(
  ['Query', 'Impr.', 'Clicks', 'CTR', 'Pos.'],
  strikingDistance
    .slice(0, 40)
    .map((r) => [r.query, r.impressions, r.clicks, pct(r.ctr), round(r.position)]),
)}

## 2. Low-CTR rewrite candidates (pos ≤15, CTR <2%)
Ranking okay but not getting the click — usually a title/meta mismatch with intent. (Min impressions counted: ${minImpr}.)

${mdTable(
  ['Query', 'Impr.', 'Clicks', 'CTR', 'Pos.'],
  lowCtr.slice(0, 30).map((r) => [r.query, r.impressions, r.clicks, pct(r.ctr), round(r.position)]),
)}

## 3. Emerging queries (recent ${third}d vs prior ${third}d)
Rising interest — being early is cheap ranking. New studies, trending compounds, seasonal intent.

${mdTable(
  ['Query', 'Recent impr.', 'Prior impr.', 'Δ', 'Pos.'],
  emerging.map((r) => [r.query, r.recent, r.prior, `+${r.delta}`, round(r.position)]),
)}

## 4. Intent clusters (content-brief seeds)
Counts of queries containing each intent marker — each cluster is a page or section worth building.

${mdTable(
  ['Intent marker', '# queries'],
  Object.entries(intentClusters)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, v]),
)}

---
Full ranked query list: [\`${slug}-${stamp}.csv\`](./${slug}-${stamp}.csv)
_Generated ${new Date().toISOString()} · dataState=all (includes fresh data)_
`

  await writeFile(mdPath, md, 'utf8')

  console.log(`\n✓ Report:  ${mdPath}`)
  console.log(`✓ Full CSV: ${csvPath}`)
  console.log(
    `\nSummary: ${totals.clicks} clicks / ${totals.impressions} impr · ` +
      `${strikingDistance.length} striking-distance · ${lowCtr.length} low-CTR · ${emerging.length} emerging\n`,
  )
}

class GscError extends Error {}
function fail(msg) {
  throw new GscError(msg)
}

main().catch((e) => {
  console.error(`\n✗ ${e instanceof GscError ? e.message : e.stack || e.message}\n`)
  process.exitCode = 1 // let open sockets close on their own, then exit — no abrupt teardown
})
