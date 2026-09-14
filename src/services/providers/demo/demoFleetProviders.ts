import type { IAdminService, IDriverService, ITripService } from "@/services/types";
import { distanceMeters } from "@/utils/geo";
import type {
  Driver,
  DriverStatus,
  FareEstimate,
  FleetMetrics,
  LatLng,
  PlatformUser,
  Trip,
  TripRequestInput,
  TripStatus,
  VehicleCategory,
  Venue,
} from "@/types";
import { demoDrivers, demoPlatformUsers, demoVenues, vehicleCategories } from "./demoData";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_FARE = 2.4;
const PER_KM = 0.92;
const PER_MIN = 0.24;

/** In-memory live fleet. Replace with your `/drivers` REST endpoint + websocket. */
class DemoFleetState {
  drivers: Driver[] = demoDrivers.map((driver) => ({ ...driver }));
  trips: Trip[] = [];

  tick() {
    this.drivers = this.drivers.map((driver) => {
      if (driver.status === "offline") return driver;
      const headingDrift = (Math.random() - 0.5) * 26;
      const heading = (driver.heading + headingDrift + 360) % 360;
      const speed = Math.max(8, Math.min(62, driver.speed + (Math.random() - 0.5) * 12));
      const rad = (heading * Math.PI) / 180;
      const stepDeg = (speed / 3600) * 0.0055;
      return {
        ...driver,
        heading,
        speed: Math.round(speed),
        currentLocation: {
          lat: driver.currentLocation.lat + Math.cos(rad) * stepDeg,
          lng: driver.currentLocation.lng + Math.sin(rad) * stepDeg,
        },
      };
    });
    return this.drivers;
  }
}

const state = new DemoFleetState();

export class DemoDriverProvider implements IDriverService {
  async list(): Promise<Driver[]> {
    await delay(140);
    return state.drivers;
  }

  async nearby(location: LatLng, limit = 6): Promise<Driver[]> {
    await delay(140);
    return state.drivers
      .filter((driver) => driver.status !== "offline")
      .sort(
        (a, b) =>
          distanceMeters(location, a.currentLocation) - distanceMeters(location, b.currentLocation),
      )
      .slice(0, limit);
  }

  async setStatus(driverId: string, status: DriverStatus): Promise<Driver | null> {
    await delay(120);
    state.drivers = state.drivers.map((driver) =>
      driver.id === driverId ? { ...driver, status } : driver,
    );
    return state.drivers.find((driver) => driver.id === driverId) ?? null;
  }

  subscribe(listener: (drivers: Driver[]) => void, intervalMs = 2000): () => void {
    listener(state.drivers);
    const id = setInterval(() => listener(state.tick()), intervalMs);
    return () => clearInterval(id);
  }
}

const nowIso = () => new Date().toISOString();

export class DemoTripProvider implements ITripService {
  categories(): VehicleCategory[] {
    return vehicleCategories;
  }

  async estimate(distanceKm: number, durationMin: number): Promise<FareEstimate[]> {
    await delay(180);
    const base = BASE_FARE + distanceKm * PER_KM + durationMin * PER_MIN;
    return vehicleCategories.map((category) => ({
      category,
      fare: Math.round(base * category.fareMultiplier * 100) / 100,
      currency: "EUR",
      etaMinutes: category.etaMinutes,
    }));
  }

  async request(input: TripRequestInput): Promise<Trip> {
    await delay(320);
    const category =
      vehicleCategories.find((c) => c.id === input.category) ?? vehicleCategories[0]!;
    const base = BASE_FARE + input.distanceKm * PER_KM + input.durationMin * PER_MIN;
    const trip: Trip = {
      tripId: `trp-${Date.now().toString().slice(-6)}`,
      passenger: input.passenger,
      driver: null,
      origin: input.origin,
      destination: input.destination,
      distanceKm: Math.round(input.distanceKm * 10) / 10,
      durationMin: Math.round(input.durationMin),
      fare: Math.round(base * category.fareMultiplier * 100) / 100,
      currency: "EUR",
      category: category.id,
      status: "requested",
      routeGeometry: input.routeGeometry,
      timestamps: { requestedAt: nowIso() },
    };
    state.trips = [trip, ...state.trips];
    return trip;
  }

