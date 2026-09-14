/**
 * Service contracts.
 *
 * The whole app talks to these interfaces only. Providers (demo/mock today,
 * self-hosted REST tomorrow) are wired in `src/services/index.ts` from
 * `src/services/config.ts`. No screen, hook or component ever imports a
 * provider directly, and nothing depends on a proprietary vendor SDK.
 */

import type {
  AutocompleteSuggestion,
  CategoryMeta,
  Driver,
  DriverStatus,
  FareEstimate,
  FleetMetrics,
  GeocodeResult,
  LatLng,
  Place,
  PlaceCollection,
  PlaceSearchQuery,
  PlatformUser,
  RecentSearch,
  RoutePlan,
  RouteRequest,
  Trip,
  TripRequestInput,
  TripStatus,
  VehicleCategory,
  VehicleCategoryId,
  Venue,
} from "@/types";

export interface IPlacesService {
  search(query: PlaceSearchQuery): Promise<Place[]>;
  nearby(location: LatLng, radiusKm?: number, limit?: number): Promise<Place[]>;
  details(placeId: string): Promise<Place | null>;
  byIds(placeIds: string[]): Promise<Place[]>;
  categories(): Promise<CategoryMeta[]>;
  collections(): Promise<PlaceCollection[]>;
}

export interface IGeocodingService {
  search(text: string, near?: LatLng): Promise<GeocodeResult[]>;
  autocomplete(text: string, near?: LatLng): Promise<AutocompleteSuggestion[]>;
  reverse(location: LatLng): Promise<GeocodeResult | null>;
  getRecentSearches(): RecentSearch[];
  addRecentSearch(entry: Omit<RecentSearch, "id" | "searchedAt">): RecentSearch[];
  removeRecentSearch(id: string): RecentSearch[];
  clearRecentSearches(): RecentSearch[];
}

export interface IRoutingService {
  route(request: RouteRequest): Promise<RoutePlan[]>;
}

export interface IDriverService {
  list(): Promise<Driver[]>;
  nearby(location: LatLng, limit?: number): Promise<Driver[]>;
  setStatus(driverId: string, status: DriverStatus): Promise<Driver | null>;
  /** Live position feed. Returns an unsubscribe function. */
  subscribe(listener: (drivers: Driver[]) => void, intervalMs?: number): () => void;
}

export interface ITripService {
  estimate(distanceKm: number, durationMin: number): Promise<FareEstimate[]>;
  categories(): VehicleCategory[];
  request(input: TripRequestInput): Promise<Trip>;
  accept(tripId: string): Promise<Trip | null>;
  updateStatus(tripId: string, status: TripStatus): Promise<Trip | null>;
  get(tripId: string): Promise<Trip | null>;
  history(): Promise<Trip[]>;
  active(): Promise<Trip[]>;
  cancel(tripId: string): Promise<Trip | null>;
}

export interface IAdminService {
  metrics(): Promise<FleetMetrics>;
  users(): Promise<PlatformUser[]>;
  venues(): Promise<Venue[]>;
}

export type { VehicleCategoryId };

export interface ZuvviServiceProviderInfo {
  name: string;
  kind: "demo" | "rest";
  endpoint?: string | undefined;
  simulated: boolean;
}
