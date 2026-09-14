# Zuvvi Maps

A premium, mobile-first mapping app with a royal sapphire/violet dark aesthetic, installable to a phone home screen, built on a reusable design system and a vendor-neutral data layer.

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
- Live token tables (colors, spacing, radii, type scale, elevation), component gallery with every button variant and loading state, inputs, cards, dialogs, bottom sheet, chips, headers, plus a short architecture explanation including the data-provider setup.

## Data layer (swappable, no vendor lock-in)

- Two clear contracts: a places service (search, nearby, details, categories) and a geocoding service (address to coordinates and back).
- Default provider: curated demo data bundled in the app, so everything works with nothing to configure.
- Second provider: a generic REST adapter that talks to your own self-hosted API. Switching is a one-line config change (provider name plus base URL), with no code changes in the screens.
- Nothing in the app depends on Google Maps, Google Places, Mapbox, or any other proprietary vendor.

## Installable app

Web app manifest, icons, theme colors, and responsive meta so it can be added to a phone home screen. No offline caching.

## Technical notes

- Structure: `src/components/{ui,layout,map}`, `src/routes` (pages), `src/hooks`, `src/services`, `src/utils`, `src/types`, tokens in `src/styles.css` plus `src/theme` helpers.
- `src/services/`: `types.ts` (`IPlacesService`, `IGeocodingService`, DTOs), `providers/demo/*`, `providers/rest/*` (fetch-based, endpoint paths configurable), `config.ts` reading `VITE_ZUVVI_PROVIDER` / `VITE_ZUVVI_API_BASE_URL` with demo defaults, and `index.ts` exporting singleton `PlacesService` / `GeocodingService` resolved from config. Screens consume services only through TanStack Query hooks in `src/hooks`.
- Tokens as Tailwind v4 `@theme inline` variables over `:root` / `.dark` oklch values; no hardcoded color utilities in components.
- Buttons/inputs/cards/dialog/sheet/chips built as `cva` variants on shadcn primitives; button gets `primary | glow | secondary | ghost | outline | destructive` plus `loading` state.
- Map is an SVG/DOM canvas: pointer-drag pan, non-passive `wheel` listener with `exp`-based zoom and cursor-anchored offset, two-pointer pinch, `touch-action: none`.
- Theme stored in `localStorage`, applied in `useEffect` to avoid hydration mismatch.
- Routes: `/` (map), `/saved`, `/explore`, `/design`, each with its own title/description/social metadata.
- Generated imagery for place photos and app icons.
