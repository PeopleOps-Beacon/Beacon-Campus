import { AlertTriangle, ArrowRightLeft, DoorOpen, HelpCircle, Users, Volume1 } from "lucide-react";
import type { CampusPreferences, DestinationIntel, Elevator, Entrance, ExertionEstimate } from "../../types/campus";
import { Badge, Card, IconTile, cx } from "../ui/Primitives";

/**
 * Reusable accessibility building blocks — shared across Map/Building
 * Detail/Navigation/Arrival wherever accessibility state needs to render
 * consistently. Kept venue-agnostic (Campus-specific copy lives in the
 * screens that use these, not in the components themselves) so the same
 * shapes could serve Beacon Airport, Theme Park, or other future venues.
 */

// ---------------------------------------------------------------------------
// Status labels — always a clear word, never a bare icon or color alone.
// ---------------------------------------------------------------------------

export type AccessibilityStatus = "accessible" | "accessible-elevator" | "partially-accessible" | "temporary-barrier" | "alternate-entrance-required" | "status-unknown";

const STATUS_META: Record<AccessibilityStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  accessible: { label: "Accessible", tone: "success" },
  "accessible-elevator": { label: "Accessible with Elevator", tone: "success" },
  "partially-accessible": { label: "Partially Accessible", tone: "warning" },
  "temporary-barrier": { label: "Temporary Barrier", tone: "danger" },
  "alternate-entrance-required": { label: "Alternate Entrance Required", tone: "warning" },
  "status-unknown": { label: "Status Unknown", tone: "neutral" }
};

export function AccessibilityStatusBadge({ status }: { status: AccessibilityStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Entrance
// ---------------------------------------------------------------------------

export function AccessibleEntranceCard({
  entrance,
  isRecommended,
  closed,
  onNavigate
}: {
  entrance: Entrance;
  isRecommended?: boolean;
  /** True when an active alert names this specific entrance as closed/substituted. */
  closed?: boolean;
  onNavigate?: () => void;
}) {
  const status: AccessibilityStatus = closed ? "temporary-barrier" : entrance.accessible ? "accessible" : "status-unknown";
  return (
    <Card className={cx("flex flex-col gap-2.5", isRecommended && !closed && "border-campus-green/25 bg-campus-green/[0.06]")}>
      <div className="flex items-start gap-3">
        <IconTile tone={closed ? "danger" : entrance.accessible ? "success" : "neutral"}>
          <DoorOpen size={16} aria-hidden="true" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-white">{entrance.label}</p>
            {isRecommended && !closed && <Badge tone="success">Recommended</Badge>}
          </div>
          <p className="text-xs capitalize text-white/50">{entrance.side} side</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <AccessibilityStatusBadge status={status} />
        {entrance.automaticDoor && <Badge tone="info">Automatic doors</Badge>}
      </div>
      {entrance.notes && <p className="text-xs text-white/55">{entrance.notes}</p>}
      {onNavigate && (
        <button type="button" onClick={onNavigate} className="self-start text-xs font-semibold text-campus-sky hover:underline">
          Navigate to this entrance
        </button>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Elevator
// ---------------------------------------------------------------------------

export function ElevatorStatusCard({ elevator, alternate }: { elevator: Elevator; alternate?: Elevator }) {
  const operational = elevator.status === "operational";
  return (
    <Card className={cx("flex flex-col gap-2.5", !operational && "border-campus-amber/25 bg-campus-gold/[0.06]")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">{elevator.label}</p>
          <p className="text-xs text-white/50">Floors {elevator.floorsServed.join(", ")}</p>
        </div>
        <Badge tone={operational ? "success" : "danger"}>{operational ? "Operational" : "Out of Service"}</Badge>
      </div>
      {!operational && elevator.note && (
        <p className="flex items-start gap-2 text-xs text-white/65">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-campus-amber" aria-hidden="true" />
          {elevator.note}
        </p>
      )}
      {!operational && alternate && (
        <p className="flex items-center gap-2 text-xs font-medium text-campus-sky">
          <ArrowRightLeft size={13} className="shrink-0" aria-hidden="true" />
          Beacon reroutes to {alternate.label.toLowerCase()} instead.
        </p>
      )}
      {!operational && !alternate && (
        <p className="flex items-center gap-2 text-xs font-medium text-red-300">
          <HelpCircle size={13} className="shrink-0" aria-hidden="true" />
          No alternate elevator in this building right now.
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sensory / crowd level — a 1–5 scale from the data model, always paired
// with a word (Low/Moderate/High), never color alone.
// ---------------------------------------------------------------------------

function levelWord(level: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (level <= 2) return { label: "Low", tone: "success" };
  if (level <= 3) return { label: "Moderate", tone: "warning" };
  return { label: "High", tone: "danger" };
}

export function CrowdIndicator({ level }: { level: number }) {
  const { label, tone } = levelWord(level);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70">
      <Users size={13} className="text-white/40" aria-hidden="true" />
      <Badge tone={tone}>{label} crowd</Badge>
    </span>
  );
}

export function SensoryIndicator({ level }: { level: number }) {
  const { label, tone } = levelWord(level);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70">
      <Volume1 size={13} className="text-white/40" aria-hidden="true" />
      <Badge tone={tone}>{label} noise</Badge>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Personalized arrival experience — shown before Start Route so the
// traveler has confidence in the route before committing to it.
// ---------------------------------------------------------------------------

const SUMMARY_PREFERENCE_LABELS: Partial<Record<keyof CampusPreferences, string>> = {
  stepFree: "Step-Free",
  calmRoute: "Lower Sensory",
  avoidCrowds: "Fewer Crowds",
  seatingStops: "Seating Nearby",
  indoorPreferred: "Indoor Preferred",
  minimizeElevation: "Flatter Route",
  avoidStairs: "Elevator Preferred"
};

export function RouteAccessibilitySummary({ preferences, intel, exertion }: { preferences: CampusPreferences; intel: DestinationIntel; exertion?: ExertionEstimate | null }) {
  const activeLabels = (Object.keys(SUMMARY_PREFERENCE_LABELS) as (keyof CampusPreferences)[])
    .filter((key) => preferences[key])
    .map((key) => SUMMARY_PREFERENCE_LABELS[key]!);

  if (activeLabels.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3 border-campus-gold/[0.18] bg-campus-gold/[0.05]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-campus-gold">Your Route Preferences</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {activeLabels.map((label) => (
            <Badge key={label} tone="selected">
              {label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">Beacon found</p>
        <p className="mt-1 text-sm font-semibold text-white">
          {intel.walkMinutes} min · Uses {intel.recommendedEntrance.label}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {preferences.stepFree && <Badge tone="success">Step-free</Badge>}
          {exertion && <Badge tone={exertion.tone}>{exertion.label} walk</Badge>}
          {intel.unconfirmedAccessiblePath && <Badge tone="danger">Accessible path not confirmed</Badge>}
        </div>
      </div>
    </Card>
  );
}
