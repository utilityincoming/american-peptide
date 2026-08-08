'use client'

import { useId, useState } from 'react'
import { ArrowRight, Check, CircleAlert, Loader2, Mail } from 'lucide-react'

type Role = 'researcher' | 'supplier'
type Status = 'idle' | 'submitting' | 'success' | 'error'

interface WaitlistResponse {
  ok: boolean
  message?: string
  error?: string
}

interface WaitlistFormProps {
  /** Where this form is mounted — e.g. "catalog-hero", "category:metabolic", "home". Sent to the server so signups are attributable. */
  source: string
  /** Section heading. */
  heading?: string
  /** Body copy below the heading. */
  description?: string
  /** Compact = single-row inline; full = stacked, more breathing room. */
  variant?: 'compact' | 'full'
  /** Override the default role; otherwise user picks. */
  defaultRole?: Role
}

export default function WaitlistForm({
  source,
  heading = 'Get notified when the marketplace opens',
  description = 'Transparent per-mg pricing, third-party COAs, and vetted suppliers. We email once the first listings are live — no other mail.',
  variant = 'full',
  defaultRole = 'researcher',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>(defaultRole)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string>('')
  const emailId = useId()
  const hpId = useId()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const hp = (formData.get('hp') as string) ?? ''

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, role, source, hp }),
      })
      const data = (await res.json()) as WaitlistResponse
      if (!res.ok || !data.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setMessage(data.message ?? "You're on the list.")
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        className={
          'rounded-2xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.06] ' +
          (variant === 'compact' ? 'px-5 py-4' : 'px-6 py-6')
        }
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2DD4A8]/15">
            <Check className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Thanks — you&apos;re in.
            </p>
            <p className="mt-1 text-sm text-ink/65">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  const isFull = variant === 'full'

  return (
    <form
      onSubmit={onSubmit}
      className={
        'rounded-2xl border border-ink/[0.08] bg-ink/[0.025] ' +
        (isFull ? 'px-6 py-6 md:px-8 md:py-7' : 'px-5 py-5')
      }
      noValidate
    >
      {heading && (
        <h3
          className={
            isFull
              ? 'mb-1.5 text-lg font-semibold text-ink md:text-xl'
              : 'mb-1 text-base font-semibold text-ink'
          }
        >
          {heading}
        </h3>
      )}
      {description && (
        <p
          className={
            isFull
              ? 'mb-5 max-w-xl text-sm leading-relaxed text-ink/55 md:text-[15px]'
              : 'mb-4 text-xs leading-relaxed text-ink/55'
          }
        >
          {description}
        </p>
      )}

      {/* Honeypot — visually hidden, kept out of the tab order. */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={hpId}>Leave this field empty</label>
        <input
          id={hpId}
          name="hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset
        className="mb-4 flex flex-wrap gap-2"
        aria-label="I am a…"
        disabled={status === 'submitting'}
      >
        <legend className="mb-1.5 w-full text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
          I am a…
        </legend>
        <RoleChip
          name="role"
          value="researcher"
          active={role === 'researcher'}
          onChange={() => setRole('researcher')}
        >
          Researcher
        </RoleChip>
        <RoleChip
          name="role"
          value="supplier"
          active={role === 'supplier'}
          onChange={() => setRole('supplier')}
        >
          Supplier
        </RoleChip>
      </fieldset>

      <label htmlFor={emailId} className="sr-only">
        Email address
      </label>
      <div
        className={
          isFull
            ? 'flex flex-col gap-2 sm:flex-row'
            : 'flex flex-col gap-2 sm:flex-row'
        }
      >
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="you@lab.org"
            disabled={status === 'submitting'}
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? `${emailId}-err` : undefined}
            className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-[#2DD4A8]/40 focus:outline-none focus:ring-1 focus:ring-[#2DD4A8]/40 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting' || !email}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              {role === 'supplier' ? 'Request access' : 'Join waitlist'}
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {status === 'error' && (
        <p
          id={`${emailId}-err`}
          className="mt-3 flex items-center gap-1.5 text-xs text-amber-400/80"
          role="alert"
        >
          <CircleAlert className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <p className="mt-3 text-[11px] text-ink/35">
        No spam. One email when the marketplace opens. Unsubscribe anytime.
      </p>
    </form>
  )
}

function RoleChip({
  name,
  value,
  active,
  onChange,
  children,
}: {
  name: string
  value: string
  active: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
        (active
          ? 'border-[#2DD4A8]/40 bg-[#2DD4A8]/15 text-accent'
          : 'border-ink/[0.08] bg-ink/[0.02] text-ink/55 hover:border-ink/15 hover:text-ink')
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={active}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  )
}
