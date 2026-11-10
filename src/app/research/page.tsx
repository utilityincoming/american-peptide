'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Dna, SquarePen } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import ProfilePanel from '@/components/ProfilePanel'

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

const SUGGESTIONS = [
  'Best peptide for tanning',
  'Best peptide for skin anti-aging',
  'GHK-Cu for hair growth',
  'BPC-157 vs TB-500 for healing',
  'How is a research peptide actually made?',
  'Why are pure peptides so expensive to make?',
  'How to read a peptide COA',
  'What makes American synthesis different?',
]

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
  // Free daily allowance, as reported by the server (null until known / when off).
  const [quota, setQuota] = useState<{ limit: number; remaining: number } | null>(null)
  // Paid Research Pass (no weekly limit) and the offer shown when the limit is hit.
  const [pass, setPass] = useState<{ expiresAt: string } | null>(null)
  const [offer, setOffer] = useState<{ available: boolean; price: string; days: number } | null>(null)
  const [limitReached, setLimitReached] = useState(false)
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
      const context: { page?: { kind: string; slug: string }; profile?: unknown } = {}
      if (pageCtx.current) context.page = pageCtx.current
      try {
        const raw = localStorage.getItem('ap_profile')
        if (raw) {
          const profile = JSON.parse(raw)
          if (profile && typeof profile === 'object') context.profile = profile
        }
      } catch {
        // malformed/absent profile — send without it
      }
      const hasContext = Object.keys(context).length > 0

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, ...(hasContext ? { context } : {}) }),
        })

        const data = await res.json()
        if (data.quota && typeof data.quota.remaining === 'number') {
          setQuota({ limit: data.quota.limit, remaining: data.quota.remaining })
        }
        if (data.offer) setOffer(data.offer)
        if (res.status === 402) {
          // Out of free questions: put the unsent question back in the box and
          // show the limit notice instead of an error bubble.
          setMessages(messages)
          setInput(trimmed)
          setLimitReached(true)
          return
        }
        if (!res.ok) throw new Error(data.error || 'Request failed')

        setMessages((prev) => [...prev, { role: 'assistant', content: data.content }])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**Error:** ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
          },
        ])
      } finally {
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

  // Load pass status + the remaining free weekly searches for the counter.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/pass')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.offer) setOffer(data.offer)
        if (data.pass) {
          setPass(data.pass)
          return
        }
        if (data.enabled && typeof data.remaining === 'number') {
          setQuota({ limit: data.limit, remaining: data.remaining })
          if (data.remaining <= 0) setLimitReached(true)
        }
      } catch {
        // counter is informational — the server enforces the limit regardless
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

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

  const showSuggestions = messages.length === 1 && !loading

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">

      {/* ── Page identity ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-hairline px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <AgentAvatar />
          <div>
            <span className="text-sm font-medium">Peptide Agent</span>
            <span className="ml-2 hidden text-xs text-ink/55 sm:inline">
              ap-research-1
            </span>
          </div>
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

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto">
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

          {/* Suggested prompts — shown on first load only */}
          {showSuggestions && (
            <div className="mb-5 ml-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-hairline bg-fill p-3 text-left text-xs text-ink/55 transition-all hover:border-accent/20 hover:bg-fill-strong hover:text-ink/70"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="mb-5 flex gap-3">
              <div className="mt-0.5">
                <AgentAvatar />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-hairline bg-fill px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-hairline px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          {limitReached && (
            <div
              role="status"
              className="mb-3 rounded-2xl border border-accent/20 bg-accent/[0.06] px-4 py-3 text-sm text-ink/70"
            >
              <p className="font-medium text-ink/90">
                You&rsquo;ve used this week&rsquo;s {quota?.limit ?? 5} free Peptide Agent searches.
              </p>
              {offer?.available && (
                <p className="mt-2">
                  <Link
                    href="/research/pass"
                    className="inline-block rounded-xl bg-[#5BA88C] px-4 py-2 text-xs font-medium text-[#0E1512] transition-colors hover:bg-[#6FBF9A]"
                  >
                    Get unlimited searches — {offer.price} for {offer.days} days
                  </Link>
                </p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-ink/55">
                Every answer runs live lookups against PubChem, ClinicalTrials.gov, PubMed and UniProt, which is
                what a Research Pass pays for. Your free searches reset Monday 00:00 UTC.{' '}
                <Link href="/research/pass" className="text-accent underline-offset-2 hover:underline">
                  Have an access code?
                </Link>{' '}
                In the meantime the{' '}
                <Link href="/catalog" className="text-accent underline-offset-2 hover:underline">catalog</Link>,{' '}
                <Link href="/research-areas" className="text-accent underline-offset-2 hover:underline">research-area guides</Link>{' '}
                and{' '}
                <Link href="/trials" className="text-accent underline-offset-2 hover:underline">clinical trials dashboard</Link>{' '}
                are open without limit.
              </p>
            </div>
          )}
          <div className="flex items-end gap-3 rounded-2xl border border-hairline bg-fill px-4 py-3 transition-colors focus-within:border-accent/25">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about peptide sequences, clinical trials, or literature…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-ink placeholder-ink/20 outline-none disabled:opacity-50"
              style={{ maxHeight: '160px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || limitReached}
              aria-label="Send message"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#5BA88C] text-[#0E1512] transition-all hover:bg-[#6FBF9A] hover:shadow-[0_0_20px_rgba(91,168,140,0.3)] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-ink/20">
            {pass && <span className="text-ink/45">Research Pass active — no weekly limit ·{' '}</span>}
            {!pass && quota && !limitReached && (
              <span className="text-ink/45">
                {quota.remaining} of {quota.limit} free searches left this week ·{' '}
              </span>
            )}
            Shift + Enter for new line · AI outputs are computational hypotheses requiring experimental validation
          </p>
        </div>
      </div>
    </div>
  )
}
