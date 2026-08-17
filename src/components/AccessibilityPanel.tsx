import {
  Accessibility,
  Clock,
  DoorOpen,
  Ear,
  MessageSquareText,
  ShieldCheck,
  Toilet,
  Type,
  Users,
  Volume2
} from "lucide-react";
import { isSpeechAvailable } from "../lib/speech";
import type { Campus, CampusPreferences } from "../types/campus";
import { Card, IconTile, SectionHeading, Toggle } from "./ui/Primitives";

const PREFERENCE_ROWS: {
  key: keyof CampusPreferences;
  label: string;
  description: string;
  icon: typeof Accessibility;
  disabled?: (campus: Campus) => boolean;
}[] = [
  {
    key: "stepFree",
    label: "Prefer step-free routes",
    description: "Always route through ramps, elevators, and accessible entrances — even if it takes a little longer.",
    icon: Accessibility
  },
  {
    key: "avoidCrowds",
    label: "Avoid crowded walkways",
    description: "Route around the busiest plazas and hallways, especially between classes.",
    icon: Users
  },
  {
    key: "calmRoute",
    label: "Prefer a calmer route",
    description: "Favor quieter, lower-stimulation paths like the Reflection Pond over busy plazas.",
    icon: Ear
  },
  {
    key: "restroomStop",
    label: "Include a restroom stop",
    description: "Route through the nearest restroom-equipped building along the way.",
    icon: Toilet
  },
  {
    key: "extraTime",
    label: "Add extra time",
    description: "Stretch walk-time and \"leave by\" estimates by 25% for a more relaxed pace.",
    icon: Clock
  },
  {
    key: "simplifiedDirections",
    label: "Simplified directions",
    description: "Shorter, one-action-at-a-time instructions instead of full sentences.",
    icon: MessageSquareText
  },
  {
    key: "reassurance",
    label: "Reassurance messages",
    description: "Add calm, encouraging check-ins along your route.",
    icon: ShieldCheck
  },
  {
    key: "largerText",
    label: "Larger text",
    description: "Increase text size throughout the app.",
    icon: Type
  },
  {
    key: "audioGuidance",
    label: "Speak directions aloud",
    description: "Read the current guidance step out loud as you walk.",
    icon: Volume2,
    disabled: () => !isSpeechAvailable()
  }
];

export function AccessibilityPanel({
  campus,
  preferences,
  onTogglePreference
}: {
  campus: Campus;
  preferences: CampusPreferences;
  onTogglePreference: (key: keyof CampusPreferences) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Beacon University</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Accessibility & Preferences</h1>
        <p className="mt-1 text-sm text-white/60">
          These preferences change how Beacon actually routes you — not just how the app looks.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PREFERENCE_ROWS.map((row) => {
          const Icon = row.icon;
          const isDisabled = row.disabled?.(campus) ?? false;
          return (
            <Card key={row.key} className={`flex items-start gap-3 ${isDisabled ? "opacity-50" : ""}`}>
              <IconTile tone={preferences[row.key] ? "gold" : "neutral"}>
                <Icon size={16} aria-hidden="true" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{row.label}</p>
                <p className="mt-0.5 text-xs text-white/55">
                  {isDisabled ? "Not supported in this browser." : row.description}
                </p>
              </div>
              <Toggle checked={preferences[row.key] as boolean} onChange={() => onTogglePreference(row.key)} label={row.label} />
            </Card>
          );
        })}
      </div>

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
