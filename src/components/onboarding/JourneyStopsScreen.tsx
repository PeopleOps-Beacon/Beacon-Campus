import { useMemo, useState } from "react";
import { Accessibility, ArrowDown, ArrowUp, Baby, Building2, ChevronLeft, PawPrint, Plus, Search, Toilet, Volume1, X } from "lucide-react";
import { nearestFacilities, search, type NearestFacilityResult } from "../../lib/campusEngine";
import { FACILITY_CATEGORY_META, type Campus, type CampusPreferences, type FacilityCategory, type SearchResult } from "../../types/campus";
import { Badge, Button, Card, IconTile, cx } from "../ui/Primitives";
import { JourneyProgress } from "./JourneyProgress";

const QUICK_ADD_CATEGORIES: { category: FacilityCategory; label: string; icon: typeof Toilet }[] = [
  { category: "accessible-restroom", label: "Wheelchair-Accessible Restroom", icon: Accessibility },
  { category: "restroom", label: "Restroom", icon: Toilet },
  { category: "quiet-space", label: "Quiet Space", icon: Volume1 },
  { category: "lactation-room", label: "Nursing / Lactation Room", icon: Baby },
  { category: "service-animal-relief", label: "Service Animal Relief Area", icon: PawPrint }
];

const CUSTOM_STOP_SUGGESTIONS = ["Accessibility Services", "Student Health Center", "Counseling", "Campus Safety"];

