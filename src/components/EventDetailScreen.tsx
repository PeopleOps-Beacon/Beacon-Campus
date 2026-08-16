import { Accessibility, CalendarDays, DoorOpen, Navigation, SquareParking } from "lucide-react";
import type { Campus, CampusEvent } from "../types/campus";
import { formatClockTime } from "../utils/time";
import { Badge, Button, Card, IconTile } from "./ui/Primitives";

export function EventDetailScreen({ campus, event, onNavigate }: { campus: Campus; event: CampusEvent; onNavigate: () => void }) {
  const venue = campus.buildings.find((b) => b.id === event.venueBuildingId);
  const parking = event.recommendedParkingId ? campus.parkingLots.find((p) => p.id === event.recommendedParkingId) : undefined;
  const entrance = venue?.entrances.find((e) => e.id === event.recommendedEntranceId);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Badge tone="gold">
          <CalendarDays size={12} /> {event.date}
        </Badge>
        <h1 className="mt-2 text-[var(--font-display)] font-bold text-white">{event.name}</h1>
        <p className="mt-1 text-sm text-white/60">
          {formatClockTime(event.startTime)}
          {event.endTime ? ` – ${formatClockTime(event.endTime)}` : ""} · {venue?.name}
        </p>
      </div>

      <p className="text-sm text-white/65">{event.description}</p>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">Getting there</p>
        <p className="text-sm text-white/70">{event.arrivalRecommendation}</p>
        {parking && (
          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
            <IconTile>
              <SquareParking size={16} aria-hidden="true" />
            </IconTile>
            <div>
              <p className="text-sm font-medium text-white">{parking.name}</p>
              <p className="text-xs text-white/55">{parking.closed ? "Closed today — see arrival note above" : parking.notes}</p>
            </div>
          </div>
        )}
        {entrance && (
          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
            <IconTile>
              <DoorOpen size={16} aria-hidden="true" />
            </IconTile>
            <p className="text-sm text-white">{entrance.label}</p>
          </div>
        )}
        {event.accessibilityNote && (
          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
            <IconTile tone="info">
              <Accessibility size={16} aria-hidden="true" />
            </IconTile>
            <p className="text-sm text-white/70">{event.accessibilityNote}</p>
          </div>
        )}
      </Card>

      <Button tone="primary" onClick={onNavigate}>
        <Navigation size={16} aria-hidden="true" />
        Navigate to {venue?.name}
      </Button>
    </div>
  );
}
