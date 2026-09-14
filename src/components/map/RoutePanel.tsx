import { ArrowRight, Gauge, Leaf, Route as RouteIcon, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance, formatDuration, formatEta } from "@/utils/format";
import type { RoutePlan, RouteProfile } from "@/types";

const profileIcons: Record<RouteProfile, typeof Zap> = {
  fastest: Zap,
  shortest: RouteIcon,
  eco: Leaf,
};

interface RoutePanelProps {
  destinationName: string;
  plans: RoutePlan[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (plan: RoutePlan) => void;
  onStart: () => void;
  onCancel: () => void;
}

export function RoutePanel({
  destinationName,
  plans,
  selectedId,
  loading,
  onSelect,
  onStart,
  onCancel,
}: RoutePanelProps) {
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-3 pb-24">
      <div className="glass mx-auto max-w-md rounded-3xl p-4 shadow-e3 animate-slide-in-bottom">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Rota até
            </p>
            <h2 className="truncate font-display text-lg font-bold text-foreground">
              {destinationName}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cancelar rota"
            onClick={onCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-3 py-2.5 text-xs">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-glow" />
          <span className="truncate text-foreground">Sua localização atual</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-violet shadow-glow-violet" />
          <span className="truncate text-foreground">{destinationName}</span>
        </div>

        {loading ? (
          <div className="mt-3 flex flex-col gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl border border-border bg-surface/60"
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {plans.map((plan) => {
              const Icon = profileIcons[plan.profile];
              const isActive = plan.id === selected?.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => onSelect(plan)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
                    isActive
                      ? "border-primary/50 bg-primary/12 shadow-glow"
                      : "border-border bg-surface/60 hover:border-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      isActive
                        ? "gradient-brand text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">{plan.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {plan.summary}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-foreground">
                      {formatDuration(plan.durationSeconds)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {formatDistance(plan.distanceMeters)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {selected ? (
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface/60 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              Chegada estimada
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatEta(selected.durationSeconds)}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onStart}
          disabled={!selected}
          className="gradient-brand mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          Iniciar navegação
          <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
