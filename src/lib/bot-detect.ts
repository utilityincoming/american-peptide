// Non-human click detection for the /go affiliate chokepoint.
//
// WHY: our recorded click counts ran ~12× a partner's reported visits, because
// /go is a public endpoint and every crawler, link-unfurler, prefetch, and
// uptime probe that touches it was counted as a referral. Those never land a
// real visit on the vendor, so they inflate our numbers and make them
// incomparable to partner dashboards.
//
// This is a header-only heuristic (no JS, no IP lookup) used ONLY to decide
// whether a /go hit counts as a human referral. It never changes the redirect
// itself — a misclassified human still reaches the vendor; they just aren't
// counted. False negatives (a bot we miss) are acceptable; false positives (a
// human we skip) only cost one uncounted click, never a broken link.

export interface BotVerdict {
  bot: boolean
  /** Why it was flagged, for logging/metrics. Absent when bot is false. */
  reason?: string
}

// Substrings that, in a User-Agent, mark an automated client. Lower-cased
// match. Kept broad on purpose — generic tokens (bot/crawl/spider) catch the
// long tail; named entries catch major clients whose UA omits those tokens.
const UA_BOT_PATTERNS = [
  // generic
  'bot',
  'crawl',
  'spider',
  'slurp',
  'scrape',
  // social / chat link unfurlers (the big source of phantom affiliate clicks)
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'slackbot',
  'slack-imgproxy',
  'discordbot',
  'telegrambot',
  'whatsapp',
  'linkedinbot',
  'pinterest',
  'redditbot',
  'embedly',
  'quora link preview',
  'skypeuripreview',
  'vkshare',
  'bitlybot',
  'nuzzel',
  'applebot',
  'bingpreview',
  // HTTP libraries / CLIs
  'curl',
  'wget',
  'python-requests',
  'python-urllib',
  'go-http-client',
  'okhttp',
  'axios',
  'node-fetch',
  'got (',
  'libwww',
  'java/',
  'apache-httpclient',
  'httpclient',
  'guzzle',
  'httpie',
  // headless / automation
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'playwright',
  'lighthouse',
  'chrome-lighthouse',
  // monitoring / SEO / security / AI crawlers
  'uptimerobot',
  'pingdom',
  'statuscake',
  'datadog',
  'newrelicpinger',
  'semrush',
  'ahrefs',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  'gptbot',
  'ccbot',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'amazonbot',
  'yandex',
  'baiduspider',
  'sogou',
  'exabot',
  'ia_archiver',
  'google-inspectiontool',
  'googleother',
] as const

/**
 * Classify a request by its headers. `headers` is anything with a Headers-like
 * `get()` (a Request's headers, or a plain object wrapped — see fromObject).
 */
export function isNonHumanClick(headers: Pick<Headers, 'get'>): BotVerdict {
  // Prefetch / preview navigations: the browser fetched /go speculatively; no
  // human has chosen to leave yet. Counting these over-reports intent.
  const secPurpose = headers.get('sec-purpose')?.toLowerCase() ?? ''
  if (secPurpose.includes('prefetch')) return { bot: true, reason: 'sec-purpose:prefetch' }
  const purpose = (headers.get('purpose') ?? headers.get('x-purpose') ?? '').toLowerCase()
  if (purpose === 'prefetch' || purpose === 'preview') return { bot: true, reason: `purpose:${purpose}` }
  if ((headers.get('x-moz') ?? '').toLowerCase() === 'prefetch') return { bot: true, reason: 'x-moz:prefetch' }
  if (headers.get('next-router-prefetch')) return { bot: true, reason: 'next-prefetch' }

  const ua = (headers.get('user-agent') ?? '').trim()
  // No UA at all: no mainstream browser omits it; overwhelmingly automated.
  if (ua === '') return { bot: true, reason: 'empty-ua' }

  const lower = ua.toLowerCase()
  for (const pat of UA_BOT_PATTERNS) {
    if (lower.includes(pat)) return { bot: true, reason: `ua:${pat}` }
  }
  return { bot: false }
}

/** Adapter so callers holding a plain header map can reuse the same logic. */
export function headersFromObject(obj: Record<string, string | undefined>): Pick<Headers, 'get'> {
  const lower: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) if (v != null) lower[k.toLowerCase()] = v
  return { get: (name: string) => lower[name.toLowerCase()] ?? null }
}
