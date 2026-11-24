'use client'

import { useState, useRef, useEffect, useCallback, useReducer } from 'react'
import { Send, Dna, SquarePen } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import ProfilePanel from '@/components/ProfilePanel'
import {
  PENDING_QUESTION_KEY,
  agentAccessReducer,
  canAsk,
  canStartCheckout,
  initialAgentAccess,
  parseChatReplyMeta,
} from '@/lib/pass-flow'
import { fetchPassSummary, requestCheckoutUrl } from '@/lib/pass-client'
import { getWatchlist } from '@/lib/workspace'
import { ensureResearchAck } from '@/lib/research-ack'

type Role = 'user' | 'assistant'

interface Message {
  role: Role
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content: `Welcome to the **Peptide Agent** from AmericanPeptide.com.

I'm your AI assistant for peptide research. I can help you:

- **Design peptide sequences** — optimize for binding affinity, stability, and permeability
- **Analyze clinical trials** — search and interpret data from ClinicalTrials.gov
- **Synthesize literature** — rapid review across PubMed, bioRxiv, and patents
- **Explore targets** — protein biology, mechanisms, and therapeutic relevance

What would you like to research today?`,
}

function freeSearchWord(n: number): string {
  return n === 1 ? 'search' : 'searches'
}

// Curated starter prompts for the empty landing. Kept to six so the hero,
// prompts, and input all fit above the fold on a laptop without scrolling;
// a blend of high-intent consumer questions and sourcing/credibility ones.
const LANDING_PROMPTS = [
  'Best peptide for tanning',
  'Best peptide for skin anti-aging',
  'GHK-Cu for hair growth',
  'BPC-157 vs TB-500 for healing',
  'How is a research peptide actually made?',
  'What makes American synthesis different?',
]

const SOURCES = ['PubMed', 'PubChem', 'ClinicalTrials.gov', 'UniProt']

