// Regenerate the raster app icons from public/favicon.svg so every icon shares
// the one canonical brand glyph and palette. Uses the pre-installed Chromium
// (pixel-perfect SVG: gradients, round joins) for the PNGs, then ImageMagick
// `convert` to bundle favicon.ico.
//
//   node scripts/generate-icons.mjs
//
// Re-run whenever public/favicon.svg changes.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const svg = readFileSync(join(pub, 'favicon.svg'), 'utf8')

// name → pixel size
const TARGETS = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
}

const browser = await chromium.launch()
try {
  for (const [name, size] of Object.entries(TARGETS)) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    })
    // Scale the 24-unit SVG to fill the viewport exactly, no page margins.
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>
       ${svg}`,
      { waitUntil: 'networkidle' },
    )
    await page.screenshot({
      path: join(pub, name),
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: true,
    })
    await page.close()
    console.log(`wrote ${name} (${size}×${size})`)
  }
} finally {
  await browser.close()
}

// favicon.ico = 16 + 32 bundled.
execFileSync(
  'convert',
  [join(pub, 'favicon-16x16.png'), join(pub, 'favicon-32x32.png'), join(pub, 'favicon.ico')],
  { stdio: 'inherit' },
)
console.log('wrote favicon.ico (16 + 32)')
