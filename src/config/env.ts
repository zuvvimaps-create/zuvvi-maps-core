/**
 * Environment configuration — the single place where infrastructure URLs live.
 *
 * Every value has an open, working default so the app runs with no setup.
 * Point these at your own stack (PostGIS + Martin/Planetiler tiles, Valhalla
 * routing, Nominatim geocoding, your REST API) and nothing else changes:
 *
 *   VITE_MAP_STYLE_URL      MapLibre style JSON (e.g. your Martin/Planetiler style)
 *   VITE_TILE_SERVER_URL    Raster/vector tile endpoint template
 *   VITE_ROUTING_API_URL    Valhalla / OSRM base url
 *   VITE_GEOCODING_API_URL  Nominatim / Photon base url
 *   VITE_API_URL            Your application REST API (places, trips, drivers)
 */

const raw = import.meta.env as Record<string, string | undefined>;

export const env = {
  mapStyleUrl:
    raw["VITE_MAP_STYLE_URL"] ?? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  tileServerUrl: raw["VITE_TILE_SERVER_URL"] ?? "",
  routingApiUrl: raw["VITE_ROUTING_API_URL"] ?? "",
  geocodingApiUrl: raw["VITE_GEOCODING_API_URL"] ?? "",
  apiUrl: raw["VITE_API_URL"] ?? "",
};

/** True when the app is running entirely on bundled simulation data. */
export const isSimulated = {
  places: !env.apiUrl,
  geocoding: !env.geocodingApiUrl && !env.apiUrl,
  routing: !env.routingApiUrl && !env.apiUrl,
  drivers: !env.apiUrl,
  trips: !env.apiUrl,
};

export const envKeys = [
  {
    key: "VITE_MAP_STYLE_URL",
    value: env.mapStyleUrl,
    purpose: "MapLibre style JSON (Martin / Planetiler / any open style)",
  },
  {
    key: "VITE_TILE_SERVER_URL",
    value: env.tileServerUrl,
    purpose: "Vector or raster tile endpoint template",
  },
  {
    key: "VITE_ROUTING_API_URL",
    value: env.routingApiUrl,
    purpose: "Valhalla or OSRM routing base url",
  },
  {
    key: "VITE_GEOCODING_API_URL",
    value: env.geocodingApiUrl,
    purpose: "Nominatim or Photon geocoding base url",
  },
  {
    key: "VITE_API_URL",
    value: env.apiUrl,
    purpose: "Application REST API: places, drivers, trips",
  },
];
