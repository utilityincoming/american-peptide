import { describe, it, expect } from 'vitest'
import { isNonHumanClick, headersFromObject } from './bot-detect'

const h = (obj: Record<string, string | undefined>) => headersFromObject(obj)

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

describe('isNonHumanClick — humans pass', () => {
  it.each([
    ['desktop chrome', CHROME],
    ['ios safari', SAFARI_IOS],
    [
      'android chrome',
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    ],
    [
      'firefox',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
    ],
  ])('%s is human', (_label, ua) => {
    expect(isNonHumanClick(h({ 'user-agent': ua })).bot).toBe(false)
  })
})

describe('isNonHumanClick — bots & automation flagged', () => {
  it.each([
    ['googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
    ['facebook unfurler', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
    ['twitterbot', 'Twitterbot/1.0'],
    ['slackbot', 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
    ['telegram', 'TelegramBot (like TwitterBot)'],
    ['discord', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'],
    ['curl', 'curl/8.4.0'],
    ['python', 'python-requests/2.31.0'],
    ['headless', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36'],
    ['ahrefs', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'],
    ['gptbot', 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)'],
    ['uptimerobot', 'Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)'],
  ])('%s is a bot', (_label, ua) => {
    expect(isNonHumanClick(h({ 'user-agent': ua })).bot).toBe(true)
  })

  it('treats a missing user-agent as a bot', () => {
    expect(isNonHumanClick(h({})).bot).toBe(true)
    expect(isNonHumanClick(h({ 'user-agent': '' })).bot).toBe(true)
  })

  it('reports a reason', () => {
    expect(isNonHumanClick(h({ 'user-agent': 'curl/8.4.0' })).reason).toBe('ua:curl')
    expect(isNonHumanClick(h({})).reason).toBe('empty-ua')
  })
})

describe('isNonHumanClick — prefetch/preview flagged even with a real browser UA', () => {
  it.each([
    ['sec-purpose prefetch', { 'sec-purpose': 'prefetch;prerender' }],
    ['purpose prefetch', { purpose: 'prefetch' }],
    ['x-purpose preview', { 'x-purpose': 'preview' }],
    ['x-moz prefetch', { 'x-moz': 'prefetch' }],
    ['next router prefetch', { 'next-router-prefetch': '1' }],
  ])('%s', (_label, extra) => {
    expect(isNonHumanClick(h({ 'user-agent': CHROME, ...extra })).bot).toBe(true)
  })

  it('a plain browser navigation (no prefetch headers) is human', () => {
    expect(isNonHumanClick(h({ 'user-agent': CHROME, 'sec-fetch-mode': 'navigate' })).bot).toBe(false)
  })
})
