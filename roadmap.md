# Zuvvi Maps roadmap

- [ ] Design tokens + theme (sapphire/violet dark + light mode)
- [ ] UI component system (buttons/inputs/cards/dialog/sheet/chips/header)
- [ ] Real map: MapLibre GL JS with open styles (CARTO/OSM), no proprietary tokens;
      `src/config/mapConfig.ts` + `src/services/mapService.ts` (style switching,
      centering, panning, markers, viewport, GeoJSON route layers)
- [ ] Geolocation: locate button, flyTo, pulsating marker, loading, denied toast
- [ ] Map UI: floating search bar, filter chips, zoom +/-, layers popover,
      saved shortcut, profile button, glowing "Ir" FAB, bottom nav
      (Map, Saved, Explore, Settings)
- [ ] Services + contracts, all with mock providers swappable to self-hosted
      (Nominatim / OSRM / Valhalla / custom REST), no vendor lock-in:
      - IPlacesService: details, ratings, hours, contact, photos, category filter
      - IGeocodingService: search, autocomplete, reverse, recent history (localStorage)
      - IRoutingService: route between points, profiles (fastest/shortest/eco),
        GeoJSON polyline, distance, duration, turn-by-turn steps
- [ ] Search overlay: live autocomplete, category chips (Cafés, Restaurantes,
      Mercados, Farmácias, Postos), recent history w/ clear one + clear all,
      empty states, loading skeletons, keyboard navigation
- [ ] Place details sheet: photos, badges, rating, address, distance, hours, phone,
      actions Ir / Salvar / Compartilhar, nearby recommendations
- [ ] Route planning: origin/destination inputs + Inverter swap, "Sua localização
      atual" default origin, route comparison cards, polyline + pins on map,
      "Iniciar navegação" CTA
- [ ] Navigation HUD: maneuver banner (icon, distance, next street), bottom bar
      (remaining time/distance, ETA, Encerrar navegação), step progress
- [ ] Saved + Explore + Settings pages
- [ ] Design system guide page
- [ ] PWA manifest, icons, meta, favicon from app icon
