'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { SCANNED_PDF_MIN_NON_WS_CHARS, extractPdfText } from '@/lib/coa-pdf'
import { signalsForText, type PolicyFlags } from '@/lib/lab-tools/signals'
import { ATTRIBUTION, rowsToCsv } from '@/lib/research-workspace/sequence'
import MethodsPanel from '@/components/research-workspace/MethodsPanel'
import { TRUST_RUBRIC } from '@/lib/vendors'

interface Block {
  id: string
  label: string
  text: string
  note: string
}

export default function BatchCoa() {
  const [raw, setRaw] = useState('')
  const [files, setFiles] = useState<Block[]>([])
  const [busy, setBusy] = useState(false)
  const [fileError, setFileError] = useState('')
  const [policies, setPolicies] = useState<PolicyFlags>({ reshipPolicy: false, refundPolicy: false })
  const deferred = useDeferredValue(raw)
  const stamped = new Date().toISOString()

  const blocks = useMemo(() => {
    const pasted = deferred
      .split(/\n---\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((text, index) => ({ id: `paste-${index}`, label: `Paste ${index + 1}`, text, note: 'pasted text' }))
    return [...pasted, ...files]
  }, [deferred, files])

  const rows = useMemo(
    () => blocks.map((block) => ({ block, scored: signalsForText(block.text, policies) })),
    [blocks, policies],
  )

  const average = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.scored.sourcingScore, 0) / rows.length)
    : null

  async function onFiles(list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    setFileError('')
    const next: Block[] = []
    for (const file of Array.from(list).slice(0, 8)) {
      try {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const extracted = await extractPdfText(file)
          const note = extracted.nonWsCount < SCANNED_PDF_MIN_NON_WS_CHARS
            ? 'PDF had almost no text layer. Treated as a scan, not scored as a readable COA.'
            : 'PDF text extracted in the browser. Not uploaded.'
          next.push({ id: `${file.name}-${file.size}`, label: file.name, text: extracted.text, note })
        } else {
          next.push({
            id: `${file.name}-${file.size}`,
            label: file.name,
            text: await file.text(),
            note: 'Text file read in the browser.',
          })
        }
      } catch {
        setFileError(`Could not read ${file.name}.`)
      }
    }
    setFiles((current) => [...current, ...next].slice(0, 12))
    setBusy(false)
  }

  function exportMarkdown() {
    const lines = [
      '# COA batch review',
      '',
      `Reviewed at ${stamped}.`,
      '',
      'This is a transparency reading of supplied documents. It is not a purchase recommendation and not a lab result.',
      '',
      ...rows.flatMap(({ block, scored }) => [
        `## ${block.label}`,
        '',
        `- Source note: ${block.note}`,
        `- COA checklist: ${scored.report.score.points}/${scored.report.score.max} (${scored.report.score.grade})`,
        `- Sourcing signals: ${scored.sourcingScore}/100`,
        `- Missing signals: ${scored.missing.join(', ') || 'none of the five'}`,
        `- Readable certificate: ${scored.unrecognized ? 'no' : 'yes'}`,
        '',
      ]),
      ATTRIBUTION,
    ]
    download('coa-batch.md', lines.join('\n'), 'text/markdown')
  }

  function exportCsv() {
    const csv = rowsToCsv(
      ['label', 'source_note', 'coa_points', 'coa_max', 'grade', 'sourcing_score', 'missing', 'reviewed_at'],
      rows.map(({ block, scored }) => [
        block.label,
        block.note,
        String(scored.report.score.points),
        String(scored.report.score.max),
        scored.report.score.grade,
        String(scored.sourcingScore),
        scored.missing.join('; '),
        stamped,
      ]),
    )
    download('coa-batch.csv', csv, 'text/csv')
  }

  return (
    <div className="space-y-6">
      <label className="block text-sm" htmlFor="coa-batch">
        Paste one or more COAs. Separate reports with a line that is only <span className="font-mono">---</span>.
        <textarea
          id="coa-batch"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          rows={8}
          className="mt-2 w-full rounded-xl border border-hairline bg-fill p-3 font-mono text-xs"
          placeholder="Certificate of Analysis…"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="rounded-lg border border-hairline px-3 py-1.5">
          Add PDF or text files
          <input type="file" accept=".pdf,.txt,application/pdf,text/plain" multiple className="sr-only" onChange={(event) => onFiles(event.target.files)} />
        </label>
        {busy && <span role="status">Reading files…</span>}
        {fileError && <span role="alert" className="text-rose-300">{fileError}</span>}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={policies.reshipPolicy} onChange={(event) => setPolicies((p) => ({ ...p, reshipPolicy: event.target.checked }))} />
          Reship policy is published
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={policies.refundPolicy} onChange={(event) => setPolicies((p) => ({ ...p, refundPolicy: event.target.checked }))} />
          Refund policy is published
        </label>
      </div>
      <p className="text-xs text-ink/50">Policy boxes apply to every report in this batch. A COA does not prove a shipping policy, so those points stay off until you check them.</p>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-ink/55">No reports yet.</p>
      ) : (
        <>
          <p className="text-sm text-ink/70">
            {rows.length} report{rows.length === 1 ? '' : 's'}. Mean sourcing score {average}/100. That mean is a summary of this batch, not a ranking of suppliers.
          </p>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={exportMarkdown}>Download markdown</button>
            <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={exportCsv}>Download CSV</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-fill text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-3 py-2">Report</th>
                  <th className="px-3 py-2">COA checklist</th>
                  <th className="px-3 py-2">Sourcing signals</th>
                  <th className="px-3 py-2">Missing</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ block, scored }) => (
                  <tr key={block.id} className="border-t border-hairline">
                    <td className="px-3 py-2">
                      <p className="font-medium">{block.label}</p>
                      <p className="text-xs text-ink/45">{block.note}</p>
                      {scored.unrecognized && <p className="text-xs text-amber-200">Not enough text to read as a certificate.</p>}
                    </td>
                    <td className="px-3 py-2">{scored.report.score.points}/{scored.report.score.max} · {scored.report.score.grade}</td>
                    <td className="px-3 py-2">{scored.sourcingScore}/100</td>
                    <td className="px-3 py-2 text-ink/70">{scored.missing.join(', ') || 'None of the five signals'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <MethodsPanel items={[
        { term: 'COA checklist', text: 'analyzeCoa() from the COA decoder. It grades pasted text for purity, mass spec, content, water, counterion, endotoxin, lot, and methods. It does not read a scan.' },
        { term: 'Sourcing score', text: `trustScore() with the published weights: ${TRUST_RUBRIC.map((row) => `${row.label} ${row.pts}`).join(', ')}. Independent testing is credited only when the text names a third-party lab pattern. Reship and refund are the checkboxes above.` },
        { term: 'What this is not', text: 'Not a vendor ranking, not a purity assay, and not an offer to sell.' },
      ]} />
    </div>
  )
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}
