// One-shot PubChem enrichment.
//
// Reads the canonical peptide slugs + query names below, hits the PubChem PUG
// REST API for each, and writes the result to src/lib/peptides.pubchem.json
// as a slug → {cid, formula, mw, iupacName} map. Many peptides are too large
// to be indexed by PubChem and will be skipped (404) — that's expected.
//
// Run: npm run enrich

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/lib/peptides.pubchem.json')

// Slug + name pairs to query. Aliases let us fall back if the canonical name
// isn't indexed under that exact string in PubChem.
const TARGETS = [
  { slug: 'semaglutide',         names: ['semaglutide'] },
  { slug: 'tirzepatide',         names: ['tirzepatide'] },
  { slug: 'retatrutide',         names: ['retatrutide', 'LY3437943'] },
  { slug: 'cagrilintide',        names: ['cagrilintide'] },
  { slug: 'bpc-157',             names: ['BPC-157', 'BPC 157'] },
  { slug: 'tb-500',              names: ['TB-500', 'thymosin beta-4 fragment'] },
  { slug: 'ghk-cu',              names: ['GHK-Cu', 'copper tripeptide-1'] },
  { slug: 'cjc-1295-no-dac',     names: ['CJC-1295', 'modified GRF (1-29)'] },
  { slug: 'cjc-1295-with-dac',   names: ['CJC-1295 DAC'] },
  { slug: 'ipamorelin',          names: ['ipamorelin'] },
  { slug: 'tesamorelin',         names: ['tesamorelin'] },
  { slug: 'sermorelin',          names: ['sermorelin'] },
  { slug: 'hexarelin',           names: ['hexarelin'] },
  { slug: 'mots-c',              names: ['MOTS-c'] },
  { slug: 'ss-31',               names: ['elamipretide', 'SS-31'] },
  { slug: 'epitalon',            names: ['epitalon', 'epithalon'] },
  { slug: 'semax',               names: ['semax'] },
  { slug: 'selank',              names: ['selank'] },
  { slug: 'dsip',                names: ['delta sleep-inducing peptide', 'DSIP'] },
  { slug: 'melanotan-2',         names: ['melanotan II', 'melanotan-2'] },
  { slug: 'pt-141',              names: ['bremelanotide', 'PT-141'] },
  { slug: 'kisspeptin-10',       names: ['kisspeptin-10'] },
  { slug: 'thymosin-alpha-1',    names: ['thymalfasin', 'thymosin alpha 1'] },
  { slug: 'll-37',               names: ['LL-37', 'cathelicidin LL-37'] },
  { slug: 'kpv',                 names: ['lysine-proline-valine', 'KPV peptide'] },
  { slug: 'aod-9604',            names: ['AOD-9604', 'AOD9604'] },
  { slug: '5-amino-1mq',         names: ['5-amino-1-methylquinolinium', '5-amino-1MQ'] },
  { slug: 'nad-plus',            names: ['NAD+', 'nicotinamide adenine dinucleotide'] },
]

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}

async function lookupCid(names) {
  for (const name of names) {
    try {
      const data = await fetchJson(
        `${BASE}/compound/name/${encodeURIComponent(name)}/cids/JSON`,
      )
      const cid = data?.IdentifierList?.CID?.[0]
      if (cid) return { cid, matchedName: name }
    } catch (err) {
      console.warn(`  ! lookup error for "${name}": ${err.message}`)
    }
    await sleep(220) // PubChem ~5 req/sec ceiling
  }
  return null
}

async function fetchProps(cid) {
  const data = await fetchJson(
    `${BASE}/compound/cid/${cid}/property/MolecularWeight,MolecularFormula,IUPACName/JSON`,
  )
  return data?.PropertyTable?.Properties?.[0] ?? null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const out = {}
  let hits = 0
  let misses = 0

  for (const target of TARGETS) {
    process.stdout.write(`• ${target.slug.padEnd(22)} `)
    const found = await lookupCid(target.names)
    if (!found) {
      console.log('— no PubChem match')
      misses++
      continue
    }

    let props = null
    try {
      props = await fetchProps(found.cid)
    } catch (err) {
      console.log(`CID ${found.cid} but property fetch failed: ${err.message}`)
      misses++
      continue
    }

    out[target.slug] = {
      cid: found.cid,
      matchedName: found.matchedName,
      molecularWeight: props?.MolecularWeight
        ? Number(props.MolecularWeight)
        : null,
      molecularFormula: props?.MolecularFormula ?? null,
      iupacName: props?.IUPACName ?? null,
    }
    console.log(
      `CID ${String(found.cid).padEnd(10)} ${
        props?.MolecularFormula ?? ''
      }`,
    )
    hits++
    await sleep(220)
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')

  console.log(`\nWrote ${Object.keys(out).length} enrichments → ${OUT}`)
  console.log(`Hits: ${hits} · Misses: ${misses}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
