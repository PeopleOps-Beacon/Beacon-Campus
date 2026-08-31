import {
  Accessibility,
  Armchair,
  Clock,
  Contrast,
  DoorOpen,
  Ear,
  Eye,
  Footprints,
  Home,
  Lock,
  MessageSquareText,
  Mountain,
  ShieldCheck,
  Toilet,
  Type,
  Users,
  Volume2
} from "lucide-react";
import { isSpeechAvailable } from "../lib/speech";
import { PREFERENCE_DURATIONS } from "../hooks/usePreferences";
import type { Campus, CampusPreferences } from "../types/campus";
import { Card, IconTile, SectionHeading, Toggle, cx } from "./ui/Primitives";

type PreferenceGroup = "Mobility & Access" | "Sensory & Comfort" | "Guidance Style" | "Vision & Hearing";

const PREFERENCE_ROWS: {
  key: keyof CampusPreferences;
  label: string;
  description: string;
  icon: typeof Accessibility;
  group: PreferenceGroup;
  disabled?: (campus: Campus) => boolean;
}[] = [
  {
    key: "stepFree",
    label: "Prefer step-free routes",
    description: "Always route through ramps, elevators, and accessible entrances — even if it takes a little longer.",
    icon: Accessibility,
    group: "Mobility & Access"
  },
  {
    key: "avoidStairs",
    label: "Prefer elevator over stairs",
    description: "When a building offers both, guide me to the elevator instead of the stairs.",
    icon: Footprints,
    group: "Mobility & Access"
  },
  {
    key: "minimizeElevation",
    label: "Minimize steep slopes",
    description: "Favor flatter paths, even if it takes a little longer to get there.",
    icon: Mountain,
    group: "Mobility & Access"
  },
  {
    key: "restroomStop",
    label: "Include a restroom stop",
    description: "Route through the nearest restroom-equipped building along the way.",
    icon: Toilet,
    group: "Mobility & Access"
  },
  {
    key: "calmRoute",
    label: "Prefer a calmer route",
    description: "Favor quieter, lower-stimulation paths like the Reflection Pond over busy plazas.",
    icon: Ear,
    group: "Sensory & Comfort"
  },
  {
    key: "avoidCrowds",
    label: "Avoid crowded walkways",
    description: "Route around the busiest plazas and hallways, especially between classes.",
    icon: Users,
    group: "Sensory & Comfort"
  },
  {
    key: "indoorPreferred",
    label: "Prefer indoor routes",
    description: "Favor climate-controlled connectors and lobbies over open outdoor stretches.",
    icon: Home,
    group: "Sensory & Comfort"
  },
  {
    key: "seatingStops",
    label: "Show seating along my route",
    description: "Highlight benches and indoor seating opportunities as you walk, and prioritize them in Rest & Resume.",
    icon: Armchair,
    group: "Sensory & Comfort"
  },
  {
    key: "simplifiedDirections",
    label: "Simplified directions",
    description: "Shorter, one-action-at-a-time instructions instead of full sentences.",
    icon: MessageSquareText,
    group: "Guidance Style"
  },
  {
    key: "reassurance",
    label: "Reassurance messages",
    description: "Add calm, encouraging check-ins along your route.",
    icon: ShieldCheck,
    group: "Guidance Style"
  },
  {
    key: "extraTime",
    label: "Add extra time",
    description: "Stretch walk-time and \"leave by\" estimates by 25% for a more relaxed pace.",
    icon: Clock,
    group: "Guidance Style"
  },
  {
    key: "largerText",
    label: "Larger text",
    description: "Increase text size throughout the app.",
    icon: Type,
    group: "Vision & Hearing"
  },
  {
    key: "highContrast",
    label: "High contrast",
    description: "Stronger contrast on text and borders throughout the app.",
    icon: Contrast,
    group: "Vision & Hearing"
  },
  {
    key: "audioGuidance",
    label: "Speak directions aloud",
    description: "Read the current guidance step out loud as you walk.",
    icon: Volume2,
    group: "Vision & Hearing",
    disabled: () => !isSpeechAvailable()
  },
  {
    key: "visualAlerts",
    label: "Always show alerts visually",
    description: "Route changes, delays, and elevator outages always appear as an on-screen banner — never audio-only.",
    icon: Eye,
    group: "Vision & Hearing"
  }
];

const GROUPS: PreferenceGroup[] = ["Mobility & Access", "Sensory & Comfort", "Guidance Style", "Vision & Hearing"];

export function AccessibilityPanel({
  campus,
  preferences,
  expiry,
  onTogglePreference,
  onSetDuration
}: {
  campus: Campus;
  preferences: CampusPreferences;
  expiry: Partial<Record<keyof CampusPreferences, number>>;
  onTogglePreference: (key: keyof CampusPreferences) => void;
  onSetDuration: (key: keyof CampusPreferences, durationMs: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Accessibility & Preferences</h1>
        <p className="mt-1 text-sm text-white/60">
          These are personalization settings, not a diagnosis — turn on whatever helps, for as long as it helps. They
          change how Beacon actually routes you, not just how the app looks.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-campus-sky/25 bg-campus-sky/[0.06]">
        <IconTile tone="info">
          <Lock size={16} aria-hidden="true" />
        </IconTile>
        <p className="text-xs leading-relaxed text-white/70">
          Your accessibility preferences personalize your Beacon experience and are not displayed to other users. Campus
          leadership only ever sees aggregated, anonymous usage patterns — never your individual profile.
        </p>
      </Card>

      {GROUPS.map((group) => (
        <div key={group}>
          <SectionHeading title={group} />
          <div className="flex flex-col gap-2">
            {PREFERENCE_ROWS.filter((row) => row.group === group).map((row) => {
              const Icon = row.icon;
              const isDisabled = row.disabled?.(campus) ?? false;
              const isOn = preferences[row.key] as boolean;
              const expiresAt = expiry[row.key];
              return (
                <Card key={row.key} className={isDisabled ? "opacity-50" : undefined}>
                  <div className="flex items-start gap-3">
                    <IconTile tone={isOn ? "gold" : "neutral"}>
                      <Icon size={16} aria-hidden="true" />
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{row.label}</p>
                      <p className="mt-0.5 text-xs text-white/55">
                        {isDisabled ? "Not supported in this browser." : row.description}
                      </p>
                    </div>
                    <Toggle checked={isOn} onChange={() => onTogglePreference(row.key)} label={row.label} />
                  </div>

                  {isOn && !isDisabled && (
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.06] pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Keep this on for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PREFERENCE_DURATIONS.map((duration) => {
                          const isSelected = duration.ms === null && !expiresAt;
                          return (
                            <button
                              key={duration.id}
                              type="button"
                              onClick={() => onSetDuration(row.key, duration.ms)}
                              className={cx(
                                "rounded-full px-2.5 py-1 text-xs font-medium",
                                isSelected ? "beacon-selected" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                              )}
                            >
                              {duration.label}
                            </button>
                          );
                        })}
                      </div>
                      {expiresAt && (
                        <p className="text-[11px] text-white/45">
                          Turns off automatically on {new Date(expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

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
