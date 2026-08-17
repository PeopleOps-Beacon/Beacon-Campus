import { Accessibility, SquareParking } from "lucide-react";
import { activeAlertsForParking } from "../lib/campusEngine";
import type { Campus, ParkingLot } from "../types/campus";
import { Badge, Card, IconTile } from "./ui/Primitives";

const ELIGIBILITY_LABEL: Record<string, string> = {
  visitor: "Visitors allowed",
  student: "Student permit",
  faculty: "Faculty & staff"
};

export function ParkingScreen({ campus }: { campus: Campus }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Parking</h1>
      </div>
      <div className="flex flex-col gap-3">
        {campus.parkingLots.map((lot) => (
          <ParkingLotCard key={lot.id} campus={campus} lot={lot} />
        ))}
      </div>
    </div>
  );
}

function ParkingLotCard({ campus, lot }: { campus: Campus; lot: ParkingLot }) {
  const alerts = activeAlertsForParking(campus, lot.id);
  return (
    <Card className={lot.closed ? "border-red-500/25 bg-red-500/[0.04]" : undefined}>
      <div className="flex items-start gap-3">
        <IconTile tone={lot.closed ? "danger" : "info"}>
          <SquareParking size={18} aria-hidden="true" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{lot.name}</p>
            {lot.closed && <Badge tone="danger">Closed</Badge>}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {lot.eligibility.map((e) => (
              <Badge key={e} tone="neutral">
                {ELIGIBILITY_LABEL[e]}
              </Badge>
            ))}
            {lot.permitRequired ? (
              <Badge tone="neutral">Permit required</Badge>
            ) : (
              <Badge tone="success">No permit{lot.freeMinutes ? ` (first ${lot.freeMinutes} min)` : ""}</Badge>
            )}
          </div>
          {lot.notes && <p className="mt-2 text-xs text-white/60">{lot.notes}</p>}
          {lot.closureReason && <p className="mt-1 text-xs text-red-300">{lot.closureReason}</p>}
          <p className="mt-2 flex items-center gap-1 text-xs text-white/50">
            <Accessibility size={13} aria-hidden="true" /> {lot.accessibleSpaces} accessible spaces
          </p>
          {alerts.map((alert) => (
            <p key={alert.id} className="mt-2 text-xs text-campus-amber">
              {alert.message}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
