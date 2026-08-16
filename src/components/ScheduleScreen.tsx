import { Navigation } from "lucide-react";
import { JORDAN_SCHEDULE } from "../data/beaconUniversity";
import { getDestinationIntel } from "../lib/campusEngine";
import type { Campus, CampusPreferences, ClassScheduleEntry } from "../types/campus";
import { formatClockTime, getLeaveByInfo } from "../utils/time";
import { Badge, Card, IconTile, SectionHeading } from "./ui/Primitives";

export function ScheduleScreen({
  campus,
  now,
  startNodeId,
  preferences,
  onNavigateClass
}: {
  campus: Campus;
  now: Date;
  startNodeId: string;
  preferences: CampusPreferences;
  onNavigateClass: (entry: ClassScheduleEntry) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">Jordan · First-year student</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Today's Schedule</h1>
      </div>

      <SectionHeading title="Classes" />
      <div className="flex flex-col gap-3">
        {JORDAN_SCHEDULE.map((entry) => (
          <ClassRow
            key={entry.id}
            campus={campus}
            entry={entry}
            now={now}
            startNodeId={startNodeId}
            preferences={preferences}
            onNavigate={() => onNavigateClass(entry)}
          />
        ))}
      </div>
    </div>
  );
}

function ClassRow({
  campus,
  entry,
  now,
  startNodeId,
  preferences,
  onNavigate
}: {
  campus: Campus;
  entry: ClassScheduleEntry;
  now: Date;
  startNodeId: string;
  preferences: CampusPreferences;
  onNavigate: () => void;
}) {
  const building = campus.buildings.find((b) => b.id === entry.buildingId);
  if (!building) return null;
  const intel = getDestinationIntel(campus, { buildingId: entry.buildingId, roomNumber: entry.roomNumber }, { fromNodeId: startNodeId, preferences, now });
  const walkMinutes = intel?.walkMinutes ?? 0;
  const leaveBy = getLeaveByInfo(entry.time, walkMinutes, now);
  const isPast = leaveBy.tone === "past";

  return (
    <Card className={isPast ? "opacity-50" : undefined}>
      <div className="flex items-start gap-3">
        <IconTile tone={isPast ? "neutral" : "gold"}>
          <span className="text-xs font-bold">{formatClockTime(entry.time).replace(" ", "\n")}</span>
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {entry.courseName} <span className="font-normal text-white/50">({entry.course})</span>
          </p>
          <p className="text-xs text-white/55">
            {building.name}, Room {entry.roomNumber}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{walkMinutes} min walk</Badge>
            {!isPast && <span className="text-xs text-white/60">{leaveBy.message}</span>}
          </div>
        </div>
        {!isPast && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label={`Navigate to ${entry.courseName}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-campus-gold text-campus-ink"
          >
            <Navigation size={15} />
          </button>
        )}
      </div>
    </Card>
  );
}
