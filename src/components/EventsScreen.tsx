import { CalendarDays } from "lucide-react";
import { upcomingEvents } from "../lib/campusEngine";
import type { Campus, CampusEvent } from "../types/campus";
import { formatClockTime } from "../utils/time";
import { EmptyState, Card, IconTile } from "./ui/Primitives";

export function EventsScreen({ campus, now, onSelectEvent }: { campus: Campus; now: Date; onSelectEvent: (event: CampusEvent) => void }) {
  const events = upcomingEvents(campus, now);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Campus Events</h1>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No upcoming events" message="Check back soon — new campus events are added regularly." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((event) => {
            const venue = campus.buildings.find((b) => b.id === event.venueBuildingId);
            return (
              <button key={event.id} type="button" onClick={() => onSelectEvent(event)} className="text-left">
                <Card className="flex items-center gap-3">
                  <IconTile tone="gold">
                    <CalendarDays size={18} aria-hidden="true" />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{event.name}</p>
                    <p className="truncate text-xs text-white/55">
                      {event.date} · {formatClockTime(event.startTime)} · {venue?.name}
                    </p>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
