# Zuvvi Maps roadmap

- [ ] Design tokens + theme (sapphire/violet dark + light mode)
- [ ] UI component system (buttons/inputs/cards/dialog/sheet/chips/header)
- [ ] Layout: header, floating search, layer toggles, mobile bottom nav
      (Map, Saved, Explore, Settings)
- [ ] Real map: MapLibre GL JS with open styles (CARTO Dark Matter / OSM),
      no proprietary tokens; `src/config/mapConfig.ts` + `src/services/mapService.ts`
      exposing style switching, centering, panning, markers, viewport control
- [ ] Geolocation: locate-me button, smooth flyTo, pulsating user marker,
      loading state, friendly permission-denied toast
- [ ] Map UI: floating search bar (icon + clear), filter chips, zoom +/-,
      layers popover, saved shortcut, profile button, glowing "Ir" FAB
- [ ] Expandable bottom sheet: place details, quick actions, nearby recommendations
- [ ] Saved + Explore pages
- [ ] Design system guide page
- [ ] PWA manifest, icons, meta, favicon from app icon
- [ ] Pluggable service layer: IPlacesService / IGeocodingService contracts,
      demo/mock adapter by default, REST adapter switchable by config,
      no vendor lock-in
