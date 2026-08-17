import {
  Calendar,
  ClipboardCheck,
  IdCard,
  Landmark,
  SquareParking,
  UtensilsCrossed,
  Users,
  Building2,
  type LucideIcon
} from "lucide-react";
import type { Campus, OrientationItem } from "../types/campus";
import { Badge, Button, Card, IconTile } from "./ui/Primitives";

const ICON: Record<OrientationItem["icon"], LucideIcon> = {
  schedule: Calendar,
  parking: SquareParking,
  "check-in": ClipboardCheck,
  id: IdCard,
  "financial-aid": Landmark,
  residence: Building2,
  dining: UtensilsCrossed,
  sessions: Users
};

export function OrientationModeScreen({
  campus,
  onNavigateToBuilding
}: {
  campus: Campus;
  onNavigateToBuilding: (buildingId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Badge tone="gold">Orientation Mode</Badge>
        <h1 className="mt-2 text-[var(--font-display)] font-bold text-white">Welcome to {campus.universityName}</h1>
        <p className="mt-1 text-sm text-white/60">
          Your first orientation session begins at 9:00 AM in Hendrix Student Center. Here's everything for your
          first day.
        </p>
      </div>

      <ol className="flex flex-col gap-2.5">
        {campus.orientationItems
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            const Icon = ICON[item.icon];
            const building = item.buildingId ? campus.buildings.find((b) => b.id === item.buildingId) : undefined;
            return (
              <li key={item.id}>
                <Card className="flex items-start gap-3">
                  <IconTile tone="gold">
                    <Icon size={17} aria-hidden="true" />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      {item.time && <Badge tone="neutral">{item.time}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-white/65">{item.description}</p>
                    {building && (
                      <Button tone="secondary" className="mt-2 h-9 px-3 text-xs" onClick={() => onNavigateToBuilding(building.id)}>
                        Navigate to {building.name}
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
      </ol>
    </div>
  );
}
