import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const VALID_ROLES = ['researcher', 'supplier'] as const
type Role = (typeof VALID_ROLES)[number]

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

  // Stub storage: structured log so a real backend (Resend / Loops / DB)
  // can be wired in by replacing this single block.
  console.log('[waitlist]', JSON.stringify(record))

  return NextResponse.json({
    ok: true,
    message:
      role === 'supplier'
        ? "Thanks — we'll reach out about supplier onboarding."
        : "You're on the list. We'll email when the marketplace opens.",
  })
}
