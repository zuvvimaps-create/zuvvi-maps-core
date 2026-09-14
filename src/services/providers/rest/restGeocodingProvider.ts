import { env } from "@/config/env";
import { servicesConfig } from "@/services/config";
import { searchHistory } from "@/services/searchHistory";
import type { IGeocodingService } from "@/services/types";
import type { AutocompleteSuggestion, GeocodeResult, LatLng, RecentSearch } from "@/types";
import { getJson } from "./httpClient";

/**
 * Self-hosted geocoding adapter — designed for Nominatim / Photon behind your
 * own host, or your API's `/geocode` controller.
 *
 *   GET {VITE_GEOCODING_API_URL}/search?q=&lat=&lng=
 *   GET {VITE_GEOCODING_API_URL}/autocomplete?q=&lat=&lng=
 *   GET {VITE_GEOCODING_API_URL}/reverse?lat=&lng=
 */
export class RestGeocodingProvider implements IGeocodingService {
  private readonly base = env.geocodingApiUrl || env.apiUrl;
  private readonly path = servicesConfig.paths.geocode;

  search(text: string, near?: LatLng): Promise<GeocodeResult[]> {
    return getJson<GeocodeResult[]>(this.base, `${this.path}/search`, {
      q: text,
      lat: near?.lat,
      lng: near?.lng,
    });
  }

  autocomplete(text: string, near?: LatLng): Promise<AutocompleteSuggestion[]> {
    return getJson<AutocompleteSuggestion[]>(this.base, `${this.path}/autocomplete`, {
      q: text,
      lat: near?.lat,
      lng: near?.lng,
    });
  }

  reverse(location: LatLng): Promise<GeocodeResult | null> {
    return getJson<GeocodeResult | null>(this.base, `${this.path}/reverse`, {
      lat: location.lat,
      lng: location.lng,
    });
  }

  getRecentSearches(): RecentSearch[] {
    return searchHistory.list();
  }

  addRecentSearch(entry: Omit<RecentSearch, "id" | "searchedAt">): RecentSearch[] {
    return searchHistory.add(entry);
  }

  removeRecentSearch(id: string): RecentSearch[] {
    return searchHistory.remove(id);
  }

  clearRecentSearches(): RecentSearch[] {
    return searchHistory.clear();
  }
}
