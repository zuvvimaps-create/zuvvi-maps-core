# Zuvvi Maps

A premium, mobile-first mapping app with a royal sapphire/violet dark aesthetic, installable to a phone home screen, built on a reusable design system.

## Look and feel

- Deep navy surfaces (#070A16 base, #111634 panels), sapphire (#3B82F6) and violet (#8B5CF6) accents with soft glow.
- Precision hairline borders, layered soft shadows, crisp modern sans typography (Space Grotesk headings, DM Sans body).
- Light and dark modes, both accessible, with a smooth transition when toggling.

## Screens

**Map view (home)**
- Full-bleed stylized map: custom-drawn streets, districts, water, and glowing pins. Pan, wheel/pinch zoom, tap a pin to select.
- Floating search bar with an expanding search overlay and recent/suggested results.
- Filter chips (Cafes, Food, Parks, Transit, Shops) that filter visible pins.
- Layer toggles (Streets, Satellite-tint, Transit, Terrain) in a compact floating control.
- Location drawer: bottom sheet on mobile, side panel on desktop, with photo, rating, hours, address, distance, tags, and quick actions (Directions, Save, Share, Call).
- Mobile bottom navigation: Map, Saved, Explore, Design.

**Saved and Explore**
- Saved places list with the same card system; Explore shows curated demo collections.

**Design system guide**
- Live token tables (colors, spacing, radii, type scale, elevation), component gallery with every button variant and loading state, inputs, cards, dialogs, bottom sheet, chips, headers, plus a short architecture explanation.

## Data

Curated demo places defined in code (name, category, coords, rating, hours, photo, tags) — no backend, nothing to configure.

## Installable app

Web app manifest, icons, theme colors, and responsive meta so it can be added to a phone home screen. No offline caching.

## Technical notes

- Structure: `src/components/{ui,layout,map}`, `src/routes` (pages), `src/hooks`, `src/services`, `src/utils`, `src/types`, tokens in `src/styles.css` plus `src/theme` helpers.
- Tokens as Tailwind v4 `@theme inline` variables over `:root` / `.dark` oklch values; no hardcoded color utilities in components.
- Buttons/inputs/cards/dialog/sheet/chips built as `cva` variants on shadcn primitives; button gets `primary | glow | secondary | ghost | outline | destructive` plus `loading` state.
- Map is an SVG/DOM canvas: pointer-drag pan, non-passive `wheel` listener with `exp`-based zoom and cursor-anchored offset, two-pointer pinch, `touch-action: none`.
- Theme stored in `localStorage`, applied in `useEffect` to avoid hydration mismatch.
- Routes: `/` (map), `/saved`, `/explore`, `/design`, each with its own title/description/social metadata.
- Generated imagery for place photos and app icons.
