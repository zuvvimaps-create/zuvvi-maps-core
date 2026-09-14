/** Domain types shared across the app. Vendor neutral by design. */

export interface LatLng {
  lat: number;
  lng: number;
}

export type PlaceCategory = "cafe" | "food" | "park" | "transit" | "shop" | "culture";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  subtitle: string;
  address: string;
  location: LatLng;
  rating: number;
  reviewCount: number;
  priceLevel?: 1 | 2 | 3 | 4;
  openNow: boolean;
  hours: string;
  phone?: string;
  tags: string[];
  photo?: string;
  description: string;
}

export interface PlaceSearchQuery {
  text?: string;
  categories?: PlaceCategory[];
  near?: LatLng;
  radiusKm?: number;
  limit?: number;
}

export interface CategoryMeta {
  id: PlaceCategory;
  label: string;
  /** lucide-react icon name */
  icon: string;
}

export interface PlaceCollection {
  id: string;
  title: string;
  description: string;
  placeIds: string[];
}

export interface GeocodeResult {
  formattedAddress: string;
  location: LatLng;
  kind: "address" | "poi" | "locality";
}

export interface Viewport {
  center: LatLng;
  zoom: number;
  bearing?: number;
  pitch?: number;
}
