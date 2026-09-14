/**
 * Service registry — the only place providers are chosen.
 *
 * Screens and hooks import these singletons and never a provider directly, so
 * pointing Zuvvi at self-hosted infrastructure (PostGIS + Martin tiles,
 * Valhalla routing, Nominatim geocoding, your own REST API) is a config change.
 */

import { env, isSimulated } from "@/config/env";
import { servicesConfig } from "./config";
import { DemoGeocodingProvider } from "./providers/demo/demoGeocodingProvider";
import { DemoPlacesProvider } from "./providers/demo/demoPlacesProvider";
import { DemoRoutingProvider } from "./providers/demo/demoRoutingProvider";
import {
  DemoAdminProvider,
  DemoDriverProvider,
  DemoTripProvider,
} from "./providers/demo/demoFleetProviders";
import { RestGeocodingProvider } from "./providers/rest/restGeocodingProvider";
import { RestPlacesProvider } from "./providers/rest/restPlacesProvider";
import { RestRoutingProvider } from "./providers/rest/restRoutingProvider";
import type {
  IAdminService,
  IDriverService,
  IGeocodingService,
  IPlacesService,
  IRoutingService,
  ITripService,
  ZuvviServiceProviderInfo,
} from "./types";

const useRestPlaces = servicesConfig.provider === "rest" || Boolean(env.apiUrl);
const useRestGeocoding = useRestPlaces || Boolean(env.geocodingApiUrl);
const useRestRouting = useRestPlaces || Boolean(env.routingApiUrl);

export const PlacesService: IPlacesService = useRestPlaces
  ? new RestPlacesProvider()
  : new DemoPlacesProvider();

export const GeocodingService: IGeocodingService = useRestGeocoding
  ? new RestGeocodingProvider()
  : new DemoGeocodingProvider();

export const RoutingService: IRoutingService = useRestRouting
  ? new RestRoutingProvider()
  : new DemoRoutingProvider();

/** Fleet modules ship simulated today; the contracts are REST-ready. */
export const DriverService: IDriverService = new DemoDriverProvider();
export const TripService: ITripService = new DemoTripProvider();
export const AdminService: IAdminService = new DemoAdminProvider();

export const serviceProviders: ZuvviServiceProviderInfo[] = [
  {
    name: "PlacesService",
    kind: useRestPlaces ? "rest" : "demo",
    endpoint: env.apiUrl || undefined,
    simulated: isSimulated.places,
  },
  {
    name: "GeocodingService",
    kind: useRestGeocoding ? "rest" : "demo",
    endpoint: env.geocodingApiUrl || env.apiUrl || undefined,
    simulated: isSimulated.geocoding,
  },
  {
    name: "RoutingService",
    kind: useRestRouting ? "rest" : "demo",
    endpoint: env.routingApiUrl || env.apiUrl || undefined,
    simulated: isSimulated.routing,
  },
  { name: "DriverService", kind: "demo", simulated: true },
  { name: "TripService", kind: "demo", simulated: true },
  { name: "AdminService", kind: "demo", simulated: true },
];

export type {
  IAdminService,
  IDriverService,
  IGeocodingService,
  IPlacesService,
  IRoutingService,
  ITripService,
};
