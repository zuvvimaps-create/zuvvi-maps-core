import { servicesConfig } from "@/services/config";
import type { IRoutingService } from "@/services/types";
import { bearing, distanceMeters, interpolate } from "@/utils/geo";
import { formatDistance } from "@/utils/format";
import type {
  LatLng,
  ManeuverType,
  RouteGeometry,
  RoutePlan,
  RouteProfile,
  RouteRequest,
  RouteStep,
} from "@/types";
import { demoStreetNames } from "./demoData";

const delay = (ms = servicesConfig.demoLatencyMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface ProfileSpec {
  id: RouteProfile;
  label: string;
  summary: string;
  /** Detour factor applied to the straight-line distance. */
  detour: number;
  /** Average speed in km/h. */
  speed: number;
  jitter: number;
}

const PROFILES: Record<RouteProfile, ProfileSpec> = {
  fastest: {
    id: "fastest",
    label: "Mais rápida",
    summary: "Via Av. Principal",
    detour: 1.28,
    speed: 34,
    jitter: 0.0016,
  },
  shortest: {
    id: "shortest",
    label: "Mais curta",
    summary: "Menos pedágios",
    detour: 1.14,
    speed: 24,
    jitter: 0.0009,
  },
  eco: {
    id: "eco",
    label: "Econômica",
    summary: "Menor consumo",
    detour: 1.35,
    speed: 29,
    jitter: 0.0024,
  },
};

const MANEUVERS: ManeuverType[] = [
  "straight",
  "right",
  "slight-left",
  "roundabout",
  "left",
  "slight-right",
];

function buildGeometry(origin: LatLng, destination: LatLng, jitter: number): RouteGeometry {
  const segments = 12;
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = interpolate(origin, destination, t);
    // Sine offset perpendicular-ish to the straight line so the line reads like streets.
    const wave = Math.sin(t * Math.PI * 2.2) * jitter;
    const stagger = i % 2 === 0 ? jitter * 0.35 : -jitter * 0.35;
    coordinates.push([point.lng + wave, point.lat + stagger]);
  }
  coordinates[0] = [origin.lng, origin.lat];
  coordinates[coordinates.length - 1] = [destination.lng, destination.lat];
  return { type: "LineString", coordinates };
}

function buildSteps(
  geometry: RouteGeometry,
  totalDistance: number,
  totalDuration: number,
  profile: RouteProfile,
): RouteStep[] {
  const coords = geometry.coordinates;
  const legCount = 5;
  const steps: RouteStep[] = [];
  const legDistance = totalDistance / legCount;
  const legDuration = totalDuration / legCount;

  steps.push({
    id: `${profile}-step-0`,
    maneuver: "depart",
    instruction: "Siga em frente ao sair",
    streetName: demoStreetNames[0] ?? "Rua local",
    distanceMeters: Math.round(legDistance * 0.6),
    durationSeconds: Math.round(legDuration * 0.6),
  });

  for (let i = 1; i < legCount; i += 1) {
    const maneuver = MANEUVERS[i % MANEUVERS.length] ?? "straight";
    const street = demoStreetNames[(i + profile.length) % demoStreetNames.length] ?? "Rua local";
    steps.push({
      id: `${profile}-step-${i}`,
      maneuver,
      instruction: instructionFor(maneuver, street),
      streetName: street,
      distanceMeters: Math.round(legDistance),
      durationSeconds: Math.round(legDuration),
    });
  }

  const last = coords[coords.length - 1];
  const previous = coords[coords.length - 2] ?? last;
  const finalBearing =
    last && previous
      ? bearing({ lat: previous[1], lng: previous[0] }, { lat: last[1], lng: last[0] })
      : 0;

  steps.push({
    id: `${profile}-step-arrive`,
    maneuver: "arrive",
    instruction: `Você chegou ao destino (${formatDistance(legDistance * 0.4)} finais)`,
    streetName: finalBearing > 0 ? "Destino à direita" : "Destino à esquerda",
    distanceMeters: Math.round(legDistance * 0.4),
    durationSeconds: Math.round(legDuration * 0.4),
  });

  return steps;
}

function instructionFor(maneuver: ManeuverType, street: string): string {
  switch (maneuver) {
    case "left":
      return `Vire à esquerda na ${street}`;
    case "right":
      return `Vire à direita na ${street}`;
    case "slight-left":
      return `Mantenha-se à esquerda na ${street}`;
    case "slight-right":
      return `Mantenha-se à direita na ${street}`;
    case "roundabout":
      return `Na rotatória, pegue a 2ª saída para a ${street}`;
    case "arrive":
      return "Você chegou ao destino";
    case "depart":
      return `Siga pela ${street}`;
    default:
      return `Continue pela ${street}`;
  }
}

/**
 * Simulated routing. Swap for self-hosted Valhalla or OSRM by setting
 * VITE_ROUTING_API_URL — the REST adapter returns the same RoutePlan shape.
 */
export class DemoRoutingProvider implements IRoutingService {
  async route(request: RouteRequest): Promise<RoutePlan[]> {
    await delay(320);
    const straight = distanceMeters(request.origin, request.destination);
    const profiles = request.profiles ?? ["fastest", "shortest", "eco"];

    return profiles.map((profileId) => {
      const spec = PROFILES[profileId];
      const distance = Math.max(240, straight * spec.detour);
      const duration = (distance / 1000 / spec.speed) * 3600;
      const geometry = buildGeometry(request.origin, request.destination, spec.jitter);
      return {
        id: `route-${profileId}`,
        profile: spec.id,
        label: spec.label,
        summary: spec.summary,
        distanceMeters: Math.round(distance),
        durationSeconds: Math.round(duration),
        geometry,
        steps: buildSteps(geometry, distance, duration, profileId),
      };
    });
  }
}
