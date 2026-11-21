// iOS standalone launch ("splash") screens. Without these, an installed PWA on
// iOS shows a blank white flash before first paint. iOS picks the image whose
// media query matches the current device + orientation exactly, so each device
// class needs its own entry with precise logical size (pt) and pixel ratio.
//
// The device table is ./ios-splash-devices.json — the single source of truth,
// shared with scripts/generate-ios-splash.mjs (which renders the PNGs). This
// module adds types + the asset/media derivation used by src/app/layout.tsx to
// emit the <link rel="apple-touch-startup-image"> tags.
//
// Portrait only — the dominant launch orientation. The dark surface (#121C18)
// matches the app's dark theme and the manifest background_color, so the iOS
// splash, the Android splash, and first paint all share one colour.
//
// px size = w * ratio  ×  h * ratio.  Regenerate after editing the JSON:
//   node scripts/generate-ios-splash.mjs

import devices from './ios-splash-devices.json'

export const SPLASH_SURFACE = '#121C18'

export type SplashDevice = {
  /** Reference device(s) — for humans, not used at runtime. */
  label: string
  /** Logical (CSS pt) width in portrait. */
  w: number
  /** Logical (CSS pt) height in portrait. */
  h: number
  /** Device pixel ratio. */
  ratio: number
}

export const SPLASH_DEVICES: SplashDevice[] = devices

/** Portrait pixel dimensions, asset path, and media query for a device. */
export function splashAsset(d: SplashDevice) {
  const pxW = d.w * d.ratio
  const pxH = d.h * d.ratio
  return {
    pxW,
    pxH,
    href: `/splash/apple-splash-${pxW}x${pxH}.png`,
    media: `(device-width: ${d.w}px) and (device-height: ${d.h}px) and (-webkit-device-pixel-ratio: ${d.ratio}) and (orientation: portrait)`,
  }
}
