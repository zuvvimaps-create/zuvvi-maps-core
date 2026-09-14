import { useEffect, useState } from "react";
import {
  ArrowUp,
  CornerDownLeft,
  CornerDownRight,
  Flag,
  RotateCw,
  X,
} from "lucide-react";
import { formatDistance, formatDuration, formatEta } from "@/utils/format";
import type { ManeuverType, RoutePlan } from "@/types";

const maneuverIcons: Record<ManeuverType, typeof ArrowUp> = {
  depart: ArrowUp,
  straight: ArrowUp,
  left: CornerDownLeft,
  right: CornerDownRight,
  "slight-left": CornerDownLeft,
  "slight-right": CornerDownRight,
  roundabout: RotateCw,
  arrive: Flag,
};

interface NavigationHUDProps {
  plan: RoutePlan;
  destinationName: string;
  onEnd: () => void;
}

/** Turn-by-turn HUD. Steps advance on a simulated progress clock. */
export function NavigationHUD({ plan, destinationName, onEnd }: NavigationHUDProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    setProgress(0);
  }, [plan.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 1) return 1;
        return Math.min(1, value + 0.04);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (progress < 1) return;
    if (stepIndex < plan.steps.length - 1) {
      setStepIndex((index) => index + 1);
      setProgress(0);
    }
  }, [progress, stepIndex, plan.steps.length]);

  const step = plan.steps[stepIndex];
  if (!step) return null;
  const Icon = maneuverIcons[step.maneuver];

  const remainingSteps = plan.steps.slice(stepIndex);
  const remainingMeters =
    remainingSteps.reduce((sum, item) => sum + item.distanceMeters, 0) -
    step.distanceMeters * progress;
  const remainingSeconds =
    remainingSteps.reduce((sum, item) => sum + item.durationSeconds, 0) -
    step.durationSeconds * progress;

  return (
    <>
      <div className="pointer-events-auto absolute inset-x-0 top-0 z-40 px-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="glass mx-auto max-w-md overflow-hidden rounded-3xl shadow-e3">
          <div className="flex items-center gap-3 p-4">
            <span className="gradient-brand grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-glow">
              <Icon className="h-7 w-7" strokeWidth={2.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-bold leading-none text-foreground">
                {formatDistance(Math.max(0, step.distanceMeters * (1 - progress)))}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {step.instruction}
              </p>
              <p className="truncate text-xs text-muted-foreground">{step.streetName}</p>
            </div>
          </div>
          <div className="h-1 w-full bg-border">
            <div
              className="gradient-brand h-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="glass mx-auto flex max-w-md items-center gap-3 rounded-3xl p-3 shadow-e3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold leading-none text-foreground">
              {formatDuration(Math.max(0, remainingSeconds))}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {formatDistance(Math.max(0, remainingMeters))} · chega{" "}
              {formatEta(Math.max(0, remainingSeconds))} · {destinationName}
            </p>
          </div>
          <button
            type="button"
            onClick={onEnd}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-destructive/40 bg-destructive/15 px-4 text-sm font-bold text-destructive transition-colors hover:bg-destructive/25"
          >
            <X className="h-4 w-4" />
            Encerrar
          </button>
        </div>
      </div>
    </>
  );
}
