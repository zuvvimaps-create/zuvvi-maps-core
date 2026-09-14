/**
 * Provider selection.
 *
 * Default is the bundled demo provider so the app runs with zero setup.
 * To point Zuvvi at your own self-hosted infrastructure, set:
 *
 *   VITE_ZUVVI_PROVIDER=rest
 *   VITE_ZUVVI_API_BASE_URL=https://api.your-domain.com
 *   VITE_ZUVVI_PLACES_PATH=/places          (optional overrides)
 *   VITE_ZUVVI_GEOCODE_PATH=/geocode
 *   VITE_ZUVVI_ROUTING_PATH=/route
 *
 * The REST adapter speaks plain JSON, so Nominatim/Photon (geocoding) and
 * OSRM/Valhalla (routing) can sit behind a thin proxy of your own.
 */

const env = import.meta.env as Record<string, string | undefined>;

export type ProviderKind = "demo" | "rest";

const requested = (env["VITE_ZUVVI_PROVIDER"] ?? "demo").toLowerCase();
const baseUrl = env["VITE_ZUVVI_API_BASE_URL"] ?? "";

export const servicesConfig = {
  /** `rest` is only honoured when a base url is configured. */
  provider: (requested === "rest" && baseUrl ? "rest" : "demo") as ProviderKind,
  baseUrl,
  paths: {
    places: env["VITE_ZUVVI_PLACES_PATH"] ?? "/places",
    geocode: env["VITE_ZUVVI_GEOCODE_PATH"] ?? "/geocode",
    routing: env["VITE_ZUVVI_ROUTING_PATH"] ?? "/route",
  },
  /** Simulated latency for the demo provider, keeps loading states honest. */
  demoLatencyMs: 260,
  recentSearchStorageKey: "zuvvi.recent-searches",
  savedPlacesStorageKey: "zuvvi.saved-places",
  themeStorageKey: "zuvvi.theme",
};
