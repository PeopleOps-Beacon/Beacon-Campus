import { useEffect, useRef, useState } from "react";
import { Accessibility, CheckCircle2, DoorOpen } from "lucide-react";
import { speak } from "../lib/speech";
import { journeySummaryRows } from "../lib/campusEngine";
import type { CampusPreferences, RouteMode, RoutePlan } from "../types/campus";
import { Badge, Button, Card, IconTile } from "./ui/Primitives";

/**
 * Optional, unobtrusive one-question check-in — local UI state only, no
 * persistence or analytics wiring (Campus's existing analytics pathway is
 * for search/preference/destination telemetry, not a natural fit for a
 * single ephemeral yes/no that shouldn't outlive this screen). Never blocks
 * the primary arrival actions above it.
 */
function ArrivalFeedback() {
  const [response, setResponse] = useState<"yes" | "no" | null>(null);

  if (response) {
    return (
      <p role="status" className="px-1 text-xs text-white/40">
        Thanks for letting us know.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <p className="text-xs text-white/40">Did Beacon get you to the right place?</p>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => setResponse("yes")}
          aria-label="Yes, Beacon got me to the right place"
          className="min-h-[44px] rounded-[var(--radius-pill)] border border-white/10 px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white active:translate-y-px"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setResponse("no")}
          aria-label="No, this wasn't the right place"
          className="min-h-[44px] rounded-[var(--radius-pill)] border border-white/10 px-4 text-xs font-semibold text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white active:translate-y-px"
        >
          No
        </button>
      </div>
    </div>
  );
}

export function ArrivalScreen({
  plan,
  routeMode,
  effectivePreferences,
  audioGuidance,
  hasSavedCar,
  onDone,
  onViewBuilding,
  onReturnToCar
}: {
  plan: RoutePlan;
  routeMode: RouteMode;
  effectivePreferences: CampusPreferences;
  audioGuidance: boolean;
  /** Whether a car is currently remembered — gates the contextual "Return to Car" action; preserves existing Remember My Car behavior rather than changing it. */
  hasSavedCar: boolean;
  onDone: () => void;
  onViewBuilding: () => void;
  onReturnToCar: () => void;
}) {
  const arrivalStep = plan.steps.find((s) => s.category === "arrival");
  const { building, recommendedEntrance, accessibilityNote } = plan.destination;
  const summary = journeySummaryRows(plan, routeMode, effectivePreferences);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (audioGuidance && arrivalStep) speak(arrivalStep.instruction);
    // Focus (not just aria-live) moves to the arrival heading itself — a
    // screen reader announces a focused element's accessible name reliably,
    // where aria-live on already-mounted content is not guaranteed to fire.
    // Also makes sure focus never lingers on a control from NavigationScreen.
    headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <IconTile tone="success">
        <CheckCircle2 size={24} aria-hidden="true" />
      </IconTile>
      <div>
        <Badge tone="success">Arrived</Badge>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-[var(--font-display)] font-bold text-white outline-none">
          You've arrived at {building.name}
        </h1>
      </div>

      {arrivalStep && (
        <Card className="text-left">
          <p className="text-base leading-relaxed text-white">{arrivalStep.instruction}</p>
        </Card>
      )}

      <Card className="flex w-full items-start gap-3 text-left">
        <IconTile tone={recommendedEntrance.accessible ? "success" : "neutral"}>
          {recommendedEntrance.accessible ? <Accessibility size={18} aria-hidden="true" /> : <DoorOpen size={18} aria-hidden="true" />}
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            {recommendedEntrance.accessible ? "Accessible Entrance" : "Recommended Entrance"}
          </p>
          <p className="text-sm font-bold text-white">{recommendedEntrance.label}</p>
          <p className="text-xs text-white/55">
            {[recommendedEntrance.automaticDoor ? "Automatic doors" : null, recommendedEntrance.notes ?? null].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Card>

      {accessibilityNote && (
        <Card className="w-full border-campus-gold/25 bg-campus-gold/[0.06] text-left">
          <p className="text-sm text-white/85">{accessibilityNote}</p>
        </Card>
      )}

      {/*
        Future extension point (not built this phase — no indoor route data
        exists yet): once Beacon has indoor routing, a "Continue Inside" (and
        eventually "Navigate to Room {n}") primary-adjacent action belongs
        here, rendered only when that data is actually available. Until then,
        the entrance card above is informational, not a promise of a sub-route
        Beacon can't actually walk the user through.
      */}

      <Card className="w-full text-left">
        <dl className="flex flex-col gap-2">
          {summary.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-white/50">{row.label}</dt>
              <dd className="text-right font-medium text-white">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex w-full flex-col gap-2.5">
        <Button tone="primary" className="w-full" onClick={onDone}>
          Done
        </Button>
        <div className="flex w-full gap-2.5">
          <Button tone="secondary" className="flex-1" onClick={onViewBuilding}>
            View Building
          </Button>
          {hasSavedCar && (
            <Button tone="secondary" className="flex-1" onClick={onReturnToCar}>
              Return to Car
            </Button>
          )}
        </div>
      </div>

      <ArrivalFeedback />
    </div>
  );
}
