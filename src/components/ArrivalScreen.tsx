import { CheckCircle2 } from "lucide-react";
import type { RoutePlan } from "../types/campus";
import { Badge, Button, Card, IconTile } from "./ui/Primitives";

export function ArrivalScreen({
  plan,
  onDone,
  onViewBuilding
}: {
  plan: RoutePlan;
  onDone: () => void;
  onViewBuilding: () => void;
}) {
  const arrivalStep = plan.steps.find((s) => s.category === "arrival");
  const { building } = plan.destination;

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
        <p className="text-base leading-relaxed text-white">{arrivalStep?.instruction}</p>
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
