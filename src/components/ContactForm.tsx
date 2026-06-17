'use client'

import { useId, useMemo, useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'

// Where messages land. Single inbox; the topic only shapes the subject line so
// it's easy to triage. Kept out of the visible markup so the address isn't
// scrapeable from the page.
const INBOX = 'americanpeptides@gmail.com'

type Topic = 'agent' | 'correction' | 'data' | 'partnership' | 'general'

const TOPICS: { value: Topic; label: string }[] = [
  { value: 'agent', label: 'Peptide Agent feedback' },
  { value: 'correction', label: 'Catalog correction' },
  { value: 'data', label: 'Data / API' },
  { value: 'partnership', label: 'Partnership / supplier' },
  { value: 'general', label: 'General' },
]

export default function ContactForm() {
  const [topic, setTopic] = useState<Topic>('agent')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const nameId = useId()
  const emailId = useId()
  const msgId = useId()

  const mailtoHref = useMemo(() => {
    const to = INBOX
    const label = TOPICS.find((t) => t.value === topic)?.label ?? 'Inquiry'
    const subject = `[${label}] ${name ? `from ${name}` : 'AmericanPeptide.com'}`
    const body = `${message}\n\n— ${name || 'A researcher'}${
      email ? ` (${email})` : ''
    }`
    return `mailto:${to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
  }, [topic, name, email, message])

  const canSend = email.trim() !== '' && message.trim() !== ''

  return (
    <form
      className="rounded-2xl border border-ink/[0.08] bg-ink/[0.025] p-6 md:p-8"
      onSubmit={(e) => {
        // Open the user's mail client with a prefilled message.
        if (!canSend) e.preventDefault()
      }}
      action={mailtoHref}
      method="get"
    >
      {/* Topic */}
      <fieldset className="mb-5">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
          What&apos;s this about?
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label
              key={t.value}
              className={
                'inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                (topic === t.value
                  ? 'border-[#2DD4A8]/40 bg-[#2DD4A8]/15 text-accent'
                  : 'border-ink/[0.08] bg-ink/[0.02] text-ink/55 hover:border-ink/15 hover:text-ink')
              }
            >
              <input
                type="radio"
                name="topic"
                value={t.value}
                checked={topic === t.value}
                onChange={() => setTopic(t.value)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={nameId}
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40"
          >
            Name
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Ada Lovelace"
            className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-[#2DD4A8]/40 focus:outline-none focus:ring-1 focus:ring-[#2DD4A8]/40"
          />
        </div>
        <div>
          <label
            htmlFor={emailId}
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lab.org"
              className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-[#2DD4A8]/40 focus:outline-none focus:ring-1 focus:ring-[#2DD4A8]/40"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={msgId}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40"
        >
          Message
        </label>
        <textarea
          id={msgId}
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what the Agent got wrong, the peptide we're missing, or what you'd like to build with the data…"
          className="w-full resize-y rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-[#2DD4A8]/40 focus:outline-none focus:ring-1 focus:ring-[#2DD4A8]/40"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-ink/35">
          Opens in your mail app — nothing is stored on a server, and your note
          reaches the team directly.
        </p>
        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send message
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
