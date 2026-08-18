import { CalendarX2, Navigation } from "lucide-react";
import { DEMO_PERSONA, JORDAN_SCHEDULE } from "../data/beaconUniversity";
import { getDestinationIntel } from "../lib/campusEngine";
import type { Campus, CampusPreferences, ClassScheduleEntry } from "../types/campus";
import { formatClockTime, getLeaveByInfo } from "../utils/time";
import { Badge, Button, Card, EmptyState, SectionHeading, cx } from "./ui/Primitives";

function timeGreeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function nextUpcoming(entries: ClassScheduleEntry[], now: Date): ClassScheduleEntry | null {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const entry of entries) {
    const [h, m] = entry.time.split(":").map(Number);
    if (h * 60 + m >= nowMinutes - 5) return entry;
  }
  return null;
}

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
  const upNext = nextUpcoming(JORDAN_SCHEDULE, now);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">
          {timeGreeting(now)}, {DEMO_PERSONA.name}
        </p>
        <h1 className="text-[var(--font-display)] font-bold text-white">My Day</h1>
      </div>

      {upNext && (
        <NextUpCard campus={campus} entry={upNext} now={now} startNodeId={startNodeId} preferences={preferences} onNavigate={() => onNavigateClass(upNext)} />
      )}

      <div>
        <SectionHeading title="Today" />
        {JORDAN_SCHEDULE.length === 0 ? (
          <EmptyState
            icon={<CalendarX2 size={22} aria-hidden="true" />}
            title="Nothing on the schedule today"
            message="Use search or Explore to find a building, department, or event instead."
          />
        ) : (
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
                isNext={entry.id === upNext?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NextUpCard({
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
  const accessible = intel?.recommendedEntrance.accessible;

  return (
    <Card className="flex flex-col gap-3 border-campus-gold/25 bg-campus-gold/[0.06]">
      <Badge tone="selected">Next · {formatClockTime(entry.time)}</Badge>
      <div>
        <p className="text-lg font-bold text-white">
          {entry.courseName} <span className="font-normal text-white/50">({entry.course})</span>
        </p>
        <p className="text-sm text-white/65">
          {building.name}, Room {entry.roomNumber} · {walkMinutes} min {accessible ? "accessible " : ""}walk
        </p>
      </div>
      <p className="text-sm text-white/75">{leaveBy.message}</p>
      <Button tone="primary" onClick={onNavigate}>
        <Navigation size={15} aria-hidden="true" />
        Start route
      </Button>
    </Card>
  );
}

/** Splits "10:30 AM" into ["10:30", "AM"] so each half can be sized to fit the time badge circle. */
function splitClockTime(value: string): [string, string] {
  const match = value.match(/^(\d{1,2}:\d{2})\s*([AP]M)$/i);
  return match ? [match[1], match[2].toUpperCase()] : [value, ""];
}

function ClassRow({
  campus,
  entry,
  now,
  startNodeId,
  preferences,
  onNavigate,
  isNext
}: {
  campus: Campus;
  entry: ClassScheduleEntry;
  now: Date;
  startNodeId: string;
  preferences: CampusPreferences;
  onNavigate: () => void;
  isNext: boolean;
}) {
  const building = campus.buildings.find((b) => b.id === entry.buildingId);
  if (!building) return null;
  const intel = getDestinationIntel(campus, { buildingId: entry.buildingId, roomNumber: entry.roomNumber }, { fromNodeId: startNodeId, preferences, now });
  const walkMinutes = intel?.walkMinutes ?? 0;
  const leaveBy = getLeaveByInfo(entry.time, walkMinutes, now);
  const isPast = leaveBy.tone === "past";
  const [hourMin, ampm] = splitClockTime(formatClockTime(entry.time));

  return (
    <Card className={isPast ? "opacity-50" : isNext ? "border-campus-gold/30" : undefined}>
      <div className="flex items-start gap-3">
        <div
          className={cx(
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full leading-none",
            isPast ? "bg-white/[0.08] text-white" : "bg-campus-gold text-campus-ink"
          )}
        >
          <span className="text-[13px] font-bold">{hourMin}</span>
          {ampm && <span className="mt-0.5 text-[10px] font-semibold tracking-wide">{ampm}</span>}
        </div>
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffe39a,#f5b72f)] text-campus-goldink active:translate-y-px"
          >
            <Navigation size={15} />
          </button>
        )}
      </div>
    </Card>
  );
}
