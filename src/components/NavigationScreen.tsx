import { useEffect } from "react";
import { AlertTriangle, Compass, DoorOpen, Heart, MapPin, MapPinned } from "lucide-react";
import { pulse } from "../lib/haptics";
import { speak } from "../lib/speech";
import type { Campus, RoutePlan, StepCategory } from "../types/campus";
import { AssistanceQuickAction } from "./AssistanceScreen";
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
  onArrive,
  onRequestAssistance
}: {
  plan: RoutePlan;
  campus: Campus;
  stepIndex: number;
  audioGuidance: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onArrive: () => void;
  onRequestAssistance: () => void;
}) {
  const steps = plan.steps.filter((s) => s.category !== "arrival");
  const current = steps[stepIndex];
  const next = steps[stepIndex + 1];
  const isLastStep = stepIndex === steps.length - 1;
  const remainingMinutes = Math.max(0, plan.totalMinutes - (current?.minutesFromStart ?? 0));

  useEffect(() => {
    if (audioGuidance && current) speak(current.instruction);
  }, [audioGuidance, current]);

  useEffect(() => {
    pulse(10);
  }, [stepIndex]);

  const currentLabel = locationLabel(campus, current?.locationId);
  const Icon = current ? CATEGORY_ICON[current.category] : Compass;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <LocationIllustration campus={campus} locationId={current?.locationId} height={220} className="w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8">
          {currentLabel && <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{currentLabel}</p>}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
          {remainingMinutes <= 1 ? "Almost there" : `${remainingMinutes} min left`}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-campus-gold transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {current && (
        <div key={current.id} className="flex flex-1 flex-col justify-center gap-4 animate-screen-in">
          {!!current.feet && (
            <p className="text-5xl font-bold leading-none text-campus-gold">
              {current.feet < 1000 ? current.feet : `${(current.feet / 5280).toFixed(1)} mi`}
              {current.feet < 1000 && <span className="ml-1.5 text-xl font-semibold text-campus-gold/70">ft</span>}
            </p>
          )}

          <Card className={cx("flex items-start gap-3", current.category === "advisory" && "border-campus-gold/25 bg-campus-gold/[0.06]")}>
            <div className="mt-0.5 shrink-0 text-campus-gold">
              <Icon size={24} aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold leading-snug text-white" aria-live="polite" aria-atomic="true">
              {current.instruction}
            </p>
          </Card>

          {next && <p className="px-1 text-sm text-white/45">Then: {next.instruction}</p>}
        </div>
      )}

      <div className="flex items-center justify-center text-xs text-white/40">
        Step {stepIndex + 1} of {steps.length}
      </div>

      <AssistanceQuickAction onClick={onRequestAssistance} />

      <div className="flex gap-2.5 pt-1">
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
