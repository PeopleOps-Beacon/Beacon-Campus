import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { speak } from "../lib/speech";
import { journeySummaryRows } from "../lib/campusEngine";
import type { CampusPreferences, RouteMode, RoutePlan } from "../types/campus";
import { Badge, Button, Card, IconTile } from "./ui/Primitives";

export function ArrivalScreen({
  plan,
  routeMode,
  effectivePreferences,
  audioGuidance,
  onDone,
  onViewBuilding
}: {
  plan: RoutePlan;
  routeMode: RouteMode;
  effectivePreferences: CampusPreferences;
  audioGuidance: boolean;
  onDone: () => void;
  onViewBuilding: () => void;
}) {
  const arrivalStep = plan.steps.find((s) => s.category === "arrival");
  const { building } = plan.destination;
  const summary = journeySummaryRows(plan, routeMode, effectivePreferences);

  useEffect(() => {
    if (audioGuidance && arrivalStep) speak(arrivalStep.instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 pt-4 text-center">
      <IconTile tone="success">
        <CheckCircle2 size={24} aria-hidden="true" />
      </IconTile>
      <div>
        <Badge tone="success">Arrived</Badge>
        <h1 className="mt-3 text-[var(--font-display)] font-bold text-white">{building.name}</h1>
      </div>

      <Card className="text-left">
        <p className="text-base leading-relaxed text-white" aria-live="polite">
          {arrivalStep?.instruction}
        </p>
      </Card>

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

      <div className="flex w-full gap-2.5">
        <Button tone="secondary" className="flex-1" onClick={onViewBuilding}>
          View Building
        </Button>
        <Button tone="primary" className="flex-1" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
