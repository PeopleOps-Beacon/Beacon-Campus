import { AlertTriangle, Armchair, Building2, Construction, Mail, Navigation, PawPrint, Phone, ShieldAlert, SquareParking, Users } from "lucide-react";
import { activeAlertsForBuilding, activeConstructionForBuilding, buildingOpenStatus, elevatorsForBuilding, resolveElevatorAvailability } from "../lib/campusEngine";
import type { Building, Campus } from "../types/campus";
import { AccessibleEntranceCard, ElevatorStatusCard } from "./accessibility/AccessibilityCards";
import { BuildingVisual } from "./BuildingVisual";
import { DataProvenanceBadge, DataProvenanceNote } from "./DataProvenanceBadge";
import { Badge, Button, Card, IconTile, SectionHeading } from "./ui/Primitives";

const AMENITY_LABEL: Record<string, string> = {
  restroom: "Restroom",
  "accessible-restroom": "Accessible Restroom",
  elevator: "Elevator",
  stairs: "Stairs",
  "emergency-exit": "Emergency Exit",
  coffee: "Coffee",
  dining: "Dining",
  "study-space": "Study Space",
  vending: "Vending",
  atm: "ATM",
  printing: "Printing"
};

export function BuildingDetailScreen({
  campus,
  building,
  now,
  onNavigate,
  onViewParking
}: {
  campus: Campus;
  building: Building;
  now: Date;
  onNavigate: () => void;
  onViewParking: () => void;
}) {
  const openStatus = buildingOpenStatus(building, now);
  const alerts = activeAlertsForBuilding(campus, building.id);
  const construction = activeConstructionForBuilding(campus, building.id);
  const elevators = elevatorsForBuilding(campus, building.id);
  const elevatorAvailability = elevators.length > 0 ? resolveElevatorAvailability(campus, building.id) : null;
  const quietSpaces = building.amenities.filter((a) => a.type === "quiet-space");
  const serviceAnimalRelief = building.amenities.find((a) => a.type === "service-animal-relief");
  const additionalServices = campus.services.filter((s) => s.buildingId === building.id && !s.departmentId);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <BuildingVisual building={building} height={160} className="w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{building.abbreviation}</p>
          <h1 className="text-xl font-bold text-white">{building.name}</h1>
        </div>
      </div>

      <p className="text-sm text-white/65">{building.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={openStatus.isOpen ? "success" : "neutral"}>{openStatus.label}</Badge>
        <Badge tone="neutral">{building.address}</Badge>
        {building.floors > 1 && <Badge tone="neutral">{building.floors} floors</Badge>}
        <DataProvenanceBadge provenance={building.provenance} />
      </div>

      <DataProvenanceNote provenance={building.provenance} />

      {building.safetyGuidance && (
        <Card className="flex items-start gap-3 border-red-500/25 bg-red-500/[0.04]">
          <IconTile tone="danger">
            <ShieldAlert size={16} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-white">Emergency & Safety</p>
            <p className="mt-1 text-sm text-white/70">{building.safetyGuidance}</p>
          </div>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card className="flex flex-col gap-2 border-campus-gold/25 bg-campus-gold/[0.06]">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3">
              <IconTile tone="warning">
                <AlertTriangle size={16} aria-hidden="true" />
              </IconTile>
              <p className="text-sm text-white/80">{alert.message}</p>
            </div>
          ))}
        </Card>
      )}

      {construction.length > 0 && (
        <Card className="flex flex-col gap-2">
          {construction.map((notice) => (
            <div key={notice.id} className="flex items-start gap-3">
              <IconTile>
                <Construction size={16} aria-hidden="true" />
              </IconTile>
              <div>
                <p className="text-sm font-medium text-white">{notice.title}</p>
                <p className="mt-0.5 text-sm text-white/65">{notice.description}</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Button tone="primary" onClick={onNavigate}>
        <Navigation size={16} aria-hidden="true" />
        Navigate Here
      </Button>

      {building.departments.length > 0 && (
        <div>
          <SectionHeading title="Departments & Services" />
          <div className="flex flex-col gap-2">
            {building.departments.map((dept) => (
              <Card key={dept.id} className="flex items-center gap-3 py-2.5">
                <IconTile>
                  <Users size={16} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{dept.name}</p>
                  <p className="truncate text-xs text-white/55">
                    Floor {dept.floor}
                    {dept.hoursNote ? ` · ${dept.hoursNote}` : ""}
                    {dept.appointmentRequired ? " · Appointment recommended" : ""}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {additionalServices.length > 0 && (
        <div>
          <SectionHeading title="Additional services here" />
          <div className="flex flex-col gap-2">
            {additionalServices.map((service) => (
              <Card key={service.id} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">{service.name}</p>
                <p className="text-xs text-white/60">{service.description}</p>
                {(service.hoursNote || service.phone || service.email) && (
                  <div className="flex flex-col gap-1 text-xs text-white/55">
                    {service.hoursNote && <p>{service.hoursNote}</p>}
                    {service.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={12} className="text-white/35" aria-hidden="true" />
                        {service.phone}
                      </p>
                    )}
                    {service.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail size={12} className="text-white/35" aria-hidden="true" />
                        {service.email}
                      </p>
                    )}
                  </div>
                )}
                {service.accommodations && service.accommodations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2">
                    {service.accommodations.map((a) => (
                      <Badge key={a} tone="info">
                        {a}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {building.rooms.length > 0 && (
        <div>
          <SectionHeading title="Rooms" />
          <div className="flex flex-wrap gap-2">
            {building.rooms.map((room) => (
              <Badge key={room.id} tone="neutral">
                {room.name ? `${room.name} — ${room.number}` : `Room ${room.number}`} · Fl. {room.floor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading title="Entrances" />
        <div className="flex flex-col gap-2">
          {building.entrances.map((entrance) => (
            <AccessibleEntranceCard
              key={entrance.id}
              entrance={entrance}
              isRecommended={entrance.id === building.accessibleEntranceId}
              closed={alerts.some((a) => a.affectedEntranceIds?.includes(entrance.id))}
              onNavigate={entrance.id === building.accessibleEntranceId ? onNavigate : undefined}
            />
          ))}
        </div>
      </div>

      {elevators.length > 0 && (
        <div>
          <SectionHeading title="Elevators" />
          <div className="flex flex-col gap-2">
            {elevators.map((elevator) => (
              <ElevatorStatusCard
                key={elevator.id}
                elevator={elevator}
                alternate={
                  elevator.status === "outage" && elevatorAvailability?.reroutedFrom?.id === elevator.id
                    ? elevatorAvailability.elevator
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {(quietSpaces.length > 0 || serviceAnimalRelief) && (
        <div>
          <SectionHeading title="Quiet spaces & service animal relief" />
          <div className="flex flex-col gap-2">
            {quietSpaces.map((space) => (
              <Card key={space.id} className="flex items-center gap-3 py-2.5">
                <IconTile tone="info">
                  <Armchair size={15} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">Quiet space</p>
                  <p className="truncate text-xs text-white/55">{space.label}</p>
                </div>
              </Card>
            ))}
            {serviceAnimalRelief && (
              <Card className="flex items-center gap-3 py-2.5">
                <IconTile tone="info">
                  <PawPrint size={15} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">Service animal relief area</p>
                  <p className="truncate text-xs text-white/55">{serviceAnimalRelief.label}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {building.amenities.length > 0 && (
        <div>
          <SectionHeading title="Amenities" />
          <div className="flex flex-wrap gap-2">
            {building.amenities.map((amenity) => (
              <Badge key={amenity.id} tone="neutral">
                {AMENITY_LABEL[amenity.type] ?? amenity.type} · {amenity.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {building.nearbyParkingIds.length > 0 && (
        <button type="button" onClick={onViewParking} className="text-left">
          <Card className="flex items-center gap-3">
            <IconTile>
              <SquareParking size={17} aria-hidden="true" />
            </IconTile>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Nearby parking</p>
              <p className="text-xs text-white/55">
                {building.nearbyParkingIds
                  .map((id) => campus.parkingLots.find((l) => l.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <Building2 size={14} className="text-white/40" aria-hidden="true" />
          </Card>
        </button>
      )}
    </div>
  );
}
