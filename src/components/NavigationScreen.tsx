import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Compass, DoorOpen, Heart, MapPin, MapPinned, MapPinPlus } from "lucide-react";
import { pulse } from "../lib/haptics";
import { speak } from "../lib/speech";
import type { Campus, CampusPreferences, GuidanceStep, RouteMode, RoutePlan, StepCategory } from "../types/campus";
import { ROUTE_MODE_META } from "../types/campus";
import { AddStopSheet } from "./AddStopSheet";
import { AssistanceQuickAction } from "./AssistanceScreen";
import { CampusMap } from "./CampusMap";
import { LocationIllustration } from "./LocationIllustration";
import { Button, Card, cx } from "./ui/Primitives";
import { RouteAlert } from "./ui/RouteAlert";

type NavMode = "guidance" | "route" | "steps";

function locationLabel(campus: Campus, locationId?: string): string | undefined {
  if (!locationId) return undefined;
  return campus.buildings.find((b) => b.id === locationId)?.name ?? campus.pathNodes.find((n) => n.id === locationId)?.label;
}

function formatFeet(feet: number): string {
  return feet < 1000 ? `${feet} ft` : `${(feet / 5280).toFixed(1)} mi`;
}

const CATEGORY_ICON: Record<StepCategory, typeof Compass> = {
  direction: DoorOpen,
  landmark: MapPinned,
  accessibility: MapPin,
  advisory: AlertTriangle,
  arrival: MapPin,
  reassurance: Heart,
  waypoint: MapPinPlus
};

const NAV_MODES: { id: NavMode; label: string }[] = [
  { id: "guidance", label: "Guidance" },
  { id: "route", label: "Route" },
  { id: "steps", label: "Steps" }
];

/**
 * Beacon's Guidance / Route / Steps view switch — presentation only. It never
 * touches step index, waypoints, destination, preferences, or progress; it
 * only decides which of the three panels below is visible. Styled after the
 * existing route-mode segmented control (MapScreen's ExpandedDestination)
 * rather than inventing a new control, per Phase 4D's brief — but with real
 * tab/tabpanel semantics rather than radiogroup, since these are views of
 * the same navigation session, not mutually exclusive settings.
 */
