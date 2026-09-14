/** Presentation helpers. Portuguese (pt-BR) copy, metric units. */

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "—";
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(1, Math.round(seconds / 60));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function formatEta(seconds: number, from = Date.now()): string {
  const arrival = new Date(from + seconds * 1000);
  return arrival.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatRating(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

export function formatPriceLevel(level?: 1 | 2 | 3 | 4): string {
  return level ? "€".repeat(level) : "";
}

export function formatReviewCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(".", ",")} mil` : `${count}`;
}
