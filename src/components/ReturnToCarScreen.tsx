import { Car, MapPin } from "lucide-react";
import { planReturnToCar } from "../lib/campusEngine";
import type { Campus, CampusPreferences } from "../types/campus";
import { CampusMap } from "./CampusMap";
import { Badge, Button, Card, EmptyState, IconTile } from "./ui/Primitives";

export function ReturnToCarScreen({
  campus,
  lotId,
  note,
  startNodeId,
  preferences,
  onDone,
  onForgetCar
}: {
  campus: Campus;
  lotId: string;
  note?: string;
  startNodeId: string;
  preferences: CampusPreferences;
  onDone: () => void;
  onForgetCar: () => void;
}) {
  const lot = campus.parkingLots.find((p) => p.id === lotId);
  if (!lot) {
    return <EmptyState title="Car location not found" message="This saved parking spot isn't in the current campus data." action={<Button onClick={onForgetCar}>Forget saved car</Button>} />;
  }

  const plan = planReturnToCar(campus, startNodeId, lot, preferences);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Remember My Car</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Walk back to your car</h1>
      </div>

      {plan ? (
        <>
          <CampusMap campus={campus} routePath={plan.path} startNodeId={startNodeId} highlightBuildingId={undefined} height={200} />

          <Card className="flex items-center gap-3 border-campus-gold/25 bg-campus-gold/[0.06]">
            <IconTile tone="gold">
              <Car size={18} aria-hidden="true" />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{lot.name}</p>
              <p className="text-xs text-white/60">{plan.walkMinutes} min walk from {plan.startLabel}</p>
              {note && <p className="mt-1 text-xs text-campus-gold">"{note}"</p>}
            </div>
            <Badge tone="neutral">{lot.accessibleSpaces} accessible</Badge>
          </Card>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Directions</p>
            <ol className="flex flex-col gap-2">
              {plan.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-campus-gold" aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <EmptyState title="Route unavailable" message="We couldn't find a walking path to this lot right now." />
      )}

      <div className="mt-auto flex gap-2.5">
        <Button tone="secondary" onClick={onForgetCar}>
          Forget car
        </Button>
        <Button tone="primary" className="flex-1" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
