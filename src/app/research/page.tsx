'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Dna, SquarePen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

type Role = 'user' | 'assistant'

interface Message {
  role: Role
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content: `Welcome to the **AmericanPeptide Research Agent**.

I'm your AI assistant for peptide drug discovery. I can help you:

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
  'How to reconstitute peptides',
  'How to read a peptide COA',
  'Best copper peptide serum ingredients',
  'Peptide storage and shelf life',
]

const md: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-white/80">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-bold text-white first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold text-white first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-white/90 first:mt-0">{children}</h3>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-white/[0.07] bg-[#0B1220] p-4 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className)
    if (isBlock) {
      return (
        <code className="font-mono text-xs text-[#2DD4A8]/90 leading-relaxed">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-[#2DD4A8]">
        {children}
      </code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-[#2DD4A8]/30 pl-4 text-white/55 last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto rounded-lg border border-white/[0.07] last:mb-0">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-left font-semibold text-white/80">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/[0.04] px-4 py-2.5 text-white/55 last:border-b-0">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#2DD4A8] underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-white/[0.07]" />,
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 140, 280].map((delay) => (
        <div
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-[#2DD4A8]/50"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

function AgentAvatar() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
      <Dna className="h-4 w-4 text-[#2DD4A8]" strokeWidth={1.75} />
    </div>
  )
}

export default function ResearchPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

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

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        })

        const data = await res.json()
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
    [messages, loading],
  )

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
    <div className="flex h-screen flex-col bg-[#0B1220] text-white">

      {/* ── Page identity ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <AgentAvatar />
          <div>
            <span className="text-sm font-medium">Research Agent</span>
            <span className="ml-2 hidden text-xs text-white/30 sm:inline">
              claude-sonnet-4-20250514
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([WELCOME])
            setInput('')
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <SquarePen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New chat</span>
        </button>
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
                    ? 'rounded-tr-sm bg-[#2DD4A8]/[0.12] text-white/90'
                    : 'rounded-tl-sm border border-white/[0.06] bg-white/[0.025] text-white/65'
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
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left text-xs text-white/40 transition-all hover:border-[#2DD4A8]/20 hover:bg-white/[0.04] hover:text-white/70"
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
              <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-[#2DD4A8]/25">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about peptide sequences, clinical trials, or literature…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/20 outline-none disabled:opacity-50"
              style={{ maxHeight: '160px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#2DD4A8] text-[#0B1220] transition-all hover:bg-[#34ddb0] hover:shadow-[0_0_20px_rgba(45,212,168,0.3)] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/20">
            Shift + Enter for new line · AI outputs are computational hypotheses requiring experimental validation
          </p>
        </div>
      </div>
    </div>
  )
}