export function JourneyStopsScreen({
  campus,
  fromNodeId,
  preferences,
  activeWaypointFacilityIds,
  activeCustomStopBuildingIds,
  onAddWaypoint,
  onRemoveWaypoint,
  onReorderWaypoint,
  onAddCustomStop,
  onRemoveCustomStop,
  onReorderCustomStop,
  onContinue,
  onSkip,
  onBack
}: {
  campus: Campus;
  fromNodeId: string;
  preferences: CampusPreferences;
  activeWaypointFacilityIds: string[];
  activeCustomStopBuildingIds: string[];
  onAddWaypoint: (facilityId: string) => void;
  onRemoveWaypoint: (facilityId: string) => void;
  onReorderWaypoint: (facilityId: string, direction: -1 | 1) => void;
  onAddCustomStop: (buildingId: string) => void;
  onRemoveCustomStop: (buildingId: string) => void;
  onReorderCustomStop: (buildingId: string, direction: -1 | 1) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [openCategory, setOpenCategory] = useState<FacilityCategory | null>(null);
  const [keptNearby, setKeptNearby] = useState<Set<FacilityCategory>>(new Set());
  const [customSearchOpen, setCustomSearchOpen] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  const options: NearestFacilityResult[] = useMemo(
    () => (openCategory ? nearestFacilities(campus, openCategory, fromNodeId, preferences, 3) : []),
    [campus, openCategory, fromNodeId, preferences]
  );

  const customResults: SearchResult[] = useMemo(() => {
    if (!customQuery.trim()) return [];
    return search(campus, customQuery, 8).filter((r) => r.kind === "building" || r.kind === "service" || r.kind === "room" || r.kind === "department");
  }, [campus, customQuery]);

  const stops = [
    ...activeWaypointFacilityIds
      .map((id) => campus.facilities.find((f) => f.id === id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({ kind: "facility" as const, id: f.id, label: `${FACILITY_CATEGORY_META[f.category].label} — ${campus.buildings.find((b) => b.id === f.buildingId)?.name ?? ""}` })),
    ...activeCustomStopBuildingIds
      .map((id) => campus.buildings.find((b) => b.id === id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b))
      .map((b) => ({ kind: "custom" as const, id: b.id, label: b.name }))
  ];

  return (
    <div className="flex h-full flex-col">
      <JourneyProgress current={2} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <button type="button" onClick={onBack} className="mb-2 flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white/80">
          <ChevronLeft size={14} aria-hidden="true" />
          Back
        </button>

        <h1 className="text-[var(--font-display)] font-bold text-white">Anything you need along the way?</h1>
        <p className="mt-2 text-sm text-white/60">Add a stop or tell Beacon what you'd like nearby during your journey.</p>

        {stops.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40">Your stops</p>
            <div className="flex flex-col gap-2">
              {stops.map((stop, index) => (
                <Card key={stop.id} className="flex items-center gap-2 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-campus-gold/15 text-[11px] font-bold text-campus-gold">
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{stop.label}</p>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      aria-label={`Move ${stop.label} earlier`}
                      disabled={index === 0}
                      onClick={() => (stop.kind === "facility" ? onReorderWaypoint(stop.id, -1) : onReorderCustomStop(stop.id, -1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white disabled:opacity-25"
                    >
                      <ArrowUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${stop.label} later`}
                      disabled={index === stops.length - 1}
                      onClick={() => (stop.kind === "facility" ? onReorderWaypoint(stop.id, 1) : onReorderCustomStop(stop.id, 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white disabled:opacity-25"
                    >
                      <ArrowDown size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${stop.label}`}
                      onClick={() => (stop.kind === "facility" ? onRemoveWaypoint(stop.id) : onRemoveCustomStop(stop.id))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40">Quick add</p>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ADD_CATEGORIES.map((c) => {
              const Icon = c.icon;
              const alreadyAdded = activeWaypointFacilityIds.some((id) => campus.facilities.find((f) => f.id === id)?.category === c.category);
              return (
                <button
                  key={c.category}
                  type="button"
                  onClick={() => setOpenCategory(openCategory === c.category ? null : c.category)}
                  aria-pressed={openCategory === c.category}
                  className={cx(
                    "card-surface flex min-h-[76px] flex-col items-start gap-2 rounded-[var(--radius-card)] border p-3 text-left",
                    openCategory === c.category ? "beacon-selected border-transparent" : "border-campus-gold/[0.12] bg-campus-surface text-white"
                  )}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="text-xs font-semibold leading-snug">{c.label}</span>
                  {alreadyAdded && <Badge tone={openCategory === c.category ? "neutral" : "success"}>Added</Badge>}
                </button>
              );
            })}
          </div>

          {openCategory && (
            <Card className="mt-2.5 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-white/70">{FACILITY_CATEGORY_META[openCategory].label} — nearest options</p>
              {options.length === 0 ? (
                <p className="text-xs text-white/50">
                  No verified {FACILITY_CATEGORY_META[openCategory].label.toLowerCase()} found nearby right now.
                  {preferences.stepFree ? " Accessibility status not verified for the closest matches, so they're not shown." : ""}
                </p>
              ) : (
                options.map((opt) => (
                  <div key={opt.facility.id} className="flex items-center gap-3 border-t border-white/[0.06] pt-2.5 first:border-t-0 first:pt-0">
                    <IconTile tone={opt.accessible ? "success" : "neutral"}>
                      <Building2 size={15} aria-hidden="true" />
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{opt.building.name}</p>
                      <p className="text-xs text-white/50">
                        {opt.minutes} min away{opt.accessible ? " · Accessible" : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {options.length > 0 && (
                <div className="flex gap-2 pt-1">
                  <Button
                    tone="primary"
                    className="flex-1 text-xs"
                    onClick={() => {
                      onAddWaypoint(options[0].facility.id);
                      setOpenCategory(null);
                    }}
                  >
                    Add as a stop
                  </Button>
                  <Button
                    tone="secondary"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setKeptNearby((prev) => new Set(prev).add(openCategory));
                      setOpenCategory(null);
                    }}
                  >
                    Keep nearby
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {keptNearby.size > 0 && (
          <p className="mt-3 text-xs text-white/45">
            Beacon will show nearby {Array.from(keptNearby).map((c) => FACILITY_CATEGORY_META[c].label.toLowerCase()).join(", ")} during your trip
            without adding a stop.
          </p>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setCustomSearchOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-[var(--radius-control)] border border-dashed border-white/15 px-3 py-3 text-left text-sm font-medium text-white/70 hover:border-white/25 hover:text-white"
          >
            <Plus size={16} aria-hidden="true" />
            Add Custom Stop
          </button>

          {customSearchOpen && (
            <div className="mt-2.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3">
                <Search size={14} className="text-white/40" aria-hidden="true" />
                <input
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Bookstore, Financial Aid, Registrar…"
                  className="min-h-[44px] flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
              </div>

              {!customQuery.trim() && (
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOM_STOP_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomQuery(s)}
                      className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/60 hover:bg-white/[0.1]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {customResults.map((r) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    type="button"
                    onClick={() => {
                      onAddCustomStop(r.buildingId);
                      setCustomQuery("");
                      setCustomSearchOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-[var(--radius-control)] px-2.5 py-2.5 text-left hover:bg-white/[0.06]"
                  >
                    <IconTile>
                      <Building2 size={15} aria-hidden="true" />
                    </IconTile>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{r.title}</span>
                      <span className="block truncate text-xs text-white/50">{r.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button tone="primary" onClick={onContinue}>
          Continue
        </Button>
        <Button tone="ghost" className="text-white/50" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
