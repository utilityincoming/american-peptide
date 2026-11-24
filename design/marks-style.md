# Research marks and image quality

PR 257 is the reference for the icon family. All four marks use a 24 × 24 viewBox, a 1.75-unit stroke, round caps and joins, and no intrinsic tile or corner radius. Marks are unfilled except for solid nodes (radius 1.6); extended residues use radius 2, and the search lens uses radius 7. The dashed terminal residue uses a 2/2 pattern. Render recognition marks at 16–24 CSS px where practical.

| Token | Light | Dark |
| --- | --- | --- |
| Surface | `#F6F3EC` | `#121C18` |
| Ink | `#1C2622` | `#F4F8F6` |
| Accent | `#0F6B44` | `#7EE0B5` |
| Raised panel | `#FFFFFF` | `#1A2822` |

The SVGs inherit `currentColor` from their surfaces. The PR 257 homepage tile is a 48 px square with `rounded-xl` (12 px), accent at 10% fill and 20% border. The Agent avatar is a 28 px square with `rounded-md` (6 px) and accent at 15% fill. Use a 12 px corner radius for comparable icon tiles and a 16 px radius for larger panels. Use solid palette colors and plain geometric strokes in newly generated art. Keep mint highlights on dark surfaces and use deep green on cream. No gradients, shadows baked into files, or stock medical imagery.

## Quality bar

- Use SVG for line art, marks, and instruments. Separate decorative figures from accessible controls and readouts. Hide decorative graphics from assistive technology. Label informative images or provide a nearby caption or text equivalent.
- A raster hero master must be at least 2400 px wide and render at no more than 1200 CSS px. A raster category master must be at least 1600 px wide, with the displayed slot capped at half the source dimensions in both axes. Re-render flagged owned raster masters from their source at 2–3× when possible. Upscaling the existing pixels cannot recover detail.
- Keep raster text-free. Set labels in HTML or SVG. Generate AVIF and WebP with the site's Next image optimizer by supplying a PNG source. Specify width and height, accurate responsive `sizes`, and lazy loading below the fold. Reserve the rendered aspect ratio before load. Use eager loading or preload only when the image is the actual LCP candidate.
- Use one 320 × 160 composition for category and featured-entry vectors, with a 20-unit safe area, fixed focal anchor and five evenly spaced residue nodes. Geometry may vary by category. These are abstract editorial illustrations, so avoid depicting a category or entry as a verified chemical structure.
- Verify desktop and mobile in both themes. At 2× DPR, the chosen raster must cover the visible drawn area in both axes. Keep essential shapes and labels legible. Check share titles at 300 px wide.
- Social and app exports use the carrier's required format. Social cards use 1200 × 630 PNG with type rendered by code. App icons and launch assets retain their platform-specific resolutions and maskable safe areas.
