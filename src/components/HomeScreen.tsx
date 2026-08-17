import {
  AlertTriangle,
  Accessibility,
  Building2,
  CalendarDays,
  GraduationCap,
  Landmark,
  MapPin,
  ShieldAlert,
  SquareParking,
  Trophy,
  Users,
  UtensilsCrossed
} from "lucide-react";
import { JORDAN_SCHEDULE } from "../data/beaconUniversity";
import { useComboboxNavigation } from "../hooks/useComboboxNavigation";
import { activeAlerts, getDestinationIntel, upcomingEvents } from "../lib/campusEngine";
import type { Campus, CampusPreferences, ClassScheduleEntry, Persona, SearchResult } from "../types/campus";
import { formatClockTime, getLeaveByInfo } from "../utils/time";
import { CampusMap } from "./CampusMap";
import { SearchBar } from "./SearchBar";
import { SearchResultsList } from "./SearchResultsList";
import { Badge, Card, IconTile, SectionHeading } from "./ui/Primitives";

export type CategoryId =
  | "classes"
  | "buildings"
  | "dining"
  | "parking"
  | "student-services"
  | "admissions"
  | "athletics"
  | "residence-halls"
  | "emergency"
  | "accessibility";

const CATEGORIES: { id: CategoryId; label: string; icon: typeof Building2 }[] = [
  { id: "classes", label: "Classes", icon: GraduationCap },
  { id: "buildings", label: "Buildings", icon: Building2 },
  { id: "dining", label: "Dining", icon: UtensilsCrossed },
  { id: "parking", label: "Parking", icon: SquareParking },
  { id: "student-services", label: "Student Services", icon: Users },
  { id: "admissions", label: "Admissions", icon: Landmark },
  { id: "athletics", label: "Athletics", icon: Trophy },
  { id: "residence-halls", label: "Residence Halls", icon: Building2 },
  { id: "emergency", label: "Emergency", icon: ShieldAlert },
  { id: "accessibility", label: "Accessibility", icon: Accessibility }
];

const STUDENT_PERSONAS: Persona[] = ["student", "new-student"];

function personaGreeting(persona: Persona | null, universityName: string): string {
  switch (persona) {
    case "student":
      return "Good to see you, Jordan.";
    case "new-student":
      return `Welcome to ${universityName}, Jordan.`;
    case "faculty-staff":
      return "Welcome back.";
    case "prospective-student":
    case "parent":
    case "visitor":
    default:
      return `Welcome to ${universityName}.`;
  }
}

function nextClass(now: Date): ClassScheduleEntry | null {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const entry of JORDAN_SCHEDULE) {
    const [h, m] = entry.time.split(":").map(Number);
    if (h * 60 + m >= nowMinutes - 5) return entry;
  }
  return null;
}