const md: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic text-ink/80">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-bold text-ink first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold text-ink first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-ink/90 first:mt-0">{children}</h3>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-hairline bg-surface p-4 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className)
    if (isBlock) {
      return (
        <code className="font-mono text-xs text-accent/90 leading-relaxed">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-fill-strong px-1.5 py-0.5 font-mono text-xs text-accent">
        {children}
      </code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-accent/30 pl-4 text-ink/55 last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto rounded-lg border border-hairline last:mb-0">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-hairline bg-fill-strong px-4 py-2.5 text-left font-semibold text-ink/80">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-hairline px-4 py-2.5 text-ink/55 last:border-b-0">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-hairline" />,
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 140, 280].map((delay) => (
        <div
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-accent/50"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

function AgentAvatar() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-accent/15">
      <Dna className="h-4 w-4 text-accent" strokeWidth={1.75} />
    </div>
  )
}

export default function ResearchPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Live grounding-progress label while the agent works (e.g. "Searching
  // PubMed…"), streamed from the server before the answer begins.
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  // Free allowance / Research Pass / checkout, as one explicit state machine
  // (src/lib/pass-flow.ts). The server is the authority; this mirrors its reports.
  const [agent, dispatch] = useReducer(agentAccessReducer, initialAgentAccess)
  const { access, offer, checkout } = agent
  const limitReached = !canAsk(agent)
  const checkingOut = checkout.status === 'starting'
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Session page context, set once from the ?ctx=kind:slug deep-link param
  // (e.g. a compound page hands off "compound:semaglutide"). Sent with every
  // request so bare follow-ups resolve to the compound the user came from.
  const pageCtx = useRef<{ kind: string; slug: string } | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading || limitReached) return

      // Research-use acknowledgment, raised lazily at the first AI action for
      // viewers who haven't acknowledged yet. Returning/acked users pass through.
      if (!(await ensureResearchAck())) return

      const userMsg: Message = { role: 'user', content: trimmed }
      const next = [...messages, userMsg]

      setMessages(next)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      setLoading(true)

      // The welcome message is UI-only — API conversation starts at first user message
      const firstUser = next.findIndex((m) => m.role === 'user')
      const apiMessages = next.slice(firstUser)

      // Assemble per-request context: page (from the deep-link param) + an
      // optional reader profile from localStorage (forward-compatible with a
      // future settings UI). The server re-validates every field.
      const context: { page?: { kind: string; slug: string }; profile?: Record<string, unknown> } = {}
      if (pageCtx.current) context.page = pageCtx.current
      try {
        const profile: Record<string, unknown> = {}
        const raw = localStorage.getItem('ap_profile')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') Object.assign(profile, parsed)
        }
        const watched = getWatchlist()
        if (watched.length) {
          const existing = Array.isArray(profile.compounds) ? profile.compounds : []
          profile.compounds = [...existing, ...watched]
        }
        if (Object.keys(profile).length) context.profile = profile
      } catch {
        // malformed/absent profile — send without it
      }
      const hasContext = Object.keys(context).length > 0

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, stream: true, ...(hasContext ? { context } : {}) }),
        })

        const contentType = res.headers.get('content-type') ?? ''

        // Non-streaming reply: HTTP 402 (free allowance spent) or a pre-flight
        // error (403/429/400/413/500). Handled exactly as before.
        if (!contentType.includes('text/event-stream')) {
          const data = await res.json().catch(() => ({}) as Record<string, unknown>)
          dispatch({ type: 'reply_received', reply: parseChatReplyMeta(res.status, data) })
          if (res.status === 402) {
            setMessages(messages)
            setInput(trimmed)
            sessionStorage.setItem(PENDING_QUESTION_KEY, trimmed)
            return
          }
          sessionStorage.removeItem(PENDING_QUESTION_KEY)
          if (!res.ok || typeof data.content !== 'string') {
            throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
          }
          setMessages((prev) => [...prev, { role: 'assistant', content: data.content as string }])
          return
        }

        // Streaming reply (SSE). `tool` events drive the live progress label,
        // `delta` events carry the already-sanitized answer in render-safe
        // blocks, and the final `done` event carries the access metadata (or a
        // terminal error in place of an answer).
        sessionStorage.removeItem(PENDING_QUESTION_KEY)
        if (!res.body) throw new Error('Request failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let assistantText = ''
        let started = false
        let streamError: string | null = null

        const appendBlock = (text: string) => {
          assistantText = assistantText ? `${assistantText}\n\n${text}` : text
          if (!started) {
            started = true
            setToolStatus(null)
            setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }])
          } else {
            setMessages((prev) => {
              const copy = prev.slice()
              copy[copy.length - 1] = { role: 'assistant', content: assistantText }
              return copy
            })
          }
        }

        const handleEvent = (raw: unknown) => {
          if (!raw || typeof raw !== 'object') return
          const e = raw as { t?: string; label?: unknown; text?: unknown; content?: unknown; error?: unknown }
          if (e.t === 'tool' && typeof e.label === 'string') {
            if (!started) setToolStatus(e.label)
          } else if (e.t === 'delta' && typeof e.text === 'string') {
            appendBlock(e.text)
          } else if (e.t === 'done') {
            dispatch({ type: 'reply_received', reply: parseChatReplyMeta(200, e) })
            if (!started && typeof e.error === 'string') {
              streamError = e.error
            } else if (!started && typeof e.content === 'string' && e.content) {
              // No deltas arrived but the server composed content — render it.
              appendBlock(e.content)
            }
          }
        }

        // SSE frames are blank-line separated; each `data:` line is one JSON event.
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let sep: number
          while ((sep = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, sep)
            buffer = buffer.slice(sep + 2)
            for (const line of frame.split('\n')) {
              const m = /^data:\s?(.*)$/.exec(line)
              if (!m) continue
              try {
                handleEvent(JSON.parse(m[1]))
              } catch {
                // ignore a malformed frame
              }
            }
          }
        }

        if (!started) {
          throw new Error(streamError ?? 'Something went wrong. Please try again.')
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**Error:** ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
          },
        ])
      } finally {
        setToolStatus(null)
        setLoading(false)
      }
    },
    [messages, loading, limitReached],
  )

  // Deep link: /research?q=... auto-asks the question once on load, so prompt
  // hand-offs (e.g. the research-areas Agent box) land mid-conversation.
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const params = new URLSearchParams(window.location.search)

    // ?ctx=kind:slug — capture page context before the first question fires.
    const KINDS = ['compound', 'research-area', 'comparison']
    const ctxParam = params.get('ctx')
    if (ctxParam) {
      const i = ctxParam.indexOf(':')
      if (i > 0) {
        const kind = ctxParam.slice(0, i)
        const slug = ctxParam.slice(i + 1)
        if (KINDS.includes(kind) && slug) pageCtx.current = { kind, slug }
      }
    }

    const pending = sessionStorage.getItem(PENDING_QUESTION_KEY)
    if (params.get('resume') === '1' && pending?.trim()) {
      sessionStorage.removeItem(PENDING_QUESTION_KEY)
      sendMessage(pending.trim())
      return
    }
    if (pending?.trim()) setInput(pending.trim())

    const q = params.get('q')
    if (q && q.trim()) {
      // Each ask is a paid model run, so only a real visitor's browser auto-asks.
      // An automated/headless client that renders this page gets the question
      // prefilled instead (the server refuses crawlers as well).
      const automated =
        navigator.webdriver || /bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent)
      if (automated) setInput(q)
      else sendMessage(q)
    }
  }, [sendMessage])

  // Load pass status + the remaining free daily searches for the counter.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      // The counter is informational — the server enforces the limit regardless.
      const summary = await fetchPassSummary()
      if (summary && !cancelled) dispatch({ type: 'summary_loaded', summary })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const startCheckout = async () => {
    if (!canStartCheckout(agent)) return
    const pending = input.trim()
    if (pending) sessionStorage.setItem(PENDING_QUESTION_KEY, pending)
    dispatch({ type: 'checkout_started' })
    const result = await requestCheckoutUrl()
    if (result.ok) window.location.assign(result.url)
    else dispatch({ type: 'checkout_failed', error: result.error })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  // Landing state: nothing asked yet. Show a conversion-focused hero (value
  // prop + trust signals + guided prompts) instead of a bare chat bubble.
  const isLanding = messages.length === 1 && !loading

  const freeHint =
    access.status === 'pass'
      ? 'Research Pass active — no daily limit'
      : access.status === 'free'
        ? `${access.remaining} of ${access.limit} free ${freeSearchWord(access.limit)} left today · no sign-up`
        : 'Free to try — no sign-up required'

  // The out-of-free-searches offer. Reused by whichever composer is mounted
  // (only one is at a time), so the same element reference is safe.
  const accessOffer =
    access.status === 'exhausted' ? (
      <div
        role="status"
        className="mb-3 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-4 text-sm text-ink/75"
      >
        <p className="font-medium text-ink/95">
          You&rsquo;ve used today&rsquo;s {access.limit} free {freeSearchWord(access.limit)}.
        </p>
        {offer?.available ? (
          <>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              A Research Pass is {offer.price} once, for {offer.days} days, with no daily limit.
              {input.trim() ? ' Your question is saved and continues after checkout.' : ''}
            </p>
            <button
              type="button"
              onClick={startCheckout}
              disabled={checkingOut}
              className="mt-3 rounded-xl bg-[#7EE0B5] px-4 py-2.5 text-sm font-medium text-[#0E1512] transition-colors hover:bg-[#A6F0CC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkingOut ? 'Opening secure checkout…' : `Continue to checkout — ${offer.price}`}
            </button>
            {checkout.status === 'failed' && (
              <p role="alert" className="mt-2 text-xs text-red-400">{checkout.error}</p>
            )}
          </>
        ) : (
          <p className="mt-1 text-xs text-ink/55">Free searches reset at 00:00 UTC.</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink/45">
          <Link href="/research/pass" className="text-accent underline-offset-2 hover:underline">
            Have an access code?
          </Link>
          {offer?.available ? ' Free searches reset at 00:00 UTC.' : ''} The{' '}
          <Link href="/catalog" className="underline-offset-2 hover:underline">catalog</Link>
          {' '}and{' '}
          <Link href="/trials" className="underline-offset-2 hover:underline">trials</Link>
          {' '}stay open.
        </p>
      </div>
    ) : null

  // One composer, two placements: a prominent `hero` variant that anchors the
  // empty landing as its primary CTA, and the `docked` bar once a conversation
  // is underway. Only one is mounted at a time, so the shared textareaRef is
  // unambiguous.
  const renderComposer = (variant: 'hero' | 'docked') => {
    const hero = variant === 'hero'
    return (
      <>
        {accessOffer}
        <div
          className={`flex items-end gap-3 rounded-2xl border border-hairline bg-fill px-4 transition-colors focus-within:border-accent/25 ${
            hero ? 'py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : 'py-3'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={
              hero
                ? 'Ask about a peptide, a mechanism, or a clinical trial…'
                : 'Ask about peptide sequences, clinical trials, or literature…'
            }
            rows={hero ? 2 : 1}
            disabled={loading}
            className={`flex-1 resize-none bg-transparent text-ink placeholder-ink/20 outline-none disabled:opacity-50 ${
              hero ? 'text-base' : 'text-sm'
            }`}
            style={{ maxHeight: '160px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || limitReached}
            aria-label="Send message"
            className={`flex flex-shrink-0 items-center justify-center rounded-xl bg-[#7EE0B5] text-[#0E1512] transition-all hover:bg-[#A6F0CC] hover:shadow-[0_0_20px_rgba(126,224,181,0.3)] disabled:cursor-not-allowed disabled:opacity-25 ${
              hero ? 'h-9 w-9' : 'h-8 w-8'
            }`}
          >
            <Send className={hero ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-ink/20">
          {!hero && access.status === 'pass' && (
            <span className="text-ink/45">Research Pass active — no daily limit ·{' '}</span>
          )}
          {!hero && access.status === 'free' && (
            <span className="text-ink/45">
              {access.remaining} of {access.limit} free {freeSearchWord(access.limit)} left today
              {access.remaining <= 1 && offer?.available ? (
                <>
                  {' · '}
                  <Link href="/research/pass" className="text-accent underline-offset-2 hover:underline">
                    Research Pass {offer.price}
                  </Link>
                </>
              ) : null}
              {' · '}
            </span>
          )}
          Shift + Enter for new line · AI outputs are computational hypotheses requiring experimental validation
        </p>
      </>
    )
  }

  return (
    <div className="flex h-[calc(100svh-var(--app-header-h,3.8125rem))] flex-col bg-surface text-ink">

      {/* ── Page identity ── On the landing the hero and the site nav already
          identify the agent, so the in-app bar is suppressed to avoid a third
          redundant "Peptide Agent" and to give the hero the full viewport. */}
      {!isLanding && (
        <header className="flex flex-shrink-0 items-center justify-between border-b border-hairline px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <AgentAvatar />
            <span className="text-sm font-medium">Peptide Agent</span>
          </div>

          <div className="flex items-center gap-1">
            <ProfilePanel />
            <button
              onClick={() => {
                setMessages([WELCOME])
                setInput('')
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-ink/55 transition-colors hover:bg-fill-strong hover:text-ink"
            >
              <SquarePen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto">
        {isLanding ? (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-4 py-6 md:px-6">
            {/* Hero — value proposition */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
                <Dna className="h-6 w-6 text-accent" strokeWidth={1.75} />
              </div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-accent/80">
                Peptide Agent
              </p>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Ask anything about research peptides
              </h1>
              <p className="mx-auto mt-2.5 max-w-xl text-pretty text-sm leading-relaxed text-ink/55">
                Citation-backed answers on mechanisms, synthesis, clinical evidence, and compound
                profiles — grounded in primary sources, not guesswork.
              </p>

              {/* Trust row — the primary sources behind every answer */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[11px] text-ink/45">
                <span className="text-ink/35">Grounded in</span>
                {SOURCES.map((src) => (
                  <span
                    key={src}
                    className="rounded-full border border-hairline bg-fill px-2.5 py-1 font-medium text-ink/60"
                  >
                    {src}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs text-ink/40">{freeHint}</p>
            </div>

            {/* Primary CTA — the input leads on the landing. */}
            <div className="mb-5">{renderComposer('hero')}</div>

            {/* Guided prompts — one compact grid so hero + input + prompts
                stay above the fold without scrolling. */}
            <div>
              <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-ink/35">
                Try asking
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {LANDING_PROMPTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-hairline bg-fill px-3.5 py-2.5 text-left text-sm text-ink/70 transition-all hover:border-accent/25 hover:bg-fill-strong hover:text-ink"
                  >
                    <span>{s}</span>
                    <Send className="h-3 w-3 flex-shrink-0 text-ink/20 transition-colors group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-5 flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-0.5">
                  <AgentAvatar />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-accent/[0.12] text-ink/90'
                    : 'rounded-tl-sm border border-hairline bg-fill text-ink/65'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator — shown until the answer starts streaming in. While
              the agent grounds the answer, it names the source being queried. */}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="mb-5 flex gap-3">
              <div className="mt-0.5">
                <AgentAvatar />
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-hairline bg-fill px-4 py-3">
                <TypingIndicator />
                {toolStatus && (
                  <span className="text-xs text-ink/50" aria-live="polite">
                    {toolStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
        )}
      </main>

      {/* ── Input bar ── docked once a conversation is underway; on the empty
          landing the composer leads inside the hero instead. */}
      {!isLanding && (
        <div className="flex-shrink-0 border-t border-hairline px-4 py-4 md:px-6">
          <div className="mx-auto max-w-3xl">{renderComposer('docked')}</div>
        </div>
      )}
    </div>
  )
}
