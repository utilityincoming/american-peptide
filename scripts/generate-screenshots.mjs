// Capture the PWA install screenshots referenced by public/manifest.json
// (the `screenshots` array Chrome shows in its richer "Install app" prompt).
//
//   npm run build            # a production build must exist first
//   node scripts/generate-screenshots.mjs
//
// `npm run gen:screenshots` wires the build + this step together. The script
// serves the production build itself on an ephemeral port, dismisses the
// "Research & educational use only" consent modal, captures each form factor,
// then re-encodes losslessly with sharp. Keep the list + sizes in sync with the
// `screenshots` entries in public/manifest.json.
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'screenshots')
mkdirSync(outDir, { recursive: true })

// Grab a verified-free ephemeral port, so we never connect to a stale leftover
// `next start` squatting on a fixed port (which would capture the wrong build).
const PORT = await new Promise((resolve, reject) => {
  const srv = createServer()
  srv.once('error', reject)
  srv.listen(0, '127.0.0.1', () => {
    const { port } = srv.address()
    srv.close(() => resolve(port))
  })
})
const BASE = `http://localhost:${PORT}`

const SHOTS = [
  { file: 'screenshot-wide-home.png', url: '/', w: 1920, h: 1080 },
  { file: 'screenshot-narrow-home.png', url: '/', w: 1080, h: 1920 },
  { file: 'screenshot-narrow-catalog.png', url: '/catalog', w: 1080, h: 1920 },
]

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { cache: 'no-store' })
      if (r.ok) return
    } catch {}
    await sleep(1000)
  }
  throw new Error(`server did not become ready at ${url}`)
}

// Serve the existing production build on its own (free) port. Keep stderr so a
// startup failure is visible instead of silently hanging.
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'inherit'],
  env: { ...process.env, PORT: String(PORT) },
})
let serverExited = false
server.on('exit', (code) => {
  serverExited = true
  if (code) console.error(`next start exited early with code ${code}`)
})

let browser
try {
  if (serverExited) throw new Error('next start failed to launch')
  await waitForServer(BASE + '/')
  browser = await chromium.launch()
  for (const s of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 1,
    })
    await page.goto(BASE + s.url, { waitUntil: 'load', timeout: 60000 })
    // Wait until a real stylesheet has applied — a cold production server can
    // serve the HTML before its CSS chunk is ready, which would capture an
    // unstyled page. Then wait for fonts and network idle.
    await page.waitForFunction(
      () =>
        document.styleSheets.length > 0 &&
        [...document.styleSheets].some((s) => {
          try {
            return s.cssRules && s.cssRules.length > 10
          } catch {
            return false
          }
        }),
      { timeout: 30000 },
    )
    await page.evaluate(() => document.fonts.ready)
    // NB: no networkidle wait — the ahrefs analytics script keeps a long-lived
    // connection, so the network never goes idle. CSS + fonts ready is enough.
    // Dismiss the research-use consent modal if it is showing.
    try {
      const btn = page.getByRole('button', { name: /I understand/i })
      if (await btn.isVisible({ timeout: 2500 })) {
        await btn.click()
        await page.waitForTimeout(600)
      }
    } catch {}
    await page.waitForTimeout(1200)
    const buf = await page.screenshot()
    await page.close()
    await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toFile(join(outDir, s.file))
    console.log(`wrote ${s.file} (${s.w}×${s.h})`)
  }
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
}
console.log(`\n${SHOTS.length} screenshots → public/screenshots/`)
