# Vendored fonts

`SpaceGrotesk-400.woff` / `SpaceGrotesk-700.woff` — Latin subset of
**Space Grotesk** by Florian Karsten, the site's display face. Vendored here so
the Open Graph / share-image routes (`src/lib/og.tsx`) can embed it; Satori
cannot read `next/font`'s runtime font, and a generic sans fallback looks unlike
the site.

Licensed under the SIL Open Font License 1.1 — https://openfontlicense.org.
Source: https://fonts.google.com/specimen/Space+Grotesk
(subset files via https://www.npmjs.com/package/@fontsource/space-grotesk).
