// Rebuild the platform icons and light variants from the two flat SVG masters.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const pub = fileURLToPath(new URL('../public/', import.meta.url))
const rounded = readFileSync(join(pub, 'favicon.svg'), 'utf8')
const maskable = readFileSync(join(pub, 'maskable.svg'), 'utf8')
const light = (svg) => svg.replaceAll('#121C18', '#F6F3EC').replaceAll('#7EE0B5', '#0F6B44')

writeFileSync(join(pub, 'favicon-light.svg'), light(rounded))

const targets = [
  ['favicon-16x16.png', 16, rounded],
  ['favicon-32x32.png', 32, rounded],
  ['favicon-32x32-light.png', 32, light(rounded)],
  ['android-chrome-192x192.png', 192, rounded],
  ['android-chrome-512x512.png', 512, rounded],
  ['android-chrome-512x512-light.png', 512, light(rounded)],
  ['maskable-192x192.png', 192, maskable],
  ['maskable-512x512.png', 512, maskable],
  ['apple-touch-icon.png', 180, maskable],
  ['apple-touch-icon-light.png', 180, light(maskable)],
  ['apple-touch-icon-167x167.png', 167, maskable],
  ['apple-touch-icon-152x152.png', 152, maskable],
]

for (const [name, size, svg] of targets) {
  await sharp(Buffer.from(svg), { density: size * 72 / 32 })
    .resize(size, size)
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(join(pub, name))
}

execFileSync(
  'convert',
  [join(pub, 'favicon-16x16.png'), join(pub, 'favicon-32x32.png'), join(pub, 'favicon.ico')],
  { stdio: 'inherit' },
)
