import { env } from "@/config/env";
import { servicesConfig } from "@/services/config";
import type { IPlacesService } from "@/services/types";
import type { CategoryMeta, LatLng, Place, PlaceCollection, PlaceSearchQuery } from "@/types";
import { categoryMeta } from "../demo/demoData";
import { getJson } from "./httpClient";

/**
 * Self-hosted REST adapter. Expects your API to return the same DTOs the
 * contracts describe (a thin controller over PostGIS does this in a few lines).
 *
 *   GET {VITE_API_URL}/places?q=&categories=&lat=&lng=&radius_km=&limit=
 *   GET {VITE_API_URL}/places/:id
 *   GET {VITE_API_URL}/places/batch?ids=a,b,c
 *   GET {VITE_API_URL}/places/categories
 *   GET {VITE_API_URL}/places/collections
 */
export class RestPlacesProvider implements IPlacesService {
  private readonly base = env.apiUrl;
  private readonly path = servicesConfig.paths.places;

  search(query: PlaceSearchQuery): Promise<Place[]> {
    return getJson<Place[]>(this.base, this.path, {
      q: query.text,
      categories: query.categories?.join(","),
      lat: query.near?.lat,
      lng: query.near?.lng,
      radius_km: query.radiusKm,
      limit: query.limit,
    });
  }

  nearby(location: LatLng, radiusKm = 5, limit = 10): Promise<Place[]> {
    return getJson<Place[]>(this.base, `${this.path}/nearby`, {
      lat: location.lat,
      lng: location.lng,
      radius_km: radiusKm,
      limit,
    });
  }

  details(placeId: string): Promise<Place | null> {
    return getJson<Place | null>(this.base, `${this.path}/${placeId}`);
  }

  byIds(placeIds: string[]): Promise<Place[]> {
    return getJson<Place[]>(this.base, `${this.path}/batch`, { ids: placeIds.join(",") });
  }

  async categories(): Promise<CategoryMeta[]> {
    try {
      return await getJson<CategoryMeta[]>(this.base, `${this.path}/categories`);
    } catch {
      return categoryMeta;
    }
  }

  collections(): Promise<PlaceCollection[]> {
    return getJson<PlaceCollection[]>(this.base, `${this.path}/collections`);
  }
}
