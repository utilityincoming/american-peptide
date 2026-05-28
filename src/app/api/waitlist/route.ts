import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const VALID_ROLES = ['researcher', 'supplier'] as const
type Role = (typeof VALID_ROLES)[number]

const RESEND_API = 'https://api.resend.com'

interface Payload {
  email?: unknown
  role?: unknown
  source?: unknown
  hp?: unknown // honeypot — must be empty
}

interface WaitlistRecord {
  email: string
  role: Role
  source: string
  ip: string | null
  userAgent: string | null
  receivedAt: string
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function clamp(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

// ─── Resend delivery (best-effort) ──────────────────────────────────────────
//
// Configured entirely via env so it degrades gracefully:
//   RESEND_API_KEY              required to enable real delivery
//   RESEND_AUDIENCE_ID          default audience for signups
//   RESEND_AUDIENCE_SUPPLIER_ID optional; supplier signups go here if set
//   RESEND_FROM                 e.g. "AmericanPeptide <waitlist@americanpeptide.com>"
//                               (domain must be verified in Resend) — enables
//                               the confirmation email
//   WAITLIST_NOTIFY             optional internal address to receive a
//                               full-detail notification per signup
//
// Resend audience contacts only carry email/name, so role + source are
// preserved via the internal notification email and the structured log.

async function resendFetch(
  apiKey: string,
  path: string,
  body: unknown,
): Promise<boolean> {
  try {
    const res = await fetch(`${RESEND_API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[waitlist] resend ${path} -> ${res.status} ${detail}`)
      return false
    }
    return true
  } catch (err) {
    console.error(`[waitlist] resend ${path} threw`, err)
    return false
  }
}

function confirmationHtml(role: Role): string {
  const lead =
    role === 'supplier'
      ? 'Thanks for your interest in listing on the AmericanPeptide marketplace.'
      : 'Thanks for joining the AmericanPeptide marketplace waitlist.'
  const next =
    role === 'supplier'
      ? "We'll reach out about supplier onboarding — identity, COA, and pricing setup — as we open listings."
      : "We'll email you the moment vetted suppliers and transparent pricing go live. No other mail."
  return `<!doctype html><html><body style="margin:0;background:#0B1220;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6edf3;padding:32px">
  <div style="max-width:480px;margin:0 auto">
    <h1 style="font-size:18px;margin:0 0 12px;color:#2DD4A8">AmericanPeptide.com</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px">${lead}</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#9fb0c0">${next}</p>
    <p style="font-size:12px;line-height:1.6;color:#5b6b7c;margin:0">Research-use platform. Not medical advice. Reply to unsubscribe.</p>
  </div></body></html>`
}

async function deliver(record: WaitlistRecord): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev / unconfigured: structured log is the storage of record.
    console.log('[waitlist:stub]', JSON.stringify(record))
    return
  }

  const supplierAudience = process.env.RESEND_AUDIENCE_SUPPLIER_ID
  const defaultAudience = process.env.RESEND_AUDIENCE_ID
  const audienceId =
    record.role === 'supplier' && supplierAudience
      ? supplierAudience
      : defaultAudience

  // 1) Add to audience for future broadcasts.
  if (audienceId) {
    await resendFetch(apiKey, `/audiences/${audienceId}/contacts`, {
      email: record.email,
      unsubscribed: false,
    })
  } else {
    console.warn('[waitlist] RESEND_AUDIENCE_ID not set — skipping audience add')
  }

  const from = process.env.RESEND_FROM

  // 2) Confirmation email to the signer (needs a verified from domain).
  if (from) {
    await resendFetch(apiKey, '/emails', {
      from,
      to: [record.email],
      subject:
        record.role === 'supplier'
          ? 'Your AmericanPeptide supplier request'
          : "You're on the AmericanPeptide waitlist",
      html: confirmationHtml(record.role),
    })
  }

  // 3) Internal notification preserves role + source (audience can't).
  const notify = process.env.WAITLIST_NOTIFY
  if (from && notify) {
    await resendFetch(apiKey, '/emails', {
      from,
      to: [notify],
      subject: `New waitlist signup (${record.role}) — ${record.source}`,
      html: `<pre style="font-family:monospace;font-size:13px">${JSON.stringify(
        record,
        null,
        2,
      )}</pre>`,
    })
  }

  // Always keep the structured log as a safety net.
  console.log('[waitlist]', JSON.stringify(record))
}

export async function POST(req: NextRequest) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return bad('Invalid JSON body')
  }

  // Spam trap — real users never fill this hidden field.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    // Silently succeed for bots so they don't retry.
    return NextResponse.json({ ok: true })
  }

  const email = clamp(body.email, 254).toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return bad('Please enter a valid email address')
  }

  const roleRaw = clamp(body.role, 32).toLowerCase()
  if (!VALID_ROLES.includes(roleRaw as Role)) {
    return bad('Please select a valid role')
  }
  const role = roleRaw as Role

  const source = clamp(body.source, 128) || 'unknown'

  const record: WaitlistRecord = {
    email,
    role,
    source,
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null,
    userAgent: req.headers.get('user-agent'),
    receivedAt: new Date().toISOString(),
  }

  // Best-effort delivery — never punish the user for a backend hiccup; the
  // structured log captures every signup as a fallback.
  await deliver(record)

  return NextResponse.json({
    ok: true,
    message:
      role === 'supplier'
        ? "Thanks — we'll reach out about supplier onboarding."
        : "You're on the list. We'll email when the marketplace opens.",
  })
}
