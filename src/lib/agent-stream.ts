// Helpers for streaming the Peptide Agent answer to the browser over SSE.
// Pure and framework-free so they can be unit-tested in isolation; the route
// (src/app/api/chat/route.ts) owns the ReadableStream wiring that uses them.

// Human-readable labels for the live grounding-progress events shown while the
// agent works. Unknown names degrade to a generic label.
export const TOOL_LABELS: Record<string, string> = {
  search_pubchem: 'Searching PubChem',
  search_clinical_trials: 'Searching ClinicalTrials.gov',
  search_pubmed: 'Searching PubMed',
  search_uniprot: 'Searching UniProt',
  reconstitute_vial: 'Calculating reconstitution',
  peptide_half_life: 'Computing half-life',
  rank_vendors: 'Ranking vendors',
  grade_coa: 'Grading the certificate',
}

export function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? 'Researching sources'
}

/**
 * Split a finished markdown answer into blocks that each render cleanly as they
 * arrive (whole paragraphs / list / table blocks), never cutting inside a fenced
 * code block. The client re-joins blocks with a blank line, so the concatenation
 * of the returned blocks (joined by "\n\n") is the original text with runs of
 * blank lines collapsed to one.
 */
export function chunkForStream(text: string): string[] {
  if (!text) return []
  const paras = text.split(/\n{2,}/)
  const blocks: string[] = []
  let buf = ''
  let fenceOpen = false
  for (const p of paras) {
    buf = buf ? `${buf}\n\n${p}` : p
    // A paragraph with an odd number of ``` fences flips whether we are inside a
    // code block; only flush when balanced so a fence is never split.
    if ((p.match(/```/g) || []).length % 2 === 1) fenceOpen = !fenceOpen
    if (!fenceOpen) {
      blocks.push(buf)
      buf = ''
    }
  }
  if (buf) blocks.push(buf)
  return blocks
}
