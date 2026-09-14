/** Domain types shared across the app. Vendor neutral by design. */

export * from "./fleet";

export interface LatLng {
  lat: number;
  lng: number;
}

export type PlaceCategory =
  | "cafe"
  | "restaurant"
  | "market"
  | "pharmacy"
  | "fuel"
  | "health"
  | "hotel"
  | "shop"
  | "park"
  | "transit"
  | "culture";

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
  weeklyHours?: string[];
  phone?: string;
  tags: string[];
  photos: string[];
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
  id: string;
  formattedAddress: string;
  location: LatLng;
  kind: "address" | "poi" | "locality";
}

export interface AutocompleteSuggestion {
  id: string;
  primaryText: string;
  secondaryText: string;
  location: LatLng;
  placeId?: string;
  category?: PlaceCategory;
}

export interface RecentSearch {
  id: string;
  label: string;
  secondary?: string;
  location?: LatLng;
  placeId?: string;
  searchedAt: number;
}

export interface Viewport {
  center: LatLng;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

/* ---------------------------------- routing --------------------------------- */

export type RouteProfile = "fastest" | "shortest" | "eco";

export type ManeuverType =
  | "depart"
  | "straight"
  | "left"
  | "right"
  | "slight-left"
  | "slight-right"
  | "roundabout"
  | "arrive";

export interface RouteStep {
  id: string;
  maneuver: ManeuverType;
  instruction: string;
  streetName: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface RoutePlan {
  id: string;
  profile: RouteProfile;
  label: string;
  summary: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
  steps: RouteStep[];
}

export interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  profiles?: RouteProfile[];
}
