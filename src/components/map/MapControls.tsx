import { Compass, Layers, LocateFixed, Minus, Plus, Star } from "lucide-react";
import { mapStyleList, type MapStyleId } from "@/config/mapConfig";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MapControlsProps {
  styleId: MapStyleId;
  isLocating: boolean;
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onStyleChange: (styleId: MapStyleId) => void;
  onOpenSaved: () => void;
}

const controlClass =
  "grid h-11 w-11 place-items-center rounded-xl glass text-foreground shadow-e2 transition-all duration-200 hover:text-primary hover:shadow-glow active:scale-95";

export function MapControls({
  styleId,
  isLocating,
  onLocate,
  onZoomIn,
  onZoomOut,
  onReset,
  onStyleChange,
  onOpenSaved,
}: MapControlsProps) {
  return (
    <div className="pointer-events-auto absolute right-4 top-32 z-20 flex flex-col items-end gap-2">
      <button
        type="button"
        aria-label="Minha localização"
        onClick={onLocate}
        className={cn(controlClass, isLocating && "text-primary shadow-glow")}
      >
        <LocateFixed className={cn("h-5 w-5", isLocating && "animate-pulse")} />
      </button>

      <div className="glass flex flex-col overflow-hidden rounded-xl shadow-e2">
        <button
          type="button"
          aria-label="Aproximar"
          onClick={onZoomIn}
          className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:text-primary"
        >
          <Plus className="h-5 w-5" />
        </button>
        <span className="mx-2 h-px bg-border" />
        <button
          type="button"
          aria-label="Afastar"
          onClick={onZoomOut}
          className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:text-primary"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      <Popover>
        <PopoverTrigger aria-label="Camadas do mapa" className={controlClass}>
          <Layers className="h-5 w-5" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 border-border bg-popover p-2">
          <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Camadas
          </p>
          <div className="flex flex-col gap-1">
            {mapStyleList.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => onStyleChange(style.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                  style.id === styleId
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="text-sm font-semibold">{style.label}</span>
                <span className="text-[11px]">{style.description}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button type="button" aria-label="Recentralizar" onClick={onReset} className={controlClass}>
        <Compass className="h-5 w-5" />
      </button>

      <button type="button" aria-label="Salvos" onClick={onOpenSaved} className={controlClass}>
        <Star className="h-5 w-5" />
      </button>
    </div>
  );
}
