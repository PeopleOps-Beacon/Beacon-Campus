import { Accessibility, DoorOpen } from "lucide-react";
import type { Campus } from "../types/campus";
import { Card, IconTile, SectionHeading } from "./ui/Primitives";

export function AccessibilityPanel({
  campus,
  preferStepFree,
  onToggleStepFree
}: {
  campus: Campus;
  preferStepFree: boolean;
  onToggleStepFree: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Beacon University</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Accessibility</h1>
      </div>

      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Prefer step-free routes</p>
          <p className="mt-1 text-xs text-white/60">
            When on, Beacon always recommends accessible entrances and step-free walking paths, even if it takes a
            little longer.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={preferStepFree}
          aria-label="Prefer step-free routes"
          onClick={() => onToggleStepFree(!preferStepFree)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${preferStepFree ? "bg-campus-gold" : "bg-white/15"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${preferStepFree ? "translate-x-[22px]" : "translate-x-0.5"}`}
          />
        </button>
      </Card>

      <div>
        <SectionHeading title="Accessible entrances" />
        <div className="flex flex-col gap-2">
          {campus.buildings.map((building) => {
            const entrance = building.entrances.find((e) => e.id === building.accessibleEntranceId);
            if (!entrance) return null;
            return (
              <Card key={building.id} className="flex items-center gap-3 py-2.5">
                <IconTile tone="info">
                  <DoorOpen size={15} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{building.name}</p>
                  <p className="truncate text-xs text-white/55">{entrance.label}</p>
                </div>
                <Accessibility size={14} className="text-campus-green" aria-hidden="true" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
