'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { Faq } from '@/lib/faqs'

/**
 * Accessible FAQ accordion. Answers are rendered in the DOM even when collapsed
 * (good for crawlers and for the FAQPage JSON-LD that ships alongside it); the
 * panel animates open/closed with a grid-rows trick. One panel open at a time.
 */
export default function FaqAccordion({
  items,
  defaultOpenId,
}: {
  items: Faq[]
  /** Which panel starts open. Defaults to the first item; pass null for all-closed. */
  defaultOpenId?: string | null
}) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId === undefined ? (items[0]?.id ?? null) : defaultOpenId,
  )

  return (
    <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      {items.map((f) => {
        const isOpen = openId === f.id
        return (
          <div key={f.id}>
            <h3 className="m-0">
              <button
                type="button"
                id={`faq-trigger-${f.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${f.id}`}
                onClick={() => setOpenId(isOpen ? null : f.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:bg-white/[0.03]"
              >
                <span
                  className={
                    'text-sm font-medium transition-colors md:text-[15px] ' +
                    (isOpen ? 'text-white' : 'text-white/80')
                  }
                >
                  {f.question}
                </span>
                <ChevronDown
                  aria-hidden
                  className={
                    'h-4 w-4 shrink-0 text-[#2DD4A8] transition-transform duration-300 ' +
                    (isOpen ? 'rotate-180' : '')
                  }
                />
              </button>
            </h3>

            <div
              id={`faq-panel-${f.id}`}
              role="region"
              aria-labelledby={`faq-trigger-${f.id}`}
              aria-hidden={!isOpen}
              className="grid transition-all duration-300 ease-out"
              // The collapsing grid-rows + min-height:0 trick is driven inline so
              // it never depends on JIT-generated arbitrary-value utilities.
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden" style={{ minHeight: 0 }}>
                <div className="px-5 pb-5 text-sm leading-relaxed text-white/55">
                  <p className="m-0">{f.answer}</p>
                  {f.cta && (
                    <Link
                      href={f.cta.href}
                      tabIndex={isOpen ? undefined : -1}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2DD4A8] underline-offset-2 hover:underline"
                    >
                      {f.cta.label}
                      <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
