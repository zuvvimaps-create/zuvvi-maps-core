import { env } from "@/config/env";
import { servicesConfig } from "@/services/config";
import type { IRoutingService } from "@/services/types";
import type { RoutePlan, RouteRequest } from "@/types";
import { postJson } from "./httpClient";

/**
 * Self-hosted routing adapter — built for Valhalla or OSRM behind your own
 * host. Keep the response mapping in your controller so the frontend keeps
 * consuming `RoutePlan[]`.
 *
 *   POST {VITE_ROUTING_API_URL}/route
 *   body: { origin: {lat,lng}, destination: {lat,lng}, profiles: [...] }
 */
export class RestRoutingProvider implements IRoutingService {
  private readonly base = env.routingApiUrl || env.apiUrl;
  private readonly path = servicesConfig.paths.routing;

  route(request: RouteRequest): Promise<RoutePlan[]> {
    return postJson<RoutePlan[]>(this.base, this.path, request);
  }
}
