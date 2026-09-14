import { Compass, Route, Star, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomTab = "explore" | "routes" | "saved" | "profile";

const tabs: { id: BottomTab; label: string; icon: LucideIcon }[] = [
  { id: "explore", label: "Explorar", icon: Compass },
  { id: "routes", label: "Rotas", icon: Route },
  { id: "saved", label: "Salvos", icon: Star },
  { id: "profile", label: "Perfil", icon: User },
];

interface BottomNavProps {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass mx-auto flex max-w-md items-center justify-between rounded-2xl px-2 py-2 shadow-e3">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors"
            >
              {isActive ? (
                <span className="absolute inset-0 rounded-xl bg-primary/15" />
              ) : null}
              <tab.icon
                className={cn(
                  "relative h-[18px] w-[18px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={isActive ? 2.6 : 2}
              />
              <span
                className={cn(
                  "relative text-[10px] font-semibold tracking-tight transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
              {isActive ? (
                <span className="gradient-brand absolute -top-0.5 h-1 w-8 rounded-full shadow-glow" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
