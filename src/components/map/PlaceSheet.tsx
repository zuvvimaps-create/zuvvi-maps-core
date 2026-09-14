import { useState } from "react";
import {
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance, formatDuration, formatRating, formatReviewCount } from "@/utils/format";
import { distanceMeters } from "@/utils/geo";
import type { LatLng, Place } from "@/types";
import { categoryIcons } from "./MapPin";
import { categoryMeta } from "@/services/providers/demo/demoData";

interface PlaceSheetProps {
  place: Place | null;
  userLocation: LatLng;
  nearby: Place[];
  isSaved: boolean;
  onClose: () => void;
  onRoute: (place: Place) => void;
  onSave: (place: Place) => void;
  onShare: (place: Place) => void;
  onSelectNearby: (place: Place) => void;
}

export function PlaceSheet({
  place,
  userLocation,
  nearby,
  isSaved,
  onClose,
  onRoute,
  onSave,
  onShare,
  onSelectNearby,
}: PlaceSheetProps) {
  const [expanded, setExpanded] = useState(false);

  if (!place) return null;

  const meters = distanceMeters(userLocation, place.location);
  const driveMinutes = Math.max(2, Math.round((meters / 1000 / 24) * 60));
  const category = categoryMeta.find((item) => item.id === place.category);
  const Icon = categoryIcons[place.category];
  const photo = place.photos[0];

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-3 pb-24">
      <div
        className={cn(
          "glass mx-auto max-w-md overflow-hidden rounded-3xl shadow-e3 transition-all duration-300 animate-slide-in-bottom",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "Recolher" : "Expandir"}
            className="mx-auto flex flex-col items-center gap-1"
          >
            <span className="h-1.5 w-12 rounded-full bg-border-strong" />
          </button>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="absolute right-4 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 px-4 pt-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border">
            {photo ? (
              <img
                src={photo}
                alt={place.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="gradient-brand grid h-full w-full place-items-center text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Icon className="h-3 w-3" />
                {category?.label ?? place.subtitle}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  place.openNow
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {place.openNow ? "Aberto" : "Fechado"}
              </span>
            </div>

            <h2 className="mt-1 truncate font-display text-lg font-bold text-foreground">
              {place.name}
            </h2>

            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-warning">
                <Star className="h-3.5 w-3.5 fill-current" />
                {formatRating(place.rating)}
              </span>
              <span>{formatReviewCount(place.reviewCount)}</span>
              <span className="text-border-strong">·</span>
              <span className="font-semibold text-foreground">{formatDistance(meters)}</span>
              <span>{formatDuration(driveMinutes * 60)}</span>
            </div>

            <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{place.address}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => onRoute(place)}
            className="gradient-brand flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-95"
          >
            <Navigation className="h-4 w-4" strokeWidth={2.6} />
            Ir
          </button>
          <button
            type="button"
            onClick={() => onSave(place)}
            className={cn(
              "flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-colors",
              isSaved
                ? "border-warning/40 bg-warning/15 text-warning"
                : "border-border-strong bg-secondary text-foreground hover:text-primary",
            )}
          >
            <Star className={cn("h-4 w-4", isSaved && "fill-current")} />
            {isSaved ? "Salvo" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => onShare(place)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-secondary text-sm font-bold text-foreground transition-colors hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {expanded ? "Menos detalhes" : "Mais detalhes"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>

        {expanded ? (
          <div className="max-h-[46vh] overflow-y-auto px-4 pb-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{place.description}</p>

            {place.photos.length > 1 ? (
              <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
                {place.photos.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={place.name}
                    loading="lazy"
                    className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-foreground">{place.hours}</span>
              </div>
              {place.phone ? (
                <a
                  href={`tel:${place.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs text-foreground transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {place.phone}
                </a>
              ) : null}
            </div>

            {place.weeklyHours?.length ? (
              <ul className="mt-3 flex flex-col gap-1 rounded-xl border border-border p-3">
                {place.weeklyHours.map((line) => (
                  <li key={line} className="text-[11px] text-muted-foreground">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {nearby.length ? (
              <section className="mt-4">
                <h3 className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Recomendados por perto
                </h3>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {nearby.map((item) => {
                    const NearbyIcon = categoryIcons[item.category];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectNearby(item)}
                        className="flex w-40 shrink-0 flex-col gap-1 rounded-2xl border border-border bg-surface/70 p-3 text-left transition-shadow hover:shadow-glow"
                      >
                        <span className="flex items-center gap-1.5 text-primary">
                          <NearbyIcon className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {item.subtitle}
                          </span>
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRating(item.rating)} ·{" "}
                          {formatDistance(distanceMeters(place.location, item.location))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