function NavModeSwitch({ mode, onChange }: { mode: NavMode; onChange: (mode: NavMode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Navigation view"
      className="grid shrink-0 grid-cols-3 gap-1 rounded-[var(--radius-control)] border border-campus-gold/[0.12] bg-white/[0.04] p-1"
    >
      {NAV_MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            id={`nav-tab-${m.id}`}
            aria-selected={active}
            aria-controls={`nav-panel-${m.id}`}
            onClick={() => onChange(m.id)}
            className={cx(
              "min-h-[44px] rounded-[calc(var(--radius-control)-2px)] text-sm font-semibold transition-[background-image,color] active:translate-y-px",
              active ? "beacon-selected" : "text-white/55 hover:text-white/85"
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Always-visible status line — the user should never wonder where they're
 * going or how much is left, in any of the three modes. Distinguishes a
 * waypoint stop from the true final destination so the two can never be
 * mistaken for each other.
 */
function DestinationStatus({ plan, nextStopLabel, remainingMinutes }: { plan: RoutePlan; nextStopLabel?: string; remainingMinutes: number }) {
  return (
    <p className="shrink-0 px-1 text-xs font-medium">
      {nextStopLabel ? (
        <>
          <span className="font-bold uppercase tracking-wide text-campus-gold">Next Stop</span>{" "}
          <span className="text-white/70">{nextStopLabel}</span>
          <span className="mx-1.5 text-white/25">·</span>
          <span className="text-white/40">then {plan.destination.title}</span>
        </>
      ) : (
        <>
          <span className="font-bold uppercase tracking-wide text-campus-gold">Final Destination</span>{" "}
          <span className="text-white/70">{plan.destination.title}</span>
          <span className="mx-1.5 text-white/25">·</span>
          <span className="text-white/40">{remainingMinutes} min remaining</span>
        </>
      )}
    </p>
  );
}

function GuidanceView({
  campus,
  plan,
  current,
  next,
  isFirstStep,
  effectivePreferences
}: {
  campus: Campus;
  plan: RoutePlan;
  current: GuidanceStep;
  next?: GuidanceStep;
  isFirstStep: boolean;
  effectivePreferences: CampusPreferences;
}) {
  const currentLabel = locationLabel(campus, current.locationId);
  const Icon = CATEGORY_ICON[current.category];
  const isWaypointArrival = current.category === "waypoint" && current.waypointIndex !== undefined;

  return (
    <div key={current.id} className="animate-screen-in flex flex-col gap-3">
      {isWaypointArrival ? (
        <Card className="flex flex-col items-center gap-2 border-campus-green/25 bg-campus-green/[0.06] py-5 text-center">
          <CheckCircle2 size={26} className="text-campus-green" aria-hidden="true" />
          <p className="text-lg font-bold text-white">{current.instruction}</p>
          <p className="text-sm text-white/60">When you're ready, continue to {plan.destination.title}.</p>
        </Card>
      ) : current.category === "advisory" ? (
        <RouteAlert variant="route-change" message={current.instruction} />
      ) : current.category === "reassurance" ? (
        <RouteAlert variant="reassurance" message={current.instruction} />
      ) : (
        <>
          {/* The primary question — "what do I do next?" — stays visually
              dominant: large distance, then the instruction, both above the
              supporting photo. */}
          {!!current.feet && (
            <p className="text-5xl font-bold leading-none text-campus-gold">
              {current.feet < 1000 ? current.feet : `${(current.feet / 5280).toFixed(1)} mi`}
              {current.feet < 1000 && <span className="ml-1.5 text-xl font-semibold text-campus-gold/70">ft</span>}
            </p>
          )}
          <Card className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-campus-gold">
              <Icon size={24} aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold leading-snug text-white" aria-live="polite" aria-atomic="true">
              {current.instruction}
            </p>
          </Card>
        </>
      )}

      {/* Landmark photo — orientation support, not the maneuver itself, so
          it sits below the instruction and at a more modest height than a
          full-bleed hero. */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <LocationIllustration campus={campus} locationId={current.locationId} height={150} className="w-full" />
        {currentLabel && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-1.5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{currentLabel}</p>
          </div>
        )}
      </div>

      {isFirstStep && effectivePreferences.stepFree && <RouteAlert variant="accessibility" message="Your route remains step free." />}

      {next && <p className="px-1 text-sm text-white/45">Then: {next.instruction}</p>}
    </div>
  );
}

function RouteView({
  campus,
  plan,
  steps,
  current,
  remainingMinutes,
  remainingFeet,
  routeMode
}: {
  campus: Campus;
  plan: RoutePlan;
  steps: GuidanceStep[];
  current?: GuidanceStep;
  remainingMinutes: number;
  remainingFeet: number;
  routeMode?: RouteMode;
}) {
  return (
    <div className="animate-screen-in flex flex-col gap-3">
      <CampusMap
        campus={campus}
        routePath={plan.path}
        startNodeId={current?.locationId ?? plan.path[0]}
        highlightBuildingId={plan.destination.buildingId}
        height={200}
      />
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Route summary</span>
          {routeMode && <span className="text-xs font-medium text-white/55">{ROUTE_MODE_META[routeMode].label}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/40">Time remaining</p>
            <p className="text-base font-bold text-white">{remainingMinutes} min</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Distance remaining</p>
            <p className="text-base font-bold text-white">{formatFeet(remainingFeet)}</p>
          </div>
        </div>

        {plan.waypoints.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Stops</p>
            {plan.waypoints.map((waypoint, index) => {
              const waypointStep = steps.find((s) => s.category === "waypoint" && s.waypointIndex === index);
              const passed = waypointStep ? waypointStep.order < (current?.order ?? Infinity) : false;
              return (
                <div key={waypoint.facilityId} className="flex items-center gap-2 text-sm">
                  {passed ? (
                    <CheckCircle2 size={14} className="shrink-0 text-campus-green" aria-hidden="true" />
                  ) : (
                    <Circle size={14} className="shrink-0 text-white/30" aria-hidden="true" />
                  )}
                  <span className={passed ? "text-white/40 line-through" : "text-white/85"}>{waypoint.label.split(" — ")[0]}</span>
                  {!passed && <span className="text-xs text-white/35">next stop</span>}
                </div>
              );
            })}
            <div className="flex items-center gap-2 text-sm">
              <Circle size={14} className="shrink-0 text-white/30" aria-hidden="true" />
              <span className="text-white/85">{plan.destination.title}</span>
              <span className="text-xs text-white/35">final destination</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepsView({ steps, stepIndex, plan }: { steps: GuidanceStep[]; stepIndex: number; plan: RoutePlan }) {
  const currentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <ol className="animate-screen-in flex flex-col gap-2">
      {steps.map((step, index) => {
        const state: "completed" | "current" | "upcoming" = index < stepIndex ? "completed" : index === stepIndex ? "current" : "upcoming";
        const waypointLabel =
          step.category === "waypoint" && step.waypointIndex !== undefined ? plan.waypoints[step.waypointIndex].label.split(" — ")[0] : undefined;

        return (
          <li
            key={step.id}
            ref={state === "current" ? currentRef : undefined}
            aria-current={state === "current" ? "step" : undefined}
            className={cx(
              "flex items-start gap-3 rounded-[var(--radius-card)] border px-3.5 py-3",
              state === "current" ? "border-campus-gold/25 bg-campus-gold/[0.06]" : "border-white/[0.06] bg-transparent"
            )}
          >
            <div className="mt-0.5 shrink-0" aria-hidden="true">
              {state === "completed" ? (
                <CheckCircle2 size={18} className="text-campus-green" />
              ) : state === "current" ? (
                <span className="beacon-selected flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold">
                  {index + 1}
                </span>
              ) : (
                <Circle size={18} className="text-white/25" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="sr-only">{state === "completed" ? "Completed. " : state === "current" ? "Current step. " : "Upcoming. "}</span>
              <p className={cx("text-sm font-semibold leading-snug", state === "upcoming" ? "text-white/55" : "text-white")}>{step.instruction}</p>
              {(waypointLabel || step.feet) && (
                <p className="mt-0.5 text-xs text-white/40">
                  {waypointLabel && <span className="text-campus-gold">{waypointLabel}</span>}
                  {waypointLabel && step.feet ? " · " : ""}
                  {step.feet ? formatFeet(step.feet) : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function NavigationScreen({
  plan,
  campus,
  stepIndex,
  audioGuidance,
  effectivePreferences,
  routeMode,
  onNextStep,
  onPrevStep,
  onArrive,
  onAddStop,
  onRequestAssistance
}: {
  plan: RoutePlan;
  campus: Campus;
  stepIndex: number;
  audioGuidance: boolean;
  effectivePreferences: CampusPreferences;
  routeMode?: RouteMode;
  onNextStep: () => void;
  onPrevStep: () => void;
  onArrive: () => void;
  onAddStop: (facilityId: string) => void;
  onRequestAssistance: () => void;
}) {
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [mode, setMode] = useState<NavMode>("guidance");
  const [justAddedStop, setJustAddedStop] = useState(false);

  const steps = plan.steps.filter((s) => s.category !== "arrival");
  const current = steps[stepIndex];
  const next = steps[stepIndex + 1];
  const isLastStep = stepIndex === steps.length - 1;
  const remainingMinutes = Math.max(0, plan.totalMinutes - (current?.minutesFromStart ?? 0));
  const remainingFeet = useMemo(() => steps.slice(stepIndex).reduce((sum, s) => sum + (s.feet ?? 0), 0), [steps, stepIndex]);
  const isWaypointArrival = current?.category === "waypoint" && current.waypointIndex !== undefined;
  const upcomingWaypointStep = steps.find((s) => s.order > (current?.order ?? -1) && s.category === "waypoint");
  const nextStopLabel =
    upcomingWaypointStep && upcomingWaypointStep.waypointIndex !== undefined
      ? plan.waypoints[upcomingWaypointStep.waypointIndex].label.split(" — ")[0]
      : undefined;

  useEffect(() => {
    if (audioGuidance && current) speak(current.instruction);
  }, [audioGuidance, current]);

  useEffect(() => {
    pulse(10);
  }, [stepIndex]);

  useEffect(() => {
    if (!justAddedStop) return;
    const timeout = setTimeout(() => setJustAddedStop(false), 5000);
    return () => clearTimeout(timeout);
  }, [justAddedStop]);

  function handleAddStop(facilityId: string) {
    onAddStop(facilityId);
    setAddStopOpen(false);
    setJustAddedStop(true);
    setMode("guidance");
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <NavModeSwitch mode={mode} onChange={setMode} />

      <DestinationStatus plan={plan} nextStopLabel={nextStopLabel} remainingMinutes={remainingMinutes} />

      <div className="h-1.5 w-full shrink-0 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-campus-gold transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / Math.max(1, steps.length)) * 100}%` }}
        />
      </div>

      {justAddedStop && (
        <RouteAlert variant="route-change" message={`Route updated.${nextStopLabel ? ` Next stop: ${nextStopLabel}.` : ""}`} />
      )}

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {current && (
          <div id="nav-panel-guidance" role="tabpanel" aria-labelledby="nav-tab-guidance" hidden={mode !== "guidance"} tabIndex={-1}>
            {mode === "guidance" && (
              <GuidanceView
                campus={campus}
                plan={plan}
                current={current}
                next={next}
                isFirstStep={stepIndex === 0}
                effectivePreferences={effectivePreferences}
              />
            )}
          </div>
        )}
        <div id="nav-panel-route" role="tabpanel" aria-labelledby="nav-tab-route" hidden={mode !== "route"} tabIndex={-1}>
          {mode === "route" && (
            <RouteView
              campus={campus}
              plan={plan}
              steps={steps}
              current={current}
              remainingMinutes={remainingMinutes}
              remainingFeet={remainingFeet}
              routeMode={routeMode}
            />
          )}
        </div>
        <div id="nav-panel-steps" role="tabpanel" aria-labelledby="nav-tab-steps" hidden={mode !== "steps"} tabIndex={-1}>
          {mode === "steps" && <StepsView steps={steps} stepIndex={stepIndex} plan={plan} />}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center text-xs text-white/40">
        Step {stepIndex + 1} of {steps.length}
      </div>

      <div className="flex shrink-0 gap-2">
        <AssistanceQuickAction onClick={onRequestAssistance} />
        <Button tone="ghost" className="w-full justify-center text-white/60" onClick={() => setAddStopOpen(true)}>
          <MapPinPlus size={15} aria-hidden="true" />
          Add stop
        </Button>
      </div>

      <div className="flex shrink-0 gap-2.5 pt-1">
        {stepIndex > 0 && (
          <Button tone="secondary" onClick={onPrevStep}>
            Back
          </Button>
        )}
        <Button tone="primary" className="flex-1" onClick={isLastStep ? onArrive : onNextStep}>
          {isLastStep ? "I've Arrived" : isWaypointArrival ? "Continue Route" : "Next"}
        </Button>
      </div>

      {addStopOpen && (
        <AddStopSheet
          campus={campus}
          fromNodeId={current?.locationId ?? plan.path[0]}
          destinationBuildingId={plan.destination.buildingId}
          preferences={effectivePreferences}
          onAdd={handleAddStop}
          onClose={() => setAddStopOpen(false)}
        />
      )}
    </div>
  );
}
