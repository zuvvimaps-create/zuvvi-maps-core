import type { Map as MapLibreMap, Marker, StyleSpecification } from "maplibre-gl";
import { mapConfig, mapStyles, type MapStyleId } from "@/config/mapConfig";
import { boundsOf } from "@/utils/geo";
import type { LatLng, RouteGeometry, Viewport } from "@/types";

export interface AddMarkerOptions {
  id: string;
  location: LatLng;
  element: HTMLElement;
  onClick?: () => void;
  rotation?: number;
}

const ROUTE_SOURCE = "zuvvi-route";

/**
 * MapService — the single seam between the app and the map engine.
 *
 * Uses MapLibre GL JS with open styles only (no proprietary tokens). The
 * engine is imported dynamically so it never runs during server rendering.
 */
export class MapService {
  private map: MapLibreMap | null = null;
  private engine: typeof import("maplibre-gl") | null = null;
  private markers = new Map<string, Marker>();
  private route: RouteGeometry | null = null;
  private styleId: MapStyleId = mapConfig.defaultStyleId;

  get instance(): MapLibreMap | null {
    return this.map;
  }

  get currentStyleId(): MapStyleId {
    return this.styleId;
  }

  async init(
    container: HTMLElement,
    options?: { styleId?: MapStyleId; center?: LatLng; zoom?: number },
  ): Promise<MapLibreMap> {
    const engine = await import("maplibre-gl");
    this.engine = engine;
    this.styleId = options?.styleId ?? mapConfig.defaultStyleId;
    const center = options?.center ?? mapConfig.defaultCenter;

    const map = new engine.Map({
      container,
      style: mapStyles[this.styleId].style as string | StyleSpecification,
      center: [center.lng, center.lat],
      zoom: options?.zoom ?? mapConfig.defaultZoom,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      attributionControl: { compact: true },
      dragRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    this.map = map;

    // Re-apply app-owned layers whenever the base style is swapped.
    map.on("styledata", () => {
      if (this.route) this.drawRoute(this.route);
    });

    return map;
  }

  destroy() {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
    this.route = null;
    this.map?.remove();
    this.map = null;
  }

  /* -------------------------------- viewport -------------------------------- */

  flyTo(location: LatLng, zoom?: number) {
    this.map?.flyTo({
      center: [location.lng, location.lat],
      zoom: zoom ?? Math.max(this.map.getZoom(), mapConfig.detailZoom),
      duration: mapConfig.flyToDuration,
      essential: true,
    });
  }

  easeTo(location: LatLng, zoom?: number) {
    this.map?.easeTo({
      center: [location.lng, location.lat],
      ...(zoom === undefined ? {} : { zoom }),
      duration: 600,
    });
  }

  panBy(x: number, y: number) {
    this.map?.panBy([x, y]);
  }

  setViewport(viewport: Viewport) {
    this.map?.jumpTo({
      center: [viewport.center.lng, viewport.center.lat],
      zoom: viewport.zoom,
      bearing: viewport.bearing ?? 0,
      pitch: viewport.pitch ?? 0,
    });
  }

  getViewport(): Viewport | null {
    if (!this.map) return null;
    const center = this.map.getCenter();
    return {
      center: { lat: center.lat, lng: center.lng },
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
    };
  }

  zoomIn() {
    this.map?.zoomIn({ duration: 320 });
  }

  zoomOut() {
    this.map?.zoomOut({ duration: 320 });
  }

  resetOrientation() {
    this.map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
  }

  fitTo(points: LatLng[], padding = 90) {
    const bounds = boundsOf(points);
    if (!bounds || !this.map) return;
    this.map.fitBounds(bounds, { padding, duration: 900, maxZoom: 16.5 });
  }

  /* --------------------------------- layers --------------------------------- */

  setStyle(styleId: MapStyleId) {
    if (!this.map) return;
    this.styleId = styleId;
    this.map.setStyle(mapStyles[styleId].style as string | StyleSpecification);
  }

  /* -------------------------------- markers --------------------------------- */

  addMarker({ id, location, element, onClick, rotation }: AddMarkerOptions) {
    if (!this.map || !this.engine) return;
    this.removeMarker(id);
    if (onClick) {
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onClick();
      });
    }
    const marker = new this.engine.Marker({
      element,
      anchor: "center",
      rotationAlignment: "map",
      rotation: rotation ?? 0,
    })
      .setLngLat([location.lng, location.lat])
      .addTo(this.map);
    this.markers.set(id, marker);
  }

  updateMarker(id: string, location: LatLng, rotation?: number) {
    const marker = this.markers.get(id);
    if (!marker) return false;
    marker.setLngLat([location.lng, location.lat]);
    if (rotation !== undefined) marker.setRotation(rotation);
    return true;
  }

  hasMarker(id: string) {
    return this.markers.has(id);
  }

  removeMarker(id: string) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  clearMarkers(prefix?: string) {
    this.markers.forEach((marker, id) => {
      if (!prefix || id.startsWith(prefix)) {
        marker.remove();
        this.markers.delete(id);
      }
    });
  }

  /* --------------------------------- routes --------------------------------- */

  drawRoute(geometry: RouteGeometry) {
    const map = this.map;
    if (!map) return;
    this.route = geometry;
    if (!map.isStyleLoaded()) {
      map.once("load", () => this.drawRoute(geometry));
      return;
    }

    const data = {
      type: "Feature" as const,
      properties: {},
      geometry,
    };

    const existing = map.getSource(ROUTE_SOURCE);
    if (existing && "setData" in existing) {
      (existing as { setData: (d: unknown) => void }).setData(data);
      return;
    }

    map.addSource(ROUTE_SOURCE, { type: "geojson", data, lineMetrics: true });

    map.addLayer({
      id: `${ROUTE_SOURCE}-glow`,
      type: "line",
      source: ROUTE_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#6366F1",
        "line-width": 18,
        "line-blur": 18,
        "line-opacity": 0.55,
      },
    });

    map.addLayer({
      id: `${ROUTE_SOURCE}-line`,
      type: "line",
      source: ROUTE_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-width": 6,
        "line-gradient": [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          "#3B82F6",
          0.5,
          "#6366F1",
          1,
          "#8B5CF6",
        ],
      },
    });
  }

  clearRoute() {
    const map = this.map;
    this.route = null;
    if (!map || !map.getSource(ROUTE_SOURCE)) return;
    for (const id of [`${ROUTE_SOURCE}-glow`, `${ROUTE_SOURCE}-line`]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    map.removeSource(ROUTE_SOURCE);
  }
}

/** Shared instance for the main map surface. */
export const mapService = new MapService();
