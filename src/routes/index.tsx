import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, Star, Trash2, User } from "lucide-react";
import { mapConfig, type MapStyleId } from "@/config/mapConfig";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav, type BottomTab } from "@/components/layout/BottomNav";
import { MapCanvas } from "@/components/map/MapCanvas";
import { MapControls } from "@/components/map/MapControls";
import { NavigationHUD } from "@/components/map/NavigationHUD";
import { PlaceSheet } from "@/components/map/PlaceSheet";
import { RoutePanel } from "@/components/map/RoutePanel";
import { SearchOverlay } from "@/components/map/SearchOverlay";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import { PlacesService, RoutingService } from "@/services";
import { mapService } from "@/services/mapService";
import { formatDistance } from "@/utils/format";
import { distanceMeters } from "@/utils/geo";
import type { LatLng, Place, RoutePlan } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zuvvi Maps — Mapa premium, rotas e navegação" },
      {
        name: "description",
        content:
          "Explore lugares, planeje rotas e navegue com o mapa premium da Zuvvi: cartografia escura, busca instantânea e navegação passo a passo.",
      },
      { property: "og:title", content: "Zuvvi Maps — Mapa premium, rotas e navegação" },
      {
        property: "og:description",
        content:
          "Cartografia escura sofisticada, busca instantânea de lugares, comparação de rotas e navegação passo a passo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#070A16" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),
  component: HomeScreen,
});

type Mode = "explore" | "route" | "navigating";

