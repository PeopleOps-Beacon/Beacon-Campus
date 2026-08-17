import { Accessibility, Clock, Ear, SlidersHorizontal, Toilet, Users, Zap } from "lucide-react";
import { computeRoutePlan, estimateExertion, type DestinationTarget } from "../lib/campusEngine";
import { ROUTE_MODE_META, effectivePreferences, type Campus, type CampusPreferences, type RouteMode } from "../types/campus";
import { Badge, Button, Card, IconTile, Toggle, cx } from "./ui/Primitives";

const MODE_ICON: Record<RouteMode, typeof Zap> = {
  fastest: Zap,
  calm: Ear,
  mobility: Accessibility,
  custom: SlidersHorizontal
};

const MODES: RouteMode[] = ["fastest", "calm", "mobility", "custom"];

const CUSTOM_ROWS: { key: keyof CampusPreferences; label: string; icon: typeof Accessibility }[] = [
  { key: "stepFree", label: "Step-free only", icon: Accessibility },
  { key: "avoidCrowds", label: "Avoid crowds", icon: Users },
  { key: "calmRoute", label: "Calmer route", icon: Ear },
  { key: "restroomStop", label: "Restroom stop", icon: Toilet },
  { key: "extraTime", label: "Extra time", icon: Clock }
];

export function RouteModeScreen({
  campus,
  target,
  startNodeId,
  basePreferences,
  now,
  selectedMode,
  onSelectMode,
  onTogglePreference,
  onContinue
}: {
  campus: Campus;
  target: DestinationTarget;
  startNodeId: string;
  basePreferences: CampusPreferences;
  now: Date;
  selectedMode: RouteMode;
  onSelectMode: (mode: RouteMode) => void;
  onTogglePreference: (key: keyof CampusPreferences) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Choose how Beacon should guide you</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Pick a Route</h1>
      </div>

      <div className="flex flex-col gap-2.5">
        {MODES.map((mode) => {
          const preferences = effectivePreferences(basePreferences, mode);
          const plan = computeRoutePlan(campus, target, { fromNodeId: startNodeId, preferences, now });
          const exertion = plan ? estimateExertion(campus, plan.path) : null;
          const Icon = MODE_ICON[mode];
          const active = mode === selectedMode;
          const meta = ROUTE_MODE_META[mode];
          return (
            <div key={mode} className="flex flex-col gap-2">
              <button type="button" onClick={() => onSelectMode(mode)} className="text-left">
                <Card
                  className={cx(
                    "flex items-center gap-3",
                    active ? "border-campus-gold/50 bg-campus-gold/[0.06]" : undefined
                  )}
                >
                  <IconTile tone={active ? "gold" : "neutral"}>
                    <Icon size={18} aria-hidden="true" />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{meta.label}</p>
                    <p className="text-xs text-white/55">{mode === "custom" ? summarizeCustom(basePreferences) : meta.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-white">{plan ? `${plan.destination.walkMinutes} min` : "—"}</p>
                    {exertion && <Badge tone={exertion.tone}>{exertion.label}</Badge>}
                  </div>
                </Card>
              </button>

              {mode === "custom" && active && (
                <Card className="flex flex-col gap-0.5 border-campus-gold/20 bg-black/20 py-1">
                  {CUSTOM_ROWS.map((row) => {
                    const RowIcon = row.icon;
                    return (
                      <div key={row.key} className="flex items-center gap-3 py-2 first:pt-1 last:pb-1">
                        <RowIcon size={15} className="shrink-0 text-white/50" aria-hidden="true" />
                        <p className="min-w-0 flex-1 text-sm text-white/80">{row.label}</p>
                        <Toggle checked={basePreferences[row.key] as boolean} onChange={() => onTogglePreference(row.key)} label={row.label} />
                      </div>
                    );
                  })}
                </Card>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/40">
        Exertion (Easy / Moderate / Demanding) is an illustrative estimate based on general campus terrain, not surveyed elevation data.
      </p>

      <Button tone="primary" onClick={onContinue} className="mt-auto">
        Start Route
      </Button>
    </div>
  );
}

function summarizeCustom(preferences: CampusPreferences): string {
  const active = Object.entries(preferences)
    .filter(([key, v]) => v && CUSTOM_ROWS.some((row) => row.key === key))
    .map(([k]) => k);
  if (active.length === 0) return "Tap to set your own preferences.";
  return `Active: ${active.length} preference${active.length > 1 ? "s" : ""} — tap to edit.`;
}
