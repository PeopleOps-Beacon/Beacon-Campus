import { Accessibility, AlertTriangle, Building2, Construction, DoorOpen, Navigation, SquareParking } from "lucide-react";
import { activeConstructionForBuilding } from "../lib/campusEngine";
import type { DestinationIntel } from "../types/campus";
import { BuildingIllustration } from "./BuildingIllustration";
import { CampusMap } from "./CampusMap";
import { DataProvenanceBadge } from "./DataProvenanceBadge";
import { Badge, Button, Card, IconTile, SectionHeading } from "./ui/Primitives";
import type { Campus } from "../types/campus";

export function DestinationCard({
  intel,
  campus,
  startNodeId,
  onStartRoute,
  onViewBuilding,
  onViewParking
}: {
  intel: DestinationIntel;
  campus: Campus;
  startNodeId: string;
  onStartRoute: () => void;
  onViewBuilding: () => void;
  onViewParking: () => void;
}) {
  const { building, recommendedEntrance, walkMinutes, openStatus, roomNumber, floor, activeAlerts, entranceSubstituted, recommendedParking, parkingWalkMinutes, accessibilityNote } = intel;
  const construction = activeConstructionForBuilding(campus, building.id);

  return (
    <div className="flex flex-col gap-5">
      <BuildingIllustration category={building.category} height={130} className="w-full rounded-[var(--radius-card)]" />
      <CampusMap campus={campus} highlightBuildingId={building.id} startNodeId={startNodeId} height={180} />

      <div>
        <p className="text-sm text-white/50">{building.name}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">{intel.title}</h1>
        {roomNumber && (
          <p className="mt-1 text-sm text-white/70">
            Room {roomNumber}
            {floor ? ` · Floor ${floor}` : ""}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="gold">{walkMinutes} min walk</Badge>
        <Badge tone={openStatus.isOpen ? "success" : "neutral"}>{openStatus.label}</Badge>
        {building.accessibleEntranceId === recommendedEntrance.id && <Badge tone="info">Step-free entrance</Badge>}
        <DataProvenanceBadge provenance={building.provenance} />
      </div>

      {activeAlerts.length > 0 && (
        <Card className="flex items-start gap-3 border-campus-gold/25 bg-campus-gold/[0.06]">
          <IconTile tone="warning">
            <AlertTriangle size={16} aria-hidden="true" />
          </IconTile>
          <div className="min-w-0">
            {activeAlerts.map((alert) => (
              <p key={alert.id} className="text-sm text-white/80">
                {alert.message}
              </p>
            ))}
          </div>
        </Card>
      )}

      {construction.length > 0 && (
        <Card className="flex items-start gap-3">
          <IconTile>
            <Construction size={16} aria-hidden="true" />
          </IconTile>
          <div className="min-w-0">
            {construction.map((notice) => (
              <p key={notice.id} className="text-sm text-white/70">
                {notice.description}
              </p>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <SectionHeading title="Entrance" />
        <div className="flex items-start gap-3">
          <IconTile tone={entranceSubstituted ? "warning" : "neutral"}>
            <DoorOpen size={17} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-medium text-white">Use the {recommendedEntrance.label}</p>
            {recommendedEntrance.notes && <p className="text-xs text-white/55">{recommendedEntrance.notes}</p>}
            {entranceSubstituted && <p className="mt-1 text-xs text-campus-amber">Adjusted for a temporary closure — see the note above.</p>}
          </div>
        </div>
        {accessibilityNote && (
          <div className="flex items-start gap-3 border-t border-white/[0.06] pt-3">
            <IconTile tone="info">
              <Accessibility size={17} aria-hidden="true" />
            </IconTile>
            <p className="text-sm text-white/70">{accessibilityNote}</p>
          </div>
        )}
      </Card>

      {recommendedParking && (
        <Card className="flex items-start gap-3">
          <IconTile>
            <SquareParking size={17} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-medium text-white">{recommendedParking.name}</p>
            <p className="text-xs text-white/55">
              {parkingWalkMinutes ? `${parkingWalkMinutes} min walk to ${building.name}` : "Nearby parking"}
              {recommendedParking.permitRequired ? " · Permit required" : " · No permit required"}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <Button tone="primary" onClick={onStartRoute} className="col-span-2">
          <Navigation size={16} aria-hidden="true" />
          Start Route
        </Button>
        <Button tone="secondary" onClick={onViewBuilding}>
          <Building2 size={16} aria-hidden="true" />
          View Building
        </Button>
        <Button tone="secondary" onClick={onViewParking}>
          <SquareParking size={16} aria-hidden="true" />
          Nearby Parking
        </Button>
      </div>
    </div>
  );
}
