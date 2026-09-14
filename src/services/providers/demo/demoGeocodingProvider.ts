import { servicesConfig } from "@/services/config";
import { searchHistory } from "@/services/searchHistory";
import type { IGeocodingService } from "@/services/types";
import { distanceMeters } from "@/utils/geo";
import type {
  AutocompleteSuggestion,
  GeocodeResult,
  LatLng,
  RecentSearch,
} from "@/types";
import { demoPlaces, demoStreetNames } from "./demoData";

const delay = (ms = servicesConfig.demoLatencyMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export class DemoGeocodingProvider implements IGeocodingService {
  async search(text: string, near?: LatLng): Promise<GeocodeResult[]> {
    await delay();
    const suggestions = await this.autocomplete(text, near);
    return suggestions.map((s) => ({
      id: s.id,
      formattedAddress: `${s.primaryText} — ${s.secondaryText}`,
      location: s.location,
      kind: s.placeId ? "poi" : "address",
    }));
  }

  async autocomplete(text: string, near?: LatLng): Promise<AutocompleteSuggestion[]> {
    await delay(160);
    const q = normalize(text).trim();
    if (!q) return [];

    const placeMatches: AutocompleteSuggestion[] = demoPlaces
      .filter((place) =>
        normalize([place.name, place.subtitle, place.address, ...place.tags].join(" ")).includes(q),
      )
      .map((place) => ({
        id: `sg-${place.id}`,
        primaryText: place.name,
        secondaryText: place.address,
        location: place.location,
        placeId: place.id,
        category: place.category,
      }));

    const streetMatches: AutocompleteSuggestion[] = demoStreetNames
      .filter((street) => normalize(street).includes(q))
      .map((street, index) => ({
        id: `sg-street-${index}`,
        primaryText: street,
        secondaryText: "Lisboa, Portugal",
        location: {
          lat: 38.7169 + (index - 3) * 0.0035,
          lng: -9.1399 + (index - 3) * 0.0042,
        },
      }));

    const all = [...placeMatches, ...streetMatches];
    if (near) {
      const origin = near;
      all.sort(
        (a, b) => distanceMeters(origin, a.location) - distanceMeters(origin, b.location),
      );
    }
    return all.slice(0, 8);
  }

  async reverse(location: LatLng): Promise<GeocodeResult | null> {
    await delay(160);
    const nearest = demoPlaces
      .map((place) => ({ place, d: distanceMeters(location, place.location) }))
      .sort((a, b) => a.d - b.d)[0];
    if (!nearest) return null;
    const street = demoStreetNames[Math.floor(Math.abs(location.lng * 1000)) % demoStreetNames.length];
    return {
      id: `rev-${location.lat.toFixed(4)}-${location.lng.toFixed(4)}`,
      formattedAddress:
        nearest.d < 120
          ? `${nearest.place.name}, ${nearest.place.address}`
          : `${street ?? "Rua sem nome"}, perto de ${nearest.place.name}`,
      location,
      kind: nearest.d < 120 ? "poi" : "address",
    };
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