  async accept(tripId: string): Promise<Trip | null> {
    await delay(260);
    const trip = state.trips.find((t) => t.tripId === tripId);
    if (!trip) return null;
    const available =
      state.drivers.find(
        (driver) => driver.status === "online" && driver.vehicle.category === trip.category,
      ) ?? state.drivers.find((driver) => driver.status === "online");
    if (!available) return trip;

    state.drivers = state.drivers.map((driver) =>
      driver.id === available.id
        ? { ...driver, status: "on_trip", currentTripId: trip.tripId }
        : driver,
    );

    return this.patch(tripId, {
      driver: {
        id: available.id,
        name: available.name,
        rating: available.rating,
        avatar: available.avatar,
        vehicle: available.vehicle,
      },
      status: "accepted",
      timestamps: { ...trip.timestamps, acceptedAt: nowIso() },
    });
  }

  async updateStatus(tripId: string, status: TripStatus): Promise<Trip | null> {
    await delay(180);
    const trip = state.trips.find((t) => t.tripId === tripId);
    if (!trip) return null;
    const timestamps = { ...trip.timestamps };
    if (status === "in_progress") timestamps.startedAt = nowIso();
    if (status === "completed") timestamps.completedAt = nowIso();
    if (status === "cancelled") timestamps.cancelledAt = nowIso();

    if (status === "completed" || status === "cancelled") {
      state.drivers = state.drivers.map((driver) =>
        driver.currentTripId === tripId
          ? { ...driver, status: "online", currentTripId: null }
          : driver,
      );
    }
    return this.patch(tripId, { status, timestamps });
  }

  async cancel(tripId: string): Promise<Trip | null> {
    return this.updateStatus(tripId, "cancelled");
  }

  async get(tripId: string): Promise<Trip | null> {
    await delay(120);
    return state.trips.find((trip) => trip.tripId === tripId) ?? null;
  }

  async history(): Promise<Trip[]> {
    await delay(180);
    return [...state.trips, ...seedTrips];
  }

  async active(): Promise<Trip[]> {
    await delay(140);
    return [...state.trips, ...seedTrips].filter(
      (trip) => trip.status !== "completed" && trip.status !== "cancelled",
    );
  }

  private patch(tripId: string, patch: Partial<Trip>): Trip | null {
    state.trips = state.trips.map((trip) =>
      trip.tripId === tripId ? { ...trip, ...patch } : trip,
    );
    return state.trips.find((trip) => trip.tripId === tripId) ?? null;
  }
}

