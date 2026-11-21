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
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'screenshots')
mkdirSync(outDir, { recursive: true })

const PORT = Number(process.env.PORT) || 3110
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

// Serve the existing production build on its own port.
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: root,
  stdio: 'ignore',
  env: { ...process.env, PORT: String(PORT) },
})

let browser
try {
  await waitForServer(BASE + '/')
  browser = await chromium.launch()
  for (const s of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 1,
    })
    await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 60000 })
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