export function HomeScreen({
  campus,
  persona,
  now,
  startNodeId,
  startPointLabel,
  onChangeStartPoint,
  nearCampus,
  preferences,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectSearchResult,
  onSelectCategory,
  onSelectBuilding,
  onStartClassNav,
  onOpenAlerts,
  onOpenEvent
}: {
  campus: Campus;
  persona: Persona | null;
  now: Date;
  startNodeId: string;
  startPointLabel: string;
  onChangeStartPoint: () => void;
  nearCampus: boolean | null;
  preferences: CampusPreferences;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: SearchResult[];
  onSelectSearchResult: (result: SearchResult) => void;
  onSelectCategory: (id: CategoryId) => void;
  onSelectBuilding: (buildingId: string) => void;
  onStartClassNav: (entry: ClassScheduleEntry) => void;
  onOpenAlerts: () => void;
  onOpenEvent: (eventId: string) => void;
}) {
  const alerts = activeAlerts(campus);
  const events = upcomingEvents(campus, now, 3);
  const upNext = nextClass(now);
  const showSchedule = persona ? STUDENT_PERSONAS.includes(persona) : true;
  const combobox = useComboboxNavigation(searchResults, onSelectSearchResult);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-white/50">{personaGreeting(persona, campus.universityName)}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Where do you need to go?</h1>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={onSearchQueryChange}
        listboxId="home-search-results"
        expanded={searchQuery.trim().length > 0}
        activeDescendant={combobox.activeId}
        onKeyDown={combobox.onKeyDown}
      />

      {!searchQuery.trim() && (
        <button type="button" onClick={onChangeStartPoint} className="-mt-2 flex items-center gap-2 self-start text-left">
          <MapPin size={13} className="text-white/40" aria-hidden="true" />
          <span className="text-xs text-white/50">
            Starting from <span className="font-medium text-white/75">{startPointLabel}</span>
          </span>
          <span className="text-xs font-semibold text-campus-gold">Change</span>
        </button>
      )}
      {!searchQuery.trim() && nearCampus === false && (
        <p className="-mt-3 text-xs text-white/40">You don't look to be on campus right now — routes will start from {startPointLabel} until you pick somewhere else.</p>
      )}

      {searchQuery.trim() ? (
        <SearchResultsList
          results={searchResults}
          query={searchQuery}
          onSelect={onSelectSearchResult}
          listboxId="home-search-results"
          activeId={combobox.activeId}
        />
      ) : (
        <>
          {showSchedule && upNext && (
            <NextClassCard
              campus={campus}
              entry={upNext}
              now={now}
              startNodeId={startNodeId}
              preferences={preferences}
              onNavigate={() => onStartClassNav(upNext)}
            />
          )}

          {alerts.length > 0 &&
            (() => {
              const emergency = alerts.find((a) => a.severity === "emergency");
              return (
                <button type="button" onClick={onOpenAlerts} className="text-left">
                  <Card
                    className={
                      emergency
                        ? "flex items-center gap-3 border-red-500/40 bg-red-500/10"
                        : "flex items-center gap-3 border-campus-gold/25 bg-campus-gold/[0.06]"
                    }
                  >
                    <IconTile tone={emergency ? "danger" : "warning"}>
                      <AlertTriangle size={18} aria-hidden="true" />
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {emergency ? emergency.title : `${alerts.length} active campus ${alerts.length === 1 ? "alert" : "alerts"}`}
                      </p>
                      <p className="truncate text-xs text-white/60">{emergency ? "Tap for emergency guidance" : alerts[0].title}</p>
                    </div>
                    <Badge tone={emergency ? "danger" : "warning"}>View</Badge>
                  </Card>
                </button>
              );
            })()}

          <div>
            <SectionHeading title="Get around campus" />
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} type="button" onClick={() => onSelectCategory(cat.id)} className="flex flex-col items-center gap-1.5">
                    <IconTile>
                      <Icon size={18} aria-hidden="true" />
                    </IconTile>
                    <span className="text-center text-[11px] leading-tight text-white/70">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeading title="Campus map" />
            <CampusMap campus={campus} startNodeId={startNodeId} onSelectBuilding={onSelectBuilding} />
          </div>

          {events.length > 0 && (
            <div>
              <SectionHeading title="Upcoming events" />
              <div className="flex flex-col gap-2">
                {events.map((event) => {
                  const venue = campus.buildings.find((b) => b.id === event.venueBuildingId);
                  return (
                    <button key={event.id} type="button" onClick={() => onOpenEvent(event.id)} className="text-left">
                      <Card className="flex items-center gap-3 py-3">
                        <IconTile tone="gold">
                          <CalendarDays size={17} aria-hidden="true" />
                        </IconTile>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{event.name}</p>
                          <p className="truncate text-xs text-white/55">
                            {event.date} · {formatClockTime(event.startTime)} · {venue?.name}
                          </p>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NextClassCard({
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

  return (
    <Card className="flex flex-col gap-3 border-campus-sky/20 bg-campus-sky/[0.05]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Badge tone="info">Next class · {formatClockTime(entry.time)}</Badge>
          <p className="mt-2 text-base font-semibold text-white">
            {entry.courseName} ({entry.course})
          </p>
          <p className="text-sm text-white/60">
            {building.name}, Room {entry.roomNumber} · {walkMinutes} min walk
          </p>
        </div>
      </div>
      <p className="text-sm text-white/70">{leaveBy.message}</p>
      <button
        type="button"
        onClick={onNavigate}
        className="min-h-[44px] rounded-[var(--radius-control)] bg-campus-gold text-sm font-semibold text-campus-ink hover:brightness-95"
      >
        Navigate
      </button>
    </Card>
  );
}
