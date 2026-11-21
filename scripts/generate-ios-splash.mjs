// Render the iOS standalone launch ("splash") screens into public/splash/.
// One PNG per device class from src/lib/ios-splash-devices.json: the brand mark
// centred on the dark app surface, so an installed iOS PWA opens on a branded
// screen instead of a white flash. The <link> tags are emitted by the app from
// the same JSON (src/lib/ios-splash.ts → src/app/layout.tsx).
//
//   node scripts/generate-ios-splash.mjs
//
// Re-run whenever the device table or public/favicon.svg changes.
import { readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const outDir = join(pub, 'splash')
mkdirSync(outDir, { recursive: true })

const SURFACE = '#121C18'
const devices = JSON.parse(
  readFileSync(join(root, 'src', 'lib', 'ios-splash-devices.json'), 'utf8'),
)
// The brand mark (rounded card) — same glyph as the home-screen icon.
const mark = readFileSync(join(pub, 'favicon.svg'), 'utf8')

const browser = await chromium.launch()
try {
  for (const d of devices) {
    const pxW = d.w * d.ratio
    const pxH = d.h * d.ratio
    // Logo ~22% of the shorter edge, centred.
    const logo = Math.round(Math.min(pxW, pxH) * 0.22)
    const page = await browser.newPage({
      viewport: { width: pxW, height: pxH },
      deviceScaleFactor: 1,
    })
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <style>
         html,body{margin:0;padding:0;width:${pxW}px;height:${pxH}px;background:${SURFACE}}
         .wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
         .mark{width:${logo}px;height:${logo}px;display:block}
       </style>
       <div class="wrap"><div class="mark">${mark}</div></div>`,
      { waitUntil: 'networkidle' },
    )
    await page.screenshot({
      path: join(outDir, `apple-splash-${pxW}x${pxH}.png`),
      clip: { x: 0, y: 0, width: pxW, height: pxH },
    })
    await page.close()
    console.log(`wrote apple-splash-${pxW}x${pxH}.png  (${d.label})`)
  }
} finally {
  await browser.close()
}
console.log(`\n${devices.length} splash screens → public/splash/`)
