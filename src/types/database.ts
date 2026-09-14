/**
 * Database-shaped models (PostgreSQL + PostGIS ready).
 *
 * Geometry columns are represented as GeoJSON, which is exactly what
 * `ST_AsGeoJSON(geom)` returns and what MapLibre consumes — so the same
 * payload travels from PostGIS to the map with no conversion layer.
 */

export interface GeoJsonPoint {
  type: "Point";
  /** [longitude, latitude] — GeoJSON axis order. */
  coordinates: [number, number];
}

export interface GeoJsonLineString {
  type: "LineString";
  coordinates: [number, number][];
}

export type UserRole = "user" | "driver" | "business_owner" | "admin";

/** public.profiles */
export interface DbProfile {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

/** public.venues — business owner places, geom geography(Point, 4326) */
export interface DbVenue {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  address: string;
  geom: GeoJsonPoint;
  rating: number;
  review_count: number;
  open_now: boolean;
  phone: string | null;
  created_at: string;
}

/** public.drivers — geom geography(Point, 4326), updated by live pings */
export interface DbDriver {
  id: string;
  profile_id: string;
  name: string;
  status: "online" | "offline" | "on_trip";
  geom: GeoJsonPoint;
  heading: number;
  speed_kmh: number;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_color: string;
  vehicle_category: "go" | "comfort" | "black";
  current_trip_id: string | null;
  rating: number;
  avatar_url: string | null;
  updated_at: string;
}

/** public.trips — route_geom geography(LineString, 4326) */
export interface DbTrip {
  trip_id: string;
  passenger_id: string;
  driver_id: string | null;
  origin_geom: GeoJsonPoint;
  destination_geom: GeoJsonPoint;
  origin_label: string;
  destination_label: string;
  distance_km: number;
  duration_min: number;
  fare: number;
  currency: string;
  vehicle_category: "go" | "comfort" | "black";
  status:
    | "requested"
    | "accepted"
    | "going_to_pickup"
    | "in_progress"
    | "completed"
    | "cancelled";
  route_geom: GeoJsonLineString | null;
  requested_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

/** public.saved_places */
export interface DbSavedPlace {
  id: string;
  profile_id: string;
  label: string;
  kind: "home" | "work" | "custom";
  place_id: string | null;
  address: string;
  geom: GeoJsonPoint;
  created_at: string;
}

/**
 * Suggested spatial indexes:
 *   CREATE INDEX drivers_geom_idx ON public.drivers USING GIST (geom);
 *   CREATE INDEX venues_geom_idx  ON public.venues  USING GIST (geom);
 *   CREATE INDEX trips_route_idx  ON public.trips   USING GIST (route_geom);
 */