function HomeScreen() {
  const { location: userLocation, isLocating, locate } = useGeolocation();
  const { saved, isSaved, togglePlace, remove } = useSavedPlaces();

  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [styleId, setStyleId] = useState<MapStyleId>(mapConfig.defaultStyleId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<BottomTab>("explore");
  const [panel, setPanel] = useState<"saved" | "profile" | null>(null);
  const [mode, setMode] = useState<Mode>("explore");
  const [plans, setPlans] = useState<RoutePlan[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    PlacesService.nearby(userLocation, 6, 12).then((result) => {
      if (!cancelled) setPlaces(result);
    });
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === planId) ?? plans[0] ?? null,
    [planId, plans],
  );

  const nearbyOf = useCallback(
    (place: Place) =>
      places
        .filter((item) => item.id !== place.id)
        .sort(
          (a, b) =>
            distanceMeters(place.location, a.location) - distanceMeters(place.location, b.location),
        )
        .slice(0, 4),
    [places],
  );

  const selectPlace = useCallback((place: Place) => {
    setSelected(place);
    setMode("explore");
    setPlans([]);
    setPlanId(null);
    setTab("explore");
    setPanel(null);
    mapService.flyTo(place.location, mapConfig.detailZoom);
  }, []);

  const handleLocate = useCallback(() => {
    locate((location) => mapService.flyTo(location, 15.4));
  }, [locate]);

  const planRoute = useCallback(
    async (place: Place) => {
      setMode("route");
      setRouteLoading(true);
      setSelected(place);
      try {
        const result = await RoutingService.route({
          origin: userLocation,
          destination: place.location,
          profiles: ["fastest", "shortest", "eco"],
        });
        setPlans(result);
        setPlanId(result[0]?.id ?? null);
        if (result[0]) mapService.drawRoute(result[0].geometry);
        mapService.fitTo([userLocation, place.location], 110);
      } catch {
        toast.error("Não foi possível calcular a rota", {
          description: "Tente novamente em instantes.",
        });
        setMode("explore");
      } finally {
        setRouteLoading(false);
      }
    },
    [userLocation],
  );

  const cancelRoute = useCallback(() => {
    setMode("explore");
    setPlans([]);
    setPlanId(null);
    mapService.clearRoute();
  }, []);

  const handleSave = useCallback(
    (place: Place) => {
      const added = togglePlace(place);
      toast.success(added ? "Salvo nos favoritos" : "Removido dos favoritos", {
        description: place.name,
      });
    },
    [togglePlace],
  );

  const handleShare = useCallback(async (place: Place) => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    const text = `${place.name} — ${place.address}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: place.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copiado", { description: place.name });
    } catch {
      toast.info("Compartilhamento cancelado");
    }
  }, []);

  const handleTab = useCallback(
    (next: BottomTab) => {
      setTab(next);
      if (next === "explore") {
        setPanel(null);
        return;
      }
      if (next === "saved") {
        setPanel("saved");
        return;
      }
      if (next === "profile") {
        setPanel("profile");
        return;
      }
      setPanel(null);
      if (selected) void planRoute(selected);
      else
        toast.info("Escolha um destino", {
          description: "Toque num local no mapa para traçar a rota.",
        });
    },
    [planRoute, selected],
  );

  const showPlaceSheet = mode === "explore" && Boolean(selected) && !panel && !searchOpen;

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <MapCanvas
        places={places}
        selectedPlaceId={selected?.id ?? null}
        userLocation={userLocation}
        styleId={styleId}
        route={mode === "explore" ? null : (activePlan?.geometry ?? null)}
        destination={mode === "explore" ? null : (selected?.location ?? null)}
        onSelectPlace={selectPlace}
      />

      {mode === "navigating" && activePlan ? (
        <NavigationHUD
          plan={activePlan}
          destinationName={selected?.name ?? "Destino"}
          onEnd={() => {
            setMode("explore");
            mapService.clearRoute();
            toast.info("Navegação encerrada");
          }}
        />
      ) : (
        <>
          <AppHeader
            onOpenSearch={() => setSearchOpen(true)}
            onOpenProfile={() => {
              setPanel("profile");
              setTab("profile");
            }}
            onOpenSettings={() =>
              toast.info("Preferências", {
                description: "Tema, unidades e camadas de mapa em breve.",
              })
            }
          />

          <MapControls
            styleId={styleId}
            isLocating={isLocating}
            onLocate={handleLocate}
            onZoomIn={() => mapService.zoomIn()}
            onZoomOut={() => mapService.zoomOut()}
            onReset={() => mapService.resetOrientation()}
            onStyleChange={setStyleId}
            onOpenSaved={() => {
              setPanel("saved");
              setTab("saved");
            }}
          />

          {mode === "explore" && !selected && !panel ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4">
              <div className="glass mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-e2">
                <span className="gradient-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{places.length} lugares</span>{" "}
                  perto de você. Toque num pin para ver detalhes e traçar rota.
                </p>
              </div>
            </div>
          ) : null}

          {showPlaceSheet && selected ? (
            <PlaceSheet
              place={selected}
              userLocation={userLocation}
              nearby={nearbyOf(selected)}
              isSaved={isSaved(selected.id)}
              onClose={() => setSelected(null)}
              onRoute={(place) => void planRoute(place)}
              onSave={handleSave}
              onShare={(place) => void handleShare(place)}
              onSelectNearby={selectPlace}
            />
          ) : null}

          {mode === "route" ? (
            <RoutePanel
              destinationName={selected?.name ?? "Destino"}
              plans={plans}
              selectedId={planId}
              loading={routeLoading}
              onSelect={(plan) => {
                setPlanId(plan.id);
                mapService.drawRoute(plan.geometry);
              }}
              onStart={() => {
                setMode("navigating");
                if (selected) mapService.flyTo(userLocation, 16.4);
              }}
              onCancel={cancelRoute}
            />
          ) : null}

          {panel === "saved" ? (
            <SidePanel title="Salvos" onClose={() => handleTab("explore")}>
              {saved.length ? (
                <ul className="flex flex-col gap-2">
                  {saved.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-3 py-3"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-warning/15 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={async () => {
                          if (item.placeId) {
                            const place = await PlacesService.details(item.placeId);
                            if (place) return selectPlace(place);
                          }
                          mapService.flyTo(item.location, 15.6);
                          handleTab("explore");
                        }}
                      >
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.address} ·{" "}
                          {formatDistance(distanceMeters(userLocation, item.location))}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remover ${item.label}`}
                        onClick={() => remove(item.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum lugar salvo ainda.
                </p>
              )}
            </SidePanel>
          ) : null}

          {panel === "profile" ? (
            <SidePanel title="Perfil" onClose={() => handleTab("explore")}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4">
                <span className="gradient-brand grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-glow">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-foreground">Ana Duarte</p>
                  <p className="text-xs text-muted-foreground">Zuvvi Premium · Lisboa</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Viagens", value: "128" },
                  { label: "Salvos", value: String(saved.length) },
                  { label: "Avaliação", value: "4,9" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-surface/60 px-3 py-3 text-center"
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-lg font-bold text-foreground">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </SidePanel>
          ) : null}

          <BottomNav active={tab} onChange={handleTab} />
        </>
      )}

      <SearchOverlay
        open={searchOpen}
        userLocation={userLocation}
        onClose={() => setSearchOpen(false)}
        onSelectPlace={selectPlace}
        onSelectLocation={(label: string, location: LatLng) => {
          mapService.flyTo(location, 15.6);
          toast.success("Local encontrado", { description: label });
        }}
      />
    </main>
  );
}

function SidePanel({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-3 pb-24">
      <div className="glass mx-auto max-h-[62vh] max-w-md overflow-y-auto rounded-3xl p-4 shadow-e3 animate-slide-in-bottom">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-primary">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
