import { useEffect } from "react";
import { AlertTriangle, Compass, DoorOpen, Heart, MapPin, MapPinned } from "lucide-react";
import { speak } from "../lib/speech";
import type { Campus, RoutePlan, StepCategory } from "../types/campus";
import { LocationIllustration } from "./LocationIllustration";
import { Button, Card, cx } from "./ui/Primitives";

function locationLabel(campus: Campus, locationId?: string): string | undefined {
  if (!locationId) return undefined;
  return campus.buildings.find((b) => b.id === locationId)?.name ?? campus.pathNodes.find((n) => n.id === locationId)?.label;
}

const CATEGORY_ICON: Record<StepCategory, typeof Compass> = {
  direction: DoorOpen,
  landmark: MapPinned,
  accessibility: MapPin,
  advisory: AlertTriangle,
  arrival: MapPin,
  reassurance: Heart
};

export function NavigationScreen({
  plan,
  campus,
  stepIndex,
  audioGuidance,
  onNextStep,
  onPrevStep,
  onArrive
}: {
  plan: RoutePlan;
  campus: Campus;
  stepIndex: number;
  audioGuidance: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onArrive: () => void;
}) {
  const steps = plan.steps.filter((s) => s.category !== "arrival");
  const current = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const remainingMinutes = Math.max(0, plan.totalMinutes - (current?.minutesFromStart ?? 0));

  useEffect(() => {
    if (audioGuidance && current) speak(current.instruction);
  }, [audioGuidance, current]);

  const currentLabel = locationLabel(campus, current?.locationId);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <LocationIllustration campus={campus} locationId={current?.locationId} height={200} className="w-full" />
        {currentLabel && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{currentLabel}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Step {stepIndex + 1} of {steps.length}
        </span>
        <span>{remainingMinutes <= 1 ? "Almost there" : `About ${remainingMinutes} min remaining`}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-campus-gold transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {current && (
        <Card className={cx("flex items-start gap-3", current.category === "advisory" && "border-campus-gold/25 bg-campus-gold/[0.06]")}>
          {(() => {
            const Icon = CATEGORY_ICON[current.category];
            return (
              <div className="mt-0.5 text-campus-gold">
                <Icon size={22} aria-hidden="true" />
              </div>
            );
          })()}
          <p className="text-lg font-medium leading-snug text-white" aria-live="polite" aria-atomic="true">
            {current.instruction}
          </p>
        </Card>
      )}

      <ol className="flex flex-col gap-1.5" aria-label="Upcoming directions">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={cx(
              "rounded-[var(--radius-control)] px-3 py-2 text-sm",
              i === stepIndex ? "bg-white/[0.06] text-white" : "text-white/40",
              i < stepIndex && "line-through decoration-white/20"
            )}
          >
            {step.instruction}
          </li>
        ))}
      </ol>

      <div className="mt-auto flex gap-2.5 pt-2">
        {stepIndex > 0 && (
          <Button tone="secondary" onClick={onPrevStep}>
            Back
          </Button>
        )}
        <Button tone="primary" className="flex-1" onClick={isLastStep ? onArrive : onNextStep}>
          {isLastStep ? "I've Arrived" : "Next"}
        </Button>
      </div>
    </div>
  );
}
