import { useState } from "react";
import { Building2 } from "lucide-react";
import { Badge, Card, IconTile, SectionHeading, cx } from "../../ui/Primitives";
import { BarRow, ConsiderationNote, HeatmapGrid, SectionIntro, TrendPill } from "./ExecutiveCharts";
import {
  DESTINATION_ROWS,
  EVENTS,
  EVENT_READINESS_NOTE,
  HARDEST_TO_REACH,
  HIGHEST_COMPLETION,
  TIME_HEATMAP,
  TIME_HEATMAP_DAYS,
  TIME_HEATMAP_HOURS,
  TRENDING_DESTINATIONS,
  VISITOR_INTEL,
  scaleVolume,
  type DateRangeId,
  type EventAnalytic
} from "./executiveData";

export function DestinationsSection({ range }: { range: DateRangeId }) {
  const [category, setCategory] = useState<string | "all">("all");
  const categories = ["all", ...Array.from(new Set(DESTINATION_ROWS.map((d) => d.category)))];
  const rows = category === "all" ? DESTINATION_ROWS : DESTINATION_ROWS.filter((d) => d.category === category);
  const maxSearches = Math.max(...DESTINATION_ROWS.map((d) => d.searches30d));

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro eyebrow="Destination Intelligence" title="Where people are trying to go" description="Search demand, arrival success, and recalculation rate by destination." />

      <div className="flex flex-wrap gap-2 text-xs">
        <SummaryChip label="Trending" values={TRENDING_DESTINATIONS} />
        <SummaryChip label="Hardest to reach" values={HARDEST_TO_REACH} />
        <SummaryChip label="Highest completion" values={HIGHEST_COMPLETION} />
      </div>

      <div role="radiogroup" aria-label="Category" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            onClick={() => setCategory(c)}
            className={cx(
              "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold capitalize",
              category === c ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/85"
            )}
          >
            {c === "all" ? "All categories" : c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((d) => (
          <Card key={d.id} className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <IconTile>
                  <Building2 size={15} aria-hidden="true" />
                </IconTile>
                <div>
                  <p className="text-sm font-bold text-white">{d.name}</p>
                  <Badge tone="neutral">{d.category}</Badge>
                </div>
              </div>
              <TrendPill deltaPct={d.trend === "up" ? 9 : d.trend === "down" ? -9 : 0} />
            </div>
            <BarRow label="Searches" value={scaleVolume(d.searches30d, range)} max={scaleVolume(maxSearches, range)} tone="sky" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-white/60 sm:grid-cols-4">
              <span>
                <span className="font-semibold text-white">{d.completionPct}%</span> arrival success
              </span>
              <span>
                <span className="font-semibold text-white">{d.recalcPct}%</span> recalculation
              </span>
              <span className="truncate">
                Origin: <span className="font-medium text-white/80">{d.commonOrigin}</span>
              </span>
              <span className="truncate">
                Peak: <span className="font-medium text-white/80">{d.peakUsage}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryChip({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 text-white/80">{values.join(", ")}</p>
    </div>
  );
}

export function VisitorsSection({ range }: { range: DateRangeId }) {
  const maxFunnel = VISITOR_INTEL.funnel[0].count;

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="First-Time Visitor Experience"
        title="Prospective students, families, and event guests"
        description="Visitor-specific journeys tend to start cold — from a parking lot with no prior context — so friction here has outsized impact on first impressions."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Visitor journeys" value={scaleVolume(VISITOR_INTEL.journeys30d, range).toLocaleString()} />
        <MiniStat label="Route completion" value={`${VISITOR_INTEL.completionPct.toFixed(1)}%`} />
        <MiniStat label="Recalculations" value={`${VISITOR_INTEL.recalcPct.toFixed(1)}%`} />
        <MiniStat label="Parking → destination journeys" value={scaleVolume(VISITOR_INTEL.parkingToDestination30d, range).toLocaleString()} />
      </div>

      <div>
        <SectionHeading title="Top visitor destinations" />
        <div className="flex flex-wrap gap-1.5">
          {VISITOR_INTEL.topDestinations.map((d) => (
            <Badge key={d} tone="info">
              {d}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Visitor Journey Funnel" />
        <Card className="flex flex-col gap-3">
          {VISITOR_INTEL.funnel.map((stage, i) => {
            const prev = i > 0 ? VISITOR_INTEL.funnel[i - 1].count : stage.count;
            const dropoffPct = prev > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0;
            return (
              <div key={stage.stage} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">{stage.stage}</span>
                  <span className="font-semibold text-white/85">{scaleVolume(stage.count, range).toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full rounded-full bg-campus-gold" style={{ width: `${Math.max(4, (stage.count / maxFunnel) * 100)}%` }} />
                </div>
                {i > 0 && dropoffPct > 0 && <p className="text-[11px] text-white/40">↓ {dropoffPct}% from previous stage</p>}
              </div>
            );
          })}
        </Card>
        <ConsiderationNote>{VISITOR_INTEL.frictionNote}</ConsiderationNote>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 p-3">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] font-medium text-white/55">{label}</p>
    </Card>
  );
}

export function EventsSection() {
  const [eventId, setEventId] = useState(EVENTS[0].id);
  const event = EVENTS.find((e) => e.id === eventId) as EventAnalytic;

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro eyebrow="Campus Events Mode" title="Beacon activity around named campus events" description="Move-in, games, admissions events, and finals week each show a distinct usage fingerprint." />

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEventId(e.id)}
            aria-pressed={eventId === e.id}
            className={cx(
              "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold",
              eventId === e.id ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/85"
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-base font-bold text-white">{event.name}</p>
            <p className="text-xs text-white/50">
              {event.type} · {event.date}
            </p>
          </div>
          <Badge tone="success">{event.completionPct}% completion</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Journeys" value={event.journeys.toLocaleString()} />
          <MiniStat label="Unique users" value={event.uniqueUsers.toLocaleString()} />
          <MiniStat label="Accessibility routing" value={`${event.accessibilityPct}%`} />
          <MiniStat label="Lower-sensory routing" value={`${event.sensoryPct}%`} />
          <MiniStat label="Assistance requests" value={String(event.assistanceRequests)} />
          <MiniStat label="Recovery Mode" value={String(event.recoveryActivations)} />
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-white/60 sm:grid-cols-2">
          <p>
            Peak period: <span className="font-medium text-white/85">{event.peakPeriod}</span>
          </p>
          <p>
            Top destinations: <span className="font-medium text-white/85">{event.topDestinations.join(", ")}</span>
          </p>
          <p>
            Parking origins: <span className="font-medium text-white/85">{event.parkingOrigins.join(", ")}</span>
          </p>
        </div>

        <div>
          <SectionHeading title="Pre / During / Post" />
          <div className="grid grid-cols-3 gap-2">
            {event.phases.map((p) => (
              <Card key={p.phase} className="flex flex-col gap-1 p-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{p.phase}</p>
                <p className="text-lg font-bold text-white">{p.journeys.toLocaleString()}</p>
                <p className="text-[11px] text-white/50">{p.completionPct}% completion</p>
              </Card>
            ))}
          </div>
        </div>

        <ConsiderationNote>{event.frictionNote}</ConsiderationNote>
      </Card>

      <div>
        <SectionHeading title="Event Readiness — Home Football Games" />
        <Card className="flex flex-col gap-2 border-campus-gold/25 bg-campus-gold/[0.06]">
          <p className="text-sm text-white/80">Based on historical Beacon data for comparable past events:</p>
          <ConsiderationNote>{EVENT_READINESS_NOTE}</ConsiderationNote>
        </Card>
      </div>
    </div>
  );
}

export function PatternsSection() {
  return (
    <div className="flex flex-col gap-6">
      <SectionIntro eyebrow="Time-Based Campus Patterns" title="When campus experiences the most navigation demand" description="Aggregated by hour and day — useful for staffing, signage timing, and event planning." />

      <div>
        <SectionHeading title="Journey demand by day and hour" />
        <Card>
          <HeatmapGrid rows={TIME_HEATMAP} rowLabels={TIME_HEATMAP_DAYS} colLabels={TIME_HEATMAP_HOURS} />
          <p className="mt-3 text-[11px] text-white/40">Darker cells indicate higher relative journey volume for that day and hour.</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <p className="text-sm text-white/70">
          Weekday demand peaks twice — a morning class-change wave and a midday lunch wave centered on Hendrix Student Center. Weekends show a single
          broader afternoon peak driven by events and casual campus use.
        </p>
        <p className="text-[11px] text-white/40">Pattern is illustrative — a production deployment would refine this from real timestamped journeys.</p>
      </Card>
    </div>
  );
}
