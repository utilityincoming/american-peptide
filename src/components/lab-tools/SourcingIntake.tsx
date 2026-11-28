'use client'

import { useMemo, useState } from 'react'
import { signalsFromFlags } from '@/lib/lab-tools/signals'
import { DEFAULT_CONTACT_EMAIL } from '@/lib/contact'
import { ATTRIBUTION } from '@/lib/research-workspace/sequence'
import MethodsPanel from '@/components/research-workspace/MethodsPanel'
import { TRUST_RUBRIC, type VendorTrust } from '@/lib/vendors'

const QUEUE = 'amp-sourcing-intake-queue'

const EMPTY: VendorTrust = {
  coaOnFile: false,
  thirdPartyTested: false,
  perBatchTesting: false,
  reshipPolicy: false,
  refundPolicy: false,
}

export default function SourcingIntake() {
  const [trust, setTrust] = useState<VendorTrust>(EMPTY)
  const [coaUrl, setCoaUrl] = useState('')
  const [lotExample, setLotExample] = useState('')
  const [policyUrl, setPolicyUrl] = useState('')
  const [labNote, setLabNote] = useState('')
  const [saved, setSaved] = useState('')

  const preview = useMemo(() => signalsFromFlags(trust), [trust])
  const stamped = new Date().toISOString()

  function checklist() {
    return [
      '# Sourcing standard checklist',
      '',
      `Prepared ${stamped}. This preview uses the published point weights. A submission is for review. The site does not sell placement, and this preview is not the published score.`,
      '',
      ...TRUST_RUBRIC.map((row) => `- [${trust[row.key] ? 'x' : ' '}] ${row.label} (${row.pts}) — ${row.body}`),
      '',
      `- COA link or note: ${coaUrl || 'not provided'}`,
      `- Lot-matching example: ${lotExample || 'not provided'}`,
      `- Policy URL: ${policyUrl || 'not provided'}`,
      `- Lab / accreditation note: ${labNote || 'not provided'}`,
      '',
      `Preview total: ${preview.score}/100.`,
      preview.missing.length ? `Not claimed: ${preview.missing.join(', ')}.` : 'All five signals claimed.',
      '',
      ATTRIBUTION,
    ].join('\n')
  }

  function downloadChecklist() {
    const blob = new Blob([checklist()], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sourcing-checklist.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function queueLocally() {
    const item = { stamped, trust, coaUrl, lotExample, policyUrl, labNote, preview: preview.score }
    try {
      const current = JSON.parse(localStorage.getItem(QUEUE) || '[]')
      const next = [item, ...(Array.isArray(current) ? current : [])].slice(0, 20)
      localStorage.setItem(QUEUE, JSON.stringify(next))
      setSaved('Saved in this browser. Nothing was sent.')
    } catch {
      setSaved('This browser blocked local storage.')
    }
  }

  const mail = `mailto:${DEFAULT_CONTACT_EMAIL}?subject=${encodeURIComponent('Sourcing evidence for review')}&body=${encodeURIComponent(checklist())}`

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-ink/70">
        Claim only signals you can point to. Scoring on the public vendor pages stays independent of this form. The site does not sell a higher score or a placement.
      </p>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Published signals</legend>
        {TRUST_RUBRIC.map((row) => (
          <label key={row.key} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={trust[row.key]}
              onChange={(event) => setTrust((current) => ({ ...current, [row.key]: event.target.checked }))}
            />
            <span>
              <span className="font-medium">{row.label}</span> · {row.pts} points
              <span className="block text-xs text-ink/50">{row.body}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">COA link or short text
          <input value={coaUrl} onChange={(event) => setCoaUrl(event.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-fill px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">Lot-matching example
          <input value={lotExample} onChange={(event) => setLotExample(event.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-fill px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">Policy URL
          <input value={policyUrl} onChange={(event) => setPolicyUrl(event.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-fill px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">Lab name and accreditation note
          <input value={labNote} onChange={(event) => setLabNote(event.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-fill px-3 py-2 text-sm" />
        </label>
      </div>
      <p className="rounded-xl border border-hairline bg-fill p-4 text-sm">
        Preview against the public standard: <span className="font-mono">{preview.score}/100</span>.
        {preview.missing.length > 0 ? ` Not claimed: ${preview.missing.join(', ')}.` : ' All five signals are claimed.'}
        {' '}This number is a preview of the form, not a published vendor score.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-[#7EE0B5] px-3 py-1.5 text-sm font-semibold text-[#0E1512]" onClick={downloadChecklist}>Download checklist</button>
        <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={queueLocally}>Keep a local copy</button>
        <a className="rounded-lg border border-hairline px-3 py-1.5 text-sm" href={mail}>Email the checklist</a>
      </div>
      {saved && <p role="status" className="text-sm text-accent">{saved}</p>}
      <MethodsPanel items={[
        { term: 'Score', text: 'The preview calls trustScore() with the five checkboxes. Links and notes are stored with the checklist. They do not add points by themselves.' },
        { term: 'Delivery', text: 'Download, a local queue of up to 20 drafts, or a mailto draft. There is no submission database on this page.' },
      ]} />
    </div>
  )
}
