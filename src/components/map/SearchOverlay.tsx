import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, MapPin, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeocodingService, PlacesService } from "@/services";
import { formatDistance } from "@/utils/format";
import { distanceMeters } from "@/utils/geo";
import type {
  AutocompleteSuggestion,
  LatLng,
  Place,
  PlaceCategory,
  RecentSearch,
} from "@/types";
import { categoryIcons } from "./MapPin";

const chips: { id: PlaceCategory; label: string }[] = [
  { id: "cafe", label: "Cafés" },
  { id: "restaurant", label: "Restaurantes" },
  { id: "market", label: "Mercados" },
  { id: "pharmacy", label: "Farmácias" },
  { id: "fuel", label: "Postos" },
];

interface SearchOverlayProps {
  open: boolean;
  userLocation: LatLng;
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  onSelectLocation: (label: string, location: LatLng) => void;
}

export function SearchOverlay({
  open,
  userLocation,
  onClose,
  onSelectPlace,
  onSelectLocation,
}: SearchOverlayProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [results, setResults] = useState<Place[]>([]);
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecents(GeocodingService.getRecentSearches());
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const trimmed = text.trim();

    if (!trimmed && !category) {
      setSuggestions([]);
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const [nextSuggestions, nextResults] = await Promise.all([
          trimmed
            ? GeocodingService.autocomplete(trimmed, userLocation)
            : Promise.resolve([] as AutocompleteSuggestion[]),
          PlacesService.search({
            text: trimmed || undefined,
            categories: category ? [category] : undefined,
            near: userLocation,
            limit: 8,
          }),
        ]);
        if (cancelled) return;
        setSuggestions(nextSuggestions);
        setResults(nextResults);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, text, category, userLocation]);

  const rows = useMemo(() => results, [results]);

  const commitPlace = useCallback(
    (place: Place) => {
      setRecents(
        GeocodingService.addRecentSearch({
          label: place.name,
          secondary: place.address,
          location: place.location,
          placeId: place.id,
        }),
      );
      onSelectPlace(place);
      onClose();
      setText("");
      setCategory(null);
    },
    [onClose, onSelectPlace],
  );

  const commitSuggestion = useCallback(
    async (suggestion: AutocompleteSuggestion) => {
      if (suggestion.placeId) {
        const place = await PlacesService.details(suggestion.placeId);
        if (place) {
          commitPlace(place);
          return;
        }
      }
      setRecents(
        GeocodingService.addRecentSearch({
          label: suggestion.primaryText,
          secondary: suggestion.secondaryText,
          location: suggestion.location,
        }),
      );
      onSelectLocation(suggestion.primaryText, suggestion.location);
      onClose();
      setText("");
    },
    [commitPlace, onClose, onSelectLocation],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    }
    if (event.key === "Enter") {
      const suggestion = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (suggestion) void commitSuggestion(suggestion);
    }
  };

  if (!open) return null;

  const hasQuery = Boolean(text.trim() || category);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-fade-in">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="glass flex h-14 items-center gap-2 rounded-2xl px-3 shadow-e3">
          <Search className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.6} />
          <input
            ref={inputRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Para onde você vai?"
            aria-label="Buscar locais"
            className="h-full flex-1 bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          {text ? (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setText("")}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 text-sm font-semibold text-primary"
          >
            Cancelar
          </button>
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {chips.map((chip) => {
            const Icon = categoryIcons[chip.id];
            const isActive = category === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategory(isActive ? null : chip.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-200",
                  isActive
                    ? "gradient-brand text-primary-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-2xl border border-border bg-surface/60"
                />
              ))}
            </div>
          ) : null}

          {!loading && !hasQuery ? (
            <section>
              <div className="flex items-center justify-between px-1 pb-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Buscas recentes
                </h2>
                {recents.length ? (
                  <button
                    type="button"
                    onClick={() => setRecents(GeocodingService.clearRecentSearches())}
                    className="text-[11px] font-semibold text-primary"
                  >
                    Limpar tudo
                  </button>
                ) : null}
              </div>
              {recents.length ? (
                <ul className="flex flex-col gap-1.5">
                  {recents.map((recent) => (
                    <li key={recent.id}>
                      <div className="glass flex items-center gap-3 rounded-2xl px-3 py-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </span>
                        <button
                          type="button"
                          className="flex-1 text-left"
                          onClick={async () => {
                            if (recent.placeId) {
                              const place = await PlacesService.details(recent.placeId);
                              if (place) return commitPlace(place);
                            }
                            if (recent.location) {
                              onSelectLocation(recent.label, recent.location);
                              onClose();
                            }
                          }}
                        >
                          <p className="text-sm font-semibold text-foreground">{recent.label}</p>
                          {recent.secondary ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {recent.secondary}
                            </p>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover ${recent.label}`}
                          onClick={() =>
                            setRecents(GeocodingService.removeRecentSearch(recent.id))
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-10 text-center">
                  <span className="gradient-brand grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-glow">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">Comece a explorar</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Busque por um endereço ou toque numa categoria para ver lugares próximos.
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {!loading && hasQuery ? (
            <div className="flex flex-col gap-4">
              {suggestions.length ? (
                <section>
                  <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Sugestões
                  </h2>
                  <ul className="flex flex-col gap-1.5">
                    {suggestions.map((suggestion, index) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => void commitSuggestion(suggestion)}
                          className={cn(
                            "glass flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                            index === activeIndex && "shadow-glow",
                          )}
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {suggestion.primaryText}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {suggestion.secondaryText}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Lugares
                </h2>
                {rows.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {rows.map((place) => {
                      const Icon = categoryIcons[place.category];
                      return (
                        <li key={place.id}>
                          <button
                            type="button"
                            onClick={() => commitPlace(place)}
                            className="glass flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-shadow hover:shadow-glow"
                          >
                            <span className="gradient-brand grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {place.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {place.subtitle} · {place.address}
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] font-semibold text-primary">
                              {formatDistance(distanceMeters(userLocation, place.location))}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="glass rounded-2xl px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-foreground">Nenhum lugar encontrado</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tente outro termo ou remova o filtro de categoria.
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
