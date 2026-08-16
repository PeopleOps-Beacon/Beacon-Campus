import { Accessibility, Ear, SlidersHorizontal, Zap } from "lucide-react";
import { getDestinationIntel, type DestinationTarget } from "../lib/campusEngine";
import { ROUTE_MODE_META, effectivePreferences, type Campus, type CampusPreferences, type RouteMode } from "../types/campus";
import { Button, Card, IconTile, cx } from "./ui/Primitives";

const MODE_ICON: Record<RouteMode, typeof Zap> = {
  fastest: Zap,
  calm: Ear,
  mobility: Accessibility,
  custom: SlidersHorizontal
};

const MODES: RouteMode[] = ["fastest", "calm", "mobility", "custom"];

export function RouteModeScreen({
  campus,
  target,
  startNodeId,
  basePreferences,
  now,
  selectedMode,
  onSelectMode,
  onContinue
}: {
  campus: Campus;
  target: DestinationTarget;
  startNodeId: string;
  basePreferences: CampusPreferences;
  now: Date;
  selectedMode: RouteMode;
  onSelectMode: (mode: RouteMode) => void;
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
          const intel = getDestinationIntel(campus, target, { fromNodeId: startNodeId, preferences, now });
          const Icon = MODE_ICON[mode];
          const active = mode === selectedMode;
          const meta = ROUTE_MODE_META[mode];
          return (
            <button key={mode} type="button" onClick={() => onSelectMode(mode)} className="text-left">
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
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{intel ? `${intel.walkMinutes} min` : "—"}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <Button tone="primary" onClick={onContinue} className="mt-auto">
        Start Route
      </Button>
    </div>
  );
}

function summarizeCustom(preferences: CampusPreferences): string {
  const active = Object.entries(preferences)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (active.length === 0) return "No preferences set — same as Fastest.";
  return `Active: ${active.length} preference${active.length > 1 ? "s" : ""} from your settings.`;
}
