import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mapConfig, type MapStyleId } from "@/config/mapConfig";
import { mapService } from "@/services/mapService";
import type { LatLng, Place, RouteGeometry } from "@/types";
import { AlertTriangle, RotateCw } from "lucide-react";
import { DestinationPin, PlacePin, UserLocationPin } from "./MapPin";

interface MapCanvasProps {
  places: Place[];
  selectedPlaceId: string | null;
  userLocation: LatLng;
  styleId: MapStyleId;
  route: RouteGeometry | null;
  destination: LatLng | null;
  onSelectPlace: (place: Place) => void;
  onReady?: () => void;
}

function createHost() {
  const element = document.createElement("div");
  element.style.willChange = "transform";
  return element;
}

/**
 * The cartographic surface. All engine access goes through MapService, and
 * every marker is a React component portalled into a MapLibre marker host.
 */
export function MapCanvas({
  places,
  selectedPlaceId,
  userLocation,
  styleId,
  route,
  destination,
  onSelectPlace,
  onReady,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hosts = useRef(new Map<string, HTMLElement>());
  const [, setHostVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markerHosts = hosts.current;
    let cancelled = false;

    mapService
      .init(container, { styleId, center: userLocation, zoom: mapConfig.defaultZoom })
      .then((map) => {
        if (cancelled) return;
        let settled = false;
        const markReady = () => {
          if (cancelled) return;
          setLoadError(null);
          if (!settled) {
            settled = true;
            setReady(true);
            onReady?.();
          }
        };
        const markUnavailable = () => {
          if (cancelled || settled) return;
          settled = true;
          setLoadError("A cartografia não carregou. Verifique sua conexão e tente novamente.");
          // Keep app-owned pins and controls usable even when tiles fail.
          setReady(true);
          onReady?.();
        };
        const timeoutId = window.setTimeout(markUnavailable, 12_000);
        map.on("error", (event) => {
          console.error("Map resource failed to load", event.error);
          markUnavailable();
        });
        map.once("load", () => {
          window.clearTimeout(timeoutId);
          markReady();
        });
        if (map.loaded()) {
          window.clearTimeout(timeoutId);
          markReady();
        }
      })
      .catch((error) => {
        console.error("Map failed to initialise", error);
        if (!cancelled) {
          setLoadError("Seu aparelho não conseguiu iniciar o mapa.");
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      markerHosts.clear();
      mapService.destroy();
      setReady(false);
    };
    // Init once; style/center changes are applied through dedicated effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && mapService.currentStyleId !== styleId) mapService.setStyle(styleId);
  }, [ready, styleId]);

  /* ------------------------------ place markers ----------------------------- */
  const placeKey = useMemo(() => places.map((place) => place.id).join("|"), [places]);

  useEffect(() => {
    if (!ready) return;
    const present = new Set(places.map((place) => place.id));

    hosts.current.forEach((_, id) => {
      if (id.startsWith("place:") && !present.has(id.slice(6))) {
        mapService.removeMarker(id);
        hosts.current.delete(id);
      }
    });

    for (const place of places) {
      const id = `place:${place.id}`;
      if (hosts.current.has(id)) {
        mapService.updateMarker(id, place.location);
        continue;
      }
      const host = createHost();
      hosts.current.set(id, host);
      mapService.addMarker({
        id,
        location: place.location,
        element: host,
        onClick: () => onSelectPlace(place),
      });
    }
    setHostVersion((version) => version + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, placeKey]);

  /* ------------------------------- user marker ------------------------------ */
  useEffect(() => {
    if (!ready) return;
    const id = "user";
    if (!mapService.updateMarker(id, userLocation)) {
      const host = createHost();
      hosts.current.set(id, host);
      mapService.addMarker({ id, location: userLocation, element: host });
      setHostVersion((version) => version + 1);
    }
  }, [ready, userLocation]);

  /* ----------------------------- destination pin ---------------------------- */
  useEffect(() => {
    if (!ready) return;
    const id = "destination";
    if (!destination) {
      mapService.removeMarker(id);
      hosts.current.delete(id);
      setHostVersion((version) => version + 1);
      return;
    }
    if (!mapService.updateMarker(id, destination)) {
      const host = createHost();
      hosts.current.set(id, host);
      mapService.addMarker({ id, location: destination, element: host });
      setHostVersion((version) => version + 1);
    }
  }, [ready, destination]);

  /* --------------------------------- route ---------------------------------- */
  useEffect(() => {
    if (!ready) return;
    if (route) mapService.drawRoute(route);
    else mapService.clearRoute();
  }, [ready, route]);

  const userHost = hosts.current.get("user");
  const destinationHost = hosts.current.get("destination");

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Brand ambience over the cartography */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 12% 0%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 60%), radial-gradient(110% 60% at 92% 100%, color-mix(in oklab, var(--color-accent-violet) 16%, transparent), transparent 62%)",
        }}
      />

      {places.map((place) => {
        const host = hosts.current.get(`place:${place.id}`);
        if (!host) return null;
        return createPortal(
          <PlacePin
            category={place.category}
            name={place.name}
            selected={place.id === selectedPlaceId}
          />,
          host,
          place.id,
        );
      })}

      {userHost ? createPortal(<UserLocationPin />, userHost, "user") : null}
      {destinationHost ? createPortal(<DestinationPin />, destinationHost, "dest") : null}

      {loadError ? (
        <div className="absolute left-4 right-4 top-40 z-20 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-warning/30 bg-background/95 p-3 shadow-e2 backdrop-blur">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="flex-1 text-xs font-medium text-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Tentar
          </button>
        </div>
      ) : null}

      {!ready ? (
        <div className="absolute inset-0 grid place-items-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              Carregando cartografia Zuvvi…
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
