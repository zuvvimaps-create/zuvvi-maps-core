import {
  BedDouble,
  Coffee,
  Fuel,
  Landmark,
  Navigation,
  Pill,
  ShoppingBag,
  Store,
  Stethoscope,
  Trees,
  TrainFront,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaceCategory } from "@/types";

export const categoryIcons: Record<PlaceCategory, LucideIcon> = {
  cafe: Coffee,
  restaurant: Utensils,
  market: ShoppingBag,
  pharmacy: Pill,
  fuel: Fuel,
  health: Stethoscope,
  hotel: BedDouble,
  shop: Store,
  park: Trees,
  transit: TrainFront,
  culture: Landmark,
};

interface PlacePinProps {
  category: PlaceCategory;
  name: string;
  selected: boolean;
  showLabel?: boolean;
}

/** Interactive POI pin: glass capsule, sapphire ring, violet glow when active. */
export function PlacePin({ category, name, selected, showLabel = true }: PlacePinProps) {
  const Icon = categoryIcons[category];
  return (
    <div className="flex cursor-pointer flex-col items-center gap-1 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative">
        {selected ? (
          <span className="absolute -inset-2 rounded-full bg-accent-violet/30 blur-md" />
        ) : null}
        <div
          className={cn(
            "relative grid h-10 w-10 place-items-center rounded-full border transition-all duration-300",
            selected
              ? "gradient-brand scale-110 border-transparent text-primary-foreground shadow-glow-violet"
              : "glass border-border-strong text-primary shadow-e2",
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>
        <span
          className={cn(
            "absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 rounded-[2px] transition-colors",
            selected ? "bg-accent-violet" : "bg-elevated",
          )}
        />
      </div>
      {showLabel ? (
        <span
          className={cn(
            "max-w-[120px] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight transition-colors",
            selected
              ? "glass text-foreground shadow-e1"
              : "text-foreground/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]",
          )}
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}

/** User location: glowing core, precision ring and radar pulse. */
export function UserLocationPin({ heading }: { heading?: number }) {
  return (
    <div className="relative grid h-6 w-6 place-items-center">
      <span className="zuvvi-pulse absolute h-6 w-6 rounded-full bg-primary/60" />
      <span className="absolute h-16 w-16 rounded-full border border-primary/25 bg-primary/10" />
      <span className="absolute h-6 w-6 rounded-full border-2 border-primary-foreground/80 bg-primary shadow-glow" />
      {heading === undefined ? null : (
        <Navigation
          className="relative h-3 w-3 text-primary-foreground"
          style={{ transform: `rotate(${heading}deg)` }}
          strokeWidth={3}
        />
      )}
    </div>
  );
}

/** Destination pin used while a route is plotted. */
export function DestinationPin() {
  return (
    <div className="relative grid h-9 w-9 place-items-center">
      <span className="absolute h-9 w-9 rounded-full bg-accent-violet/25 blur-sm" />
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-accent-violet/60 bg-accent-violet text-accent-violet-foreground shadow-glow-violet">
        <Navigation className="h-4 w-4 -rotate-45" strokeWidth={2.6} />
      </span>
    </div>
  );
}
