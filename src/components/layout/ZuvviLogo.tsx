import { MapPin } from "lucide-react";

export function ZuvviLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inset-0 rounded-xl bg-primary/40 blur-md" />
        <span className="gradient-brand relative grid h-10 w-10 place-items-center rounded-xl text-primary-foreground shadow-glow">
          <MapPin className="h-5 w-5" strokeWidth={2.6} />
        </span>
      </span>
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
            Zuvvi <span className="text-gradient-brand">Maps</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Mobilidade premium
          </span>
        </span>
      )}
    </div>
  );
}
