import { servicesConfig } from "./config";
import type { RecentSearch } from "@/types";

/**
 * Recent search history, stored on the device.
 * Provider agnostic: both the demo and REST geocoding adapters reuse it.
 */

const KEY = servicesConfig.recentSearchStorageKey;
const MAX = 8;

function read(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

function write(entries: RecentSearch[]): RecentSearch[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  }
  return entries;
}

export const searchHistory = {
  list: read,
  add(entry: Omit<RecentSearch, "id" | "searchedAt">): RecentSearch[] {
    const next: RecentSearch = {
      ...entry,
      id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      searchedAt: Date.now(),
    };
    const deduped = read().filter(
      (item) => item.label.toLowerCase() !== entry.label.toLowerCase(),
    );
    return write([next, ...deduped].slice(0, MAX));
  },
  remove(id: string): RecentSearch[] {
    return write(read().filter((item) => item.id !== id));
  },
  clear(): RecentSearch[] {
    return write([]);
  },
};
