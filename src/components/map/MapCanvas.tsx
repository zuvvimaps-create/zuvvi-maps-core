import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mapConfig, type MapStyleId } from "@/config/mapConfig";
import { mapService } from "@/services/mapService";
import type { LatLng, Place, RouteGeometry } from "@/types";
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
  const hosts = useRef(new Map<string, HTMLElement>());
  const [hostVersion, setHostVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    mapService
      .init(container, { styleId, center: userLocation, zoom: mapConfig.defaultZoom })
      .then((map) => {
        if (cancelled) return;
        const markReady = () => {
          if (cancelled) return;
          setReady(true);
          onReady?.();
        };
        if (map.loaded()) markReady();
        else map.once("load", markReady);
        // Fallback so markers and UI never wait on a slow tile response.
        map.once("styledata", () => window.setTimeout(markReady, 400));
      })
      .catch((error) => console.error("Map failed to initialise", error));

    return () => {
      cancelled = true;
      hosts.current.clear();
      mapService.destroy();
      setReady(false);
    };
    // Init once; style/center changes are applied through dedicated effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) mapService.setStyle(styleId);
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

      {/* eslint-disable-next-line @eslint-react/no-unstable-context-value */}
      <span className="hidden">{hostVersion}</span>

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
