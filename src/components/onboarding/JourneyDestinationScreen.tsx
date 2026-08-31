import { ChevronLeft } from "lucide-react";
import type { Campus, CampusPreferences, SearchResult } from "../../types/campus";
import { Badge, Button } from "../ui/Primitives";
import { SearchBar } from "../SearchBar";
import { SearchResultsList } from "../SearchResultsList";
import { JourneyProgress } from "./JourneyProgress";

const SUMMARY_PREFERENCE_LABELS: Partial<Record<keyof CampusPreferences, string>> = {
  stepFree: "Wheelchair / Step-Free",
  avoidStairs: "Avoid Stairs",
  minimizeDistance: "Shorter Distance",
  seatingStops: "More Rest Stops",
  restroomStop: "Accessible Restrooms",
  calmRoute: "Lower Stimulation",
  avoidCrowds: "Avoid Crowds",
  simplifiedDirections: "Simpler Directions",
  reassurance: "More Reassurance",
  indoorPreferred: "Indoor Preferred",
  outdoorPreferred: "Outdoor Preferred",
  serviceAnimalSupport: "Service Animal Support"
};

export function JourneyDestinationScreen({
  campus,
  preferences,
  stopLabels,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectDestination,
  onSkip,
  onBack
}: {
  campus: Campus;
  preferences: CampusPreferences;
  stopLabels: string[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchResults: SearchResult[];
  onSelectDestination: (result: SearchResult) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const activePreferenceLabels = (Object.keys(SUMMARY_PREFERENCE_LABELS) as (keyof CampusPreferences)[])
    .filter((key) => preferences[key])
    .map((key) => SUMMARY_PREFERENCE_LABELS[key]!);

  return (
    <div className="flex h-full flex-col">
      <JourneyProgress current={3} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <button type="button" onClick={onBack} className="mb-2 flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white/80">
          <ChevronLeft size={14} aria-hidden="true" />
          Back
        </button>

        <h1 className="text-[var(--font-display)] font-bold text-white">Where are you headed?</h1>
        <p className="mt-2 text-sm text-white/60">Beacon already knows what would make this trip work better for you.</p>

        {(activePreferenceLabels.length > 0 || stopLabels.length > 0) && (
          <div className="mt-3 flex flex-col gap-2 rounded-[var(--radius-card)] border border-campus-gold/[0.15] bg-campus-gold/[0.05] p-3">
            {activePreferenceLabels.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-campus-gold">Your needs</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {activePreferenceLabels.map((l) => (
                    <Badge key={l} tone="selected">
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {stopLabels.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-campus-gold">Stops</p>
                <p className="mt-0.5 text-xs text-white/70">{stopLabels.join(" → ")}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <SearchBar value={searchQuery} onChange={onSearchQueryChange} autoFocus placeholder="Search a building, room, or service" />
        </div>

        <div className="mt-4">
          {searchQuery.trim() ? (
            <SearchResultsList results={searchResults} query={searchQuery} onSelect={onSelectDestination} />
          ) : (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40">Popular destinations</p>
              <div className="flex flex-col gap-1.5">
                {campus.buildings.slice(0, 5).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectDestination({ id: b.id, kind: "building", title: b.name, subtitle: b.description, buildingId: b.id, score: 0 })}
                    className="flex w-full items-center justify-between rounded-[var(--radius-control)] px-2.5 py-2.5 text-left text-sm font-medium text-white hover:bg-white/[0.06]"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button tone="ghost" className="text-white/50" onClick={onSkip}>
          I'll explore on my own
        </Button>
      </div>
    </div>
  );
}
