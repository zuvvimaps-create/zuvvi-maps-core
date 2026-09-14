# Zuvvi Maps roadmap

## Phase 1 — foundation
- [x] Design tokens + theme (sapphire/violet dark + light)
- [ ] Config: `src/config/mapConfig.ts`, `src/config/env.ts`
      (VITE_MAP_STYLE_URL, VITE_TILE_SERVER_URL, VITE_ROUTING_API_URL,
       VITE_GEOCODING_API_URL, VITE_API_URL)
- [ ] `src/types/database.ts` — PostGIS GeoJSON Point/LineString models
- [ ] Service contracts + demo providers, swappable to self-hosted
      (Nominatim / Valhalla / OSRM / Martin / custom REST), no vendor lock-in:
      Places, Geocoding (+ autocomplete, recents in localStorage), Routing,
      Driver, Trip, Map
- [ ] UI kit: button variants + loading, inputs, glass cards, dialog,
      bottom sheet, chips, headers, stepper, skeletons

## Phase 2 — map experience
- [ ] MapLibre canvas, open styles, layer switching, zoom, geolocate
      with pulsating marker + friendly denied toast
- [ ] Floating search bar + full search overlay: autocomplete, category chips,
      recents (clear one / clear all), empty + skeleton states, keyboard nav
- [ ] Place details bottom sheet: photos, badges, rating, hours, phone,
      distance, Ir / Salvar / Compartilhar, nearby recommendations
- [ ] Route planning: origin/destination + Inverter, "Sua localização atual",
      route option cards, polyline + pins, "Iniciar navegação"
- [ ] Navigation HUD: maneuver banner + bottom bar (tempo, distância, ETA,
      Encerrar navegação), step progress
- [ ] Bottom nav: Map, Saved, Explore, Settings

## Phase 3 — ride & fleet platform
- [ ] Roles: user | driver | business_owner | admin + header role switcher
- [ ] Drivers module: Driver model, DriverService with simulated live
      positions, heading-rotated pulsing driver markers on the map
- [ ] Trips module: Trip model, TripService (request/accept/status/history),
      request-ride flow with categories (Zuvvi Go / Comfort / Black) + fare
      estimate, active trip stepper sheet, history list + receipt modal
- [ ] Saved places: Casa, Trabalho, custom labels, 1-tap route
- [ ] `/admin`: metric cards, live fleet map, trips table with filters,
      drivers directory with status toggles, users + venues directories

## Phase 4 — docs & polish
- [ ] `/design` design-system guide
- [ ] `/docs` architecture page: decoupling, self-hosting Valhalla/Nominatim/
      Martin/Planetiler/PostGIS, what is mocked, migration checklist
- [ ] PWA manifest, icons, meta, favicon from app icon

## Done (this pass)
- Home screen live at /: MapLibre canvas, POI pins, user marker, header + search overlay, map controls (locate/zoom/layers/recenter/saved), place bottom sheet, route comparison panel, navigation HUD, bottom nav, saved/profile panels.
- Services: demo + REST providers for places/geocoding/routing, fleet/trip/admin demo providers, registry in src/services/index.ts.
- PWA manifest, fonts, theme provider, toasts.

## Next
- Pages: /explore, /saved, /admin, /design (component showcase), /docs.
- Wire fleet/trip services into a rides flow.
