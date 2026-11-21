// Regenerate the raster app icons from the canonical brand SVGs so every icon
// shares the one brand glyph and palette. Uses the pre-installed Chromium
// (pixel-perfect SVG: gradients, round joins) for the PNGs, then ImageMagick
// `convert` to bundle favicon.ico.
//
//   node scripts/generate-icons.mjs
//
// Two sources:
//   public/favicon.svg   — rounded-card mark, TRANSPARENT corners. Favicons and
//                          the manifest `purpose:any` Android icons.
//   public/maskable.svg  — full-bleed OPAQUE background, molecule inside the 80%
//                          safe zone. The manifest `purpose:maskable` Android
//                          icons AND the Apple touch icons (iOS flattens alpha
//                          and masks corners itself, so Apple icons must be
//                          opaque + square to avoid a black fringe).
//
// Re-run whenever either SVG changes.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

// Each target: output name → pixel size + which source SVG + opacity.
// `opaque:true` keeps the SVG's painted background (no transparent corners).
const TARGETS = [
  // Favicons + Android `any` icons: transparent rounded card.
  { name: 'favicon-16x16.png', size: 16, src: 'favicon.svg', opaque: false },
  { name: 'favicon-32x32.png', size: 32, src: 'favicon.svg', opaque: false },
  { name: 'android-chrome-192x192.png', size: 192, src: 'favicon.svg', opaque: false },
  { name: 'android-chrome-512x512.png', size: 512, src: 'favicon.svg', opaque: false },
  // Android maskable icons: opaque, full-bleed, safe-zone glyph.
  { name: 'maskable-192x192.png', size: 192, src: 'maskable.svg', opaque: true },
  { name: 'maskable-512x512.png', size: 512, src: 'maskable.svg', opaque: true },
  // Apple touch icons: opaque + square (iOS masks corners itself).
  { name: 'apple-touch-icon.png', size: 180, src: 'maskable.svg', opaque: true },
  { name: 'apple-touch-icon-167x167.png', size: 167, src: 'maskable.svg', opaque: true },
  { name: 'apple-touch-icon-152x152.png', size: 152, src: 'maskable.svg', opaque: true },
]

const sources = new Map()
const loadSvg = (file) => {
  if (!sources.has(file)) sources.set(file, readFileSync(join(pub, file), 'utf8'))
  return sources.get(file)
}

const browser = await chromium.launch()
try {
  for (const { name, size, src, opaque } of TARGETS) {
    const svg = loadSvg(src)
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    })
    // Scale the 32-unit SVG to fill the viewport exactly, no page margins.
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>
       ${svg}`,
      { waitUntil: 'networkidle' },
    )
    const buf = await page.screenshot({
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: !opaque,
    })
    await page.close()
    // Lossless re-encode (max zlib) — smaller files, gradients untouched.
    await sharp(buf).png({ compressionLevel: 9, effort: 10 }).toFile(join(pub, name))
    console.log(`wrote ${name} (${size}×${size}, ${src}${opaque ? ', opaque' : ''})`)
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