const seedTrips: Trip[] = [
  {
    tripId: "trp-1001",
    passenger: { id: "usr-01", name: "Ana Duarte", phone: "+351 912 000 111" },
    driver: {
      id: "drv-02",
      name: "Rui Bettencourt",
      rating: 4.88,
      avatar: "RB",
      vehicle: {
        model: "Toyota Corolla",
        plate: "ZV-08-BR",
        color: "Prata",
        category: "comfort",
      },
    },
    origin: {
      label: "Casa",
      address: "Rua do Alecrim 21",
      location: { lat: 38.7091, lng: -9.1445 },
    },
    destination: {
      label: "Estação Central",
      address: "Praça Central",
      location: { lat: 38.7201, lng: -9.1301 },
    },
    distanceKm: 3.4,
    durationMin: 11,
    fare: 9.4,
    currency: "EUR",
    category: "comfort",
    status: "in_progress",
    routeGeometry: null,
    timestamps: {
      requestedAt: "2026-09-14T18:41:00.000Z",
      acceptedAt: "2026-09-14T18:42:10.000Z",
      startedAt: "2026-09-14T18:47:02.000Z",
    },
  },
  {
    tripId: "trp-1002",
    passenger: { id: "usr-05", name: "Beatriz Rocha", phone: "+351 933 220 908" },
    driver: {
      id: "drv-05",
      name: "Cláudia Reis",
      rating: 4.82,
      avatar: "CR",
      vehicle: {
        model: "Peugeot 508",
        plate: "ZV-31-CR",
        color: "Branco",
        category: "comfort",
      },
    },
    origin: {
      label: "Empório Central",
      address: "Av. da Liberdade 118",
      location: { lat: 38.7223, lng: -9.1451 },
    },
    destination: {
      label: "Grand Hotel Royal",
      address: "Praça do Comércio 8",
      location: { lat: 38.7075, lng: -9.1364 },
    },
    distanceKm: 2.8,
    durationMin: 9,
    fare: 8.1,
    currency: "EUR",
    category: "comfort",
    status: "going_to_pickup",
    routeGeometry: null,
    timestamps: {
      requestedAt: "2026-09-14T18:52:00.000Z",
      acceptedAt: "2026-09-14T18:53:30.000Z",
    },
  },
  {
    tripId: "trp-0994",
    passenger: { id: "usr-01", name: "Ana Duarte", phone: "+351 912 000 111" },
    driver: {
      id: "drv-01",
      name: "Marina Alves",
      rating: 4.94,
      avatar: "MA",
      vehicle: {
        model: "Tesla Model 3",
        plate: "ZV-14-QA",
        color: "Grafite",
        category: "black",
      },
    },
    origin: {
      label: "Trabalho",
      address: "Av. da Liberdade 200",
      location: { lat: 38.7248, lng: -9.1461 },
    },
    destination: {
      label: "Bistrô Sapphire",
      address: "Rua Garrett 42",
      location: { lat: 38.7106, lng: -9.1417 },
    },
    distanceKm: 2.1,
    durationMin: 8,
    fare: 12.6,
    currency: "EUR",
    category: "black",
    status: "completed",
    routeGeometry: null,
    timestamps: {
      requestedAt: "2026-09-13T20:02:00.000Z",
      acceptedAt: "2026-09-13T20:03:10.000Z",
      startedAt: "2026-09-13T20:06:44.000Z",
      completedAt: "2026-09-13T20:15:12.000Z",
    },
  },
  {
    tripId: "trp-0987",
    passenger: { id: "usr-01", name: "Ana Duarte", phone: "+351 912 000 111" },
    driver: {
      id: "drv-03",
      name: "Sofia Lima",
      rating: 4.91,
      avatar: "SL",
      vehicle: {
        model: "Renault Zoe",
        plate: "ZV-52-LM",
        color: "Azul",
        category: "go",
      },
    },
    origin: {
      label: "Parque Miradouro",
      address: "Alto do Parque",
      location: { lat: 38.7283, lng: -9.1509 },
    },
    destination: {
      label: "Casa",
      address: "Rua do Alecrim 21",
      location: { lat: 38.7091, lng: -9.1445 },
    },
    distanceKm: 4.6,
    durationMin: 15,
    fare: 7.9,
    currency: "EUR",
    category: "go",
    status: "completed",
    routeGeometry: null,
    timestamps: {
      requestedAt: "2026-09-11T09:12:00.000Z",
      acceptedAt: "2026-09-11T09:13:02.000Z",
      startedAt: "2026-09-11T09:16:20.000Z",
      completedAt: "2026-09-11T09:31:48.000Z",
    },
  },
];

export class DemoAdminProvider implements IAdminService {
  async metrics(): Promise<FleetMetrics> {
    await delay(160);
    const online = state.drivers.filter((d) => d.status === "online").length;
    const onTrip = state.drivers.filter((d) => d.status === "on_trip").length;
    const all = [...state.trips, ...seedTrips];
    const completed = all.filter((t) => t.status === "completed");
    const ongoing = all.filter((t) => t.status !== "completed" && t.status !== "cancelled");
    return {
      activeDrivers: online + onTrip,
      onlineDrivers: online,
      ongoingTrips: ongoing.length,
      completedTrips: completed.length + 1_284,
      revenue: Math.round((completed.reduce((sum, t) => sum + t.fare, 0) + 18_942.6) * 100) / 100,
      currency: "EUR",
      systemStatus: "operational",
      averageRating:
        Math.round(
          (state.drivers.reduce((sum, d) => sum + d.rating, 0) / state.drivers.length) * 100,
        ) / 100,
    };
  }

  async users(): Promise<PlatformUser[]> {
    await delay(140);
    return demoPlatformUsers;
  }

  async venues(): Promise<Venue[]> {
    await delay(140);
    return demoVenues;
  }
}
