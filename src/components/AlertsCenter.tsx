import { AlertTriangle, Construction, Info } from "lucide-react";
import type { AlertSeverity, Campus } from "../types/campus";
import { EmptyState, Badge, Card, IconTile, SectionHeading } from "./ui/Primitives";

const SEVERITY_TONE: Record<AlertSeverity, "info" | "warning" | "danger"> = {
  info: "info",
  advisory: "info",
  warning: "warning"
};

export function AlertsCenter({ campus, onSelectBuilding }: { campus: Campus; onSelectBuilding: (buildingId: string) => void }) {
  const active = campus.alerts.filter((a) => a.active);
  const activeConstruction = campus.construction.filter((c) => c.active);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Campus Alerts</h1>
      </div>

      {active.length === 0 && activeConstruction.length === 0 ? (
        <EmptyState title="All clear" message="There are no active campus alerts right now." />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <SectionHeading title="Alerts" />
              <div className="flex flex-col gap-2.5">
                {active.map((alert) => (
                  <Card key={alert.id} className="flex items-start gap-3">
                    <IconTile tone={SEVERITY_TONE[alert.severity]}>
                      <AlertTriangle size={16} aria-hidden="true" />
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{alert.title}</p>
                        <Badge tone={SEVERITY_TONE[alert.severity]}>{alert.severity}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-white/65">{alert.message}</p>
                      {alert.affectedBuildingIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {alert.affectedBuildingIds.map((id) => {
                            const building = campus.buildings.find((b) => b.id === id);
                            if (!building) return null;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => onSelectBuilding(id)}
                                className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/70 hover:bg-white/[0.1]"
                              >
                                {building.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeConstruction.length > 0 && (
            <div>
              <SectionHeading title="Construction & Closures" />
              <div className="flex flex-col gap-2.5">
                {activeConstruction.map((notice) => (
                  <Card key={notice.id} className="flex items-start gap-3">
                    <IconTile>
                      <Construction size={16} aria-hidden="true" />
                    </IconTile>
                    <div>
                      <p className="text-sm font-semibold text-white">{notice.title}</p>
                      <p className="mt-1 text-sm text-white/65">{notice.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="flex items-start gap-3">
            <IconTile tone="info">
              <Info size={16} aria-hidden="true" />
            </IconTile>
            <p className="text-xs text-white/55">
              Alerts automatically adjust route guidance and entrance recommendations for affected buildings.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
