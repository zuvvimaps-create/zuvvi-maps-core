import type { LatLng, RouteGeometry } from "./index";
import type { UserRole } from "./database";

export type { UserRole };

export type VehicleCategoryId = "go" | "comfort" | "black";

export interface VehicleCategory {
  id: VehicleCategoryId;
  name: string;
  tagline: string;
  seats: number;
  /** Multiplier applied to the base fare estimate. */
  fareMultiplier: number;
  etaMinutes: number;
}

export interface Vehicle {
  model: string;
  plate: string;
  color: string;
  category: VehicleCategoryId;
}

export type DriverStatus = "online" | "offline" | "on_trip";

export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
  currentLocation: LatLng;
  /** Degrees clockwise from north — drives marker rotation. */
  heading: number;
  speed: number;
  vehicle: Vehicle;
  currentTripId: string | null;
  rating: number;
  avatar: string;
  tripsToday: number;
}

export type TripStatus =
  "requested" | "accepted" | "going_to_pickup" | "in_progress" | "completed" | "cancelled";

export interface TripEndpoint {
  label: string;
  address: string;
  location: LatLng;
}

export interface TripPassenger {
  id: string;
  name: string;
  phone: string;
}

export interface TripDriverRef {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  vehicle: Vehicle;
}

export interface Trip {
  tripId: string;
  passenger: TripPassenger;
  driver: TripDriverRef | null;
  origin: TripEndpoint;
  destination: TripEndpoint;
  distanceKm: number;
  durationMin: number;
  fare: number;
  currency: string;
  category: VehicleCategoryId;
  status: TripStatus;
  routeGeometry: RouteGeometry | null;
  timestamps: {
    requestedAt: string;
    acceptedAt?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    cancelledAt?: string | undefined;
  };
}

export interface TripRequestInput {
  passenger: TripPassenger;
  origin: TripEndpoint;
  destination: TripEndpoint;
  category: VehicleCategoryId;
  distanceKm: number;
  durationMin: number;
  routeGeometry: RouteGeometry | null;
}

export interface FareEstimate {
  category: VehicleCategory;
  fare: number;
  currency: string;
  etaMinutes: number;
}

export interface SavedPlace {
  id: string;
  label: string;
  kind: "home" | "work" | "custom";
  address: string;
  location: LatLng;
  placeId?: string | undefined;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  trips: number;
  joinedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  owner: string;
  category: string;
  address: string;
  location: LatLng;
  rating: number;
  status: "active" | "review" | "paused";
}

export interface FleetMetrics {
  activeDrivers: number;
  onlineDrivers: number;
  ongoingTrips: number;
  completedTrips: number;
  revenue: number;
  currency: string;
  systemStatus: "operational" | "degraded" | "maintenance";
  averageRating: number;
}
