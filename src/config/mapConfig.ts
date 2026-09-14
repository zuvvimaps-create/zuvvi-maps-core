/**
 * Map configuration — 100% open infrastructure, zero proprietary tokens.
 *
 * Swapping to self-hosted vector tiles is a config change only: point the
 * style url at your own style JSON (or set VITE_ZUVVI_MAP_STYLE_DARK etc.)
 * and nothing else in the app has to change.
 */

import type { LatLng } from "@/types";

export type MapStyleId = "dark" | "streets" | "satellite";

export interface MapStyleDefinition {
  id: MapStyleId;
  label: string;
  description: string;
  /** A MapLibre style JSON url, or an inline raster style spec. */
  style: string | Record<string, unknown>;
}

const env = import.meta.env as Record<string, string | undefined>;

const OPEN_STYLES = {
  /** CARTO Dark Matter — free open style built on OpenStreetMap data. */
  dark:
    env["VITE_ZUVVI_MAP_STYLE_DARK"] ??
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  /** CARTO Voyager — light street cartography. */
  streets:
    env["VITE_ZUVVI_MAP_STYLE_STREETS"] ??
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
} as const;

/** Raster imagery layer, defined inline so the tile url is swappable. */
const satelliteTileUrl =
  env["VITE_ZUVVI_MAP_SATELLITE_TILES"] ??
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const satelliteStyle: Record<string, unknown> = {
  version: 8,
  sources: {
    "zuvvi-imagery": {
      type: "raster",
      tiles: [satelliteTileUrl],
      tileSize: 256,
      attribution: "Imagery tiles",
    },
  },
  layers: [{ id: "zuvvi-imagery", type: "raster", source: "zuvvi-imagery" }],
};

export const mapStyles: Record<MapStyleId, MapStyleDefinition> = {
  dark: {
    id: "dark",
    label: "Zuvvi Dark",
    description: "Signature night cartography",
    style: OPEN_STYLES.dark,
  },
  streets: {
    id: "streets",
    label: "Streets",
    description: "Bright, detailed street map",
    style: OPEN_STYLES.streets,
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    description: "Aerial imagery preview",
    style: satelliteStyle,
  },
};

export const mapConfig = {
  /** Lisbon — the demo dataset's home city. */
  defaultCenter: { lat: 38.7169, lng: -9.1399 } satisfies LatLng,
  defaultZoom: 13.2,
  minZoom: 2,
  maxZoom: 19,
  defaultStyleId: "dark" as MapStyleId,
  flyToDuration: 1400,
  detailZoom: 16,
  attribution: "© OpenStreetMap contributors",
};

export const mapStyleList = Object.values(mapStyles);
