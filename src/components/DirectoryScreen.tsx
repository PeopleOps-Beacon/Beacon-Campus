import type { Building, BuildingCategory, Campus } from "../types/campus";
import { buildingOpenStatus } from "../lib/campusEngine";
import { Badge, Card, EmptyState } from "./ui/Primitives";

const CATEGORY_LABEL: Record<BuildingCategory, string> = {
  academic: "Academic",
  residence: "Residence Hall",
  dining: "Dining",
  "student-life": "Student Life",
  administration: "Administration",
  athletics: "Athletics",
  library: "Library",
  "health-safety": "Health & Safety",
  arts: "Arts"
};

export function DirectoryScreen({
  campus,
  now,
  title,
  category,
  onSelectBuilding
}: {
  campus: Campus;
  now: Date;
  title: string;
  category?: BuildingCategory;
  onSelectBuilding: (building: Building) => void;
}) {
  const buildings = category ? campus.buildings.filter((b) => b.category === category) : campus.buildings;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">Beacon University</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">{title}</h1>
      </div>

      {buildings.length === 0 ? (
        <EmptyState title="Nothing here yet" message="No buildings match this category in the demo dataset." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {buildings.map((building) => {
            const status = buildingOpenStatus(building, now);
            return (
              <button key={building.id} type="button" onClick={() => onSelectBuilding(building)} className="text-left">
                <Card className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{building.name}</p>
                    <p className="truncate text-xs text-white/55">{CATEGORY_LABEL[building.category]}</p>
                  </div>
                  <Badge tone={status.isOpen ? "success" : "neutral"}>{status.isOpen ? "Open" : "Closed"}</Badge>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
