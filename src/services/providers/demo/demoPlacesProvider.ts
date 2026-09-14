import { servicesConfig } from "@/services/config";
import type { IPlacesService } from "@/services/types";
import { distanceMeters } from "@/utils/geo";
import type { CategoryMeta, LatLng, Place, PlaceCollection, PlaceSearchQuery } from "@/types";
import { categoryMeta, demoCollections, demoPlaces } from "./demoData";

const delay = (ms = servicesConfig.demoLatencyMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export class DemoPlacesProvider implements IPlacesService {
  async search(query: PlaceSearchQuery): Promise<Place[]> {
    await delay();
    const text = normalize(query.text ?? "").trim();
    let results = demoPlaces.filter((place) => {
      const matchesCategory =
        !query.categories?.length || query.categories.includes(place.category);
      if (!matchesCategory) return false;
      if (!text) return true;
      const haystack = normalize(
        [place.name, place.subtitle, place.address, ...place.tags].join(" "),
      );
      return haystack.includes(text);
    });

    if (query.near) {
      const near = query.near;
      const radius = (query.radiusKm ?? 50) * 1000;
      results = results
        .filter((place) => distanceMeters(near, place.location) <= radius)
        .sort((a, b) => distanceMeters(near, a.location) - distanceMeters(near, b.location));
    }

    return results.slice(0, query.limit ?? 40);
  }

  async nearby(location: LatLng, radiusKm = 5, limit = 10): Promise<Place[]> {
    await delay(120);
    return demoPlaces
      .map((place) => ({ place, d: distanceMeters(location, place.location) }))
      .filter((entry) => entry.d <= radiusKm * 1000)
      .sort((a, b) => a.d - b.d)
      .slice(0, limit)
      .map((entry) => entry.place);
  }

  async details(placeId: string): Promise<Place | null> {
    await delay(140);
    return demoPlaces.find((place) => place.id === placeId) ?? null;
  }

  async byIds(placeIds: string[]): Promise<Place[]> {
    await delay(120);
    return placeIds
      .map((id) => demoPlaces.find((place) => place.id === id))
      .filter((place): place is Place => Boolean(place));
  }

  async categories(): Promise<CategoryMeta[]> {
    return categoryMeta;
  }

  async collections(): Promise<PlaceCollection[]> {
    await delay(120);
    return demoCollections;
  }
}
