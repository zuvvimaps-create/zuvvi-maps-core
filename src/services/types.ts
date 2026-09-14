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
  GeocodeResult,
  LatLng,
  Place,
  PlaceCollection,
  PlaceSearchQuery,
  RecentSearch,
  RoutePlan,
  RouteRequest,
} from "@/types";

export interface IPlacesService {
  /** Text + category + proximity search. */
  search(query: PlaceSearchQuery): Promise<Place[]>;
  /** Places around a point, nearest first. */
  nearby(location: LatLng, radiusKm?: number, limit?: number): Promise<Place[]>;
  /** Full detail record: hours, contact, photo gallery, ratings. */
  details(placeId: string): Promise<Place | null>;
  /** Batch lookup, used by the saved list and collections. */
  byIds(placeIds: string[]): Promise<Place[]>;
  /** Available categories for filter chips. */
  categories(): Promise<CategoryMeta[]>;
  /** Editorial groupings for the Explore screen. */
  collections(): Promise<PlaceCollection[]>;
}

export interface IGeocodingService {
  /** Forward geocoding: free text to located results. */
  search(text: string, near?: LatLng): Promise<GeocodeResult[]>;
  /** Type-ahead suggestions while the user types. */
  autocomplete(text: string, near?: LatLng): Promise<AutocompleteSuggestion[]>;
  /** Coordinates to a human readable address. */
  reverse(location: LatLng): Promise<GeocodeResult | null>;
  /** Recent search history (persisted locally on the device). */
  getRecentSearches(): RecentSearch[];
  addRecentSearch(entry: Omit<RecentSearch, "id" | "searchedAt">): RecentSearch[];
  removeRecentSearch(id: string): RecentSearch[];
  clearRecentSearches(): RecentSearch[];
}

export interface IRoutingService {
  /** One plan per requested profile, cheapest-effort first. */
  route(request: RouteRequest): Promise<RoutePlan[]>;
}

export interface ZuvviServiceProviderInfo {
  name: string;
  kind: "demo" | "rest";
  endpoint?: string;
}
