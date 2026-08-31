import { useState } from "react";
import { Bookmark, MapPin, Sparkles, X } from "lucide-react";
import { Badge, Button, Card, IconTile, cx } from "../../ui/Primitives";
import { SectionIntro, TrendPill } from "./ExecutiveCharts";
import { INSIGHTS, OPPORTUNITIES, type Confidence, type Opportunity, type OpportunityStatus, type SectionId } from "./executiveData";

const CONFIDENCE_META: Record<Confidence, { label: string; tone: "neutral" | "info" | "success" }> = {
  emerging: { label: "Emerging signal", tone: "neutral" },
  moderate: { label: "Moderate confidence", tone: "info" },
  strong: { label: "Strong confidence", tone: "success" }
};

const INSIGHT_SECTION: Record<string, SectionId> = {
  "long-hall-friction": "friction",
  "stadium-step-free": "accessibility",
  "sensory-midday": "sensory",
  "lot-c-recalc": "friction",
  "quiet-space-finals": "sensory"
};

export function InsightsSection({ onJump }: { onJump: (s: SectionId) => void }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [tracked, setTracked] = useState<Set<string>>(new Set());
  const visible = INSIGHTS.filter((i) => !dismissed.has(i.id));

  return (
    <div className="flex flex-col gap-5">
      <SectionIntro
        eyebrow="Beacon Insights"
        title="Plain-English observations from Beacon's aggregated signals"
        description="Generated from the same demo dataset as the rest of this dashboard — treat these as a starting point for review, not established fact."
      />

      {visible.length === 0 && <Card className="text-center text-sm text-white/50">No active insights — everything's been reviewed or dismissed.</Card>}

      <div className="flex flex-col gap-3">
        {visible.map((insight) => {
          const meta = CONFIDENCE_META[insight.confidence];
          const isTracked = tracked.has(insight.id);
          return (
            <Card key={insight.id} className="flex flex-col gap-3 border-campus-sky/[0.18] bg-campus-sky/[0.04]">
              <div className="flex items-start gap-3">
                <IconTile tone="info">
                  <Sparkles size={16} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug text-white">{insight.signal}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <TrendPill deltaPct={insight.trend === "up" ? 10 : insight.trend === "down" ? -10 : 0} />
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-white/35">Why it matters</dt>
                  <dd className="mt-0.5 text-white/70">{insight.whyItMatters}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-white/35">Potentially affected</dt>
                  <dd className="mt-0.5 text-white/70">{insight.peopleAffected}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-white/35">Recommended review</dt>
                  <dd className="mt-0.5 text-white/70">{insight.recommendedReview}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                <button type="button" onClick={() => onJump(INSIGHT_SECTION[insight.id] ?? "friction")} className="text-xs font-semibold text-campus-sky hover:underline">
                  View Data
                </button>
                {insight.locationId && (
                  <button type="button" onClick={() => onJump("map")} className="flex items-center gap-1 text-xs font-semibold text-campus-sky hover:underline">
                    <MapPin size={12} aria-hidden="true" />
                    View Location
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTracked((prev) => new Set(prev).add(insight.id))}
                  disabled={isTracked}
                  className="flex items-center gap-1 text-xs font-semibold text-white/60 hover:text-white disabled:text-campus-green"
                >
                  <Bookmark size={12} aria-hidden="true" />
                  {isTracked ? "Tracked" : "Track"}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed((prev) => new Set(prev).add(insight.id))}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-white/40 hover:text-white/70"
                >
                  <X size={12} aria-hidden="true" />
                  Dismiss
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const PRIORITY_TONE: Record<Opportunity["priority"], "danger" | "warning" | "neutral"> = {
  high: "danger",
  moderate: "warning",
  low: "neutral"
};

const STATUS_LABEL: Record<OpportunityStatus, string> = {
  new: "New",
  "under-review": "Under Review",
  planned: "Planned",
  "in-progress": "In Progress",
  resolved: "Resolved"
};

const STATUS_ORDER: OpportunityStatus[] = ["new", "under-review", "planned", "in-progress", "resolved"];

export function OpportunitiesSection() {
  const [items, setItems] = useState<Opportunity[]>(OPPORTUNITIES);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

  function advanceStatus(id: string) {
    setItems((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = STATUS_ORDER.indexOf(o.status);
        const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
        return { ...o, status: next };
      })
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionIntro
        eyebrow="Opportunities"
        title="Turning analytics into operational action"
        description="Each card is a candidate for a real team to review — status changes here are local to this demo, not sent anywhere."
      />

      <div className="flex flex-col gap-3">
        {items.map((o) => (
          <Card key={o.id} className={cx("flex flex-col gap-3", o.priority === "high" && "border-red-500/25 bg-red-500/[0.04]")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge tone={PRIORITY_TONE[o.priority]}>{o.priority === "high" ? "High Priority" : o.priority === "moderate" ? "Moderate Priority" : "Low Priority"}</Badge>
                <p className="mt-1.5 text-sm font-bold text-white">{o.location}</p>
              </div>
              <Badge tone={o.status === "resolved" ? "success" : "neutral"}>{STATUS_LABEL[o.status]}</Badge>
            </div>

            <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-semibold uppercase tracking-wide text-white/35">Observed</dt>
                <dd className="mt-0.5 text-white/70">{o.observedSignal}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-white/35">Potential impact</dt>
                <dd className="mt-0.5 text-white/70">{o.potentialImpact}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-white/35">Suggested review</dt>
                <dd className="mt-0.5 text-white/70">{o.suggestedReview}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-white/35">Owner</dt>
                <dd className="mt-0.5 text-white/70">{o.department}</dd>
              </div>
            </dl>

            {savedNotes[o.id] && <p className="rounded-[var(--radius-control)] bg-white/[0.05] px-3 py-2 text-xs text-white/65">Note: {savedNotes[o.id]}</p>}

            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center">
              <input
                value={noteDraft[o.id] ?? ""}
                onChange={(e) => setNoteDraft((prev) => ({ ...prev, [o.id]: e.target.value }))}
                placeholder="Add a note…"
                className="min-h-[36px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-xs text-white placeholder:text-white/35"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  tone="ghost"
                  className="min-h-[36px] px-3 text-xs"
                  onClick={() => {
                    if (!noteDraft[o.id]?.trim()) return;
                    setSavedNotes((prev) => ({ ...prev, [o.id]: noteDraft[o.id].trim() }));
                    setNoteDraft((prev) => ({ ...prev, [o.id]: "" }));
                  }}
                >
                  Add Note
                </Button>
                <Button tone="ghost" className="min-h-[36px] px-3 text-xs" onClick={() => advanceStatus(o.id)} disabled={o.status === "resolved"}>
                  {o.status === "new" ? "Assign" : o.status === "resolved" ? "Resolved" : "Track"}
                </Button>
                <Button
                  tone="secondary"
                  className="min-h-[36px] px-3 text-xs"
                  onClick={() => setItems((prev) => prev.map((item) => (item.id === o.id ? { ...item, status: "resolved" } : item)))}
                  disabled={o.status === "resolved"}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
