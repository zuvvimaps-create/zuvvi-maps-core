import { useCallback, useEffect, useState } from "react";
import { servicesConfig } from "@/services/config";
import type { LatLng, Place, SavedPlace } from "@/types";

const KEY = servicesConfig.savedPlacesStorageKey;

const defaults: SavedPlace[] = [
  {
    id: "sp-home",
    label: "Casa",
    kind: "home",
    address: "Rua do Alecrim 21, Lisboa",
    location: { lat: 38.7091, lng: -9.1445 },
  },
  {
    id: "sp-work",
    label: "Trabalho",
    kind: "work",
    address: "Av. da Liberdade 200, Lisboa",
    location: { lat: 38.7248, lng: -9.1461 },
  },
];

function read(): SavedPlace[] {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedPlace[]) : defaults;
  } catch {
    return defaults;
  }
}

/** Favourites and shortcuts (Casa, Trabalho, custom), stored on the device. */
export function useSavedPlaces() {
  const [saved, setSaved] = useState<SavedPlace[]>(defaults);

  useEffect(() => {
    setSaved(read());
  }, []);

  const persist = useCallback((next: SavedPlace[]) => {
    setSaved(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    }
    return next;
  }, []);

  const isSaved = useCallback(
    (placeId: string) => saved.some((item) => item.placeId === placeId),
    [saved],
  );

  const toggleePlace = useCallback(
    (place: Place) => {
      const existing = saved.find((item) => item.placeId === place.id);
      if (existing) {
        persist(saved.filter((item) => item.id !== existing.id));
        return false;
      }
      persist([
        ...saved,
        {
          id: `sp-${place.id}`,
          label: place.name,
          kind: "custom",
          address: place.address,
          location: place.location,
          placeId: place.id,
        },
      ]);
      return true;
    },
    [persist, saved],
  );

  const addShortcut = useCallback(
    (label: string, address: string, location: LatLng) =>
      persist([
        ...saved,
        {
          id: `sp-${Date.now()}`,
          label,
          kind: "custom",
          address,
          location,
        },
      ]),
    [persist, saved],
  );

  const remove = useCallback(
    (id: string) => persist(saved.filter((item) => item.id !== id)),
    [persist, saved],
  );

  return { saved, isSaved, togglePlace: toggleePlace, addShortcut, remove };
}
