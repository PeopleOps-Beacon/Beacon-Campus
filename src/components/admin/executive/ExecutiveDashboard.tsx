import { useState } from "react";
import { Activity, ChevronDown, Lock, X } from "lucide-react";
import type { Campus } from "../../../types/campus";
import type { UseAnalytics } from "../../../hooks/useAnalytics";
import { Badge, Card, IconTile, SectionHeading, cx } from "../../ui/Primitives";
import { CampusMap } from "../../CampusMap";
import {
  ConsiderationNote,
  KpiCard,
  SectionIntro,
  SeverityBadge,
  TrendPill
} from "./ExecutiveCharts";
import {
  DATE_RANGES,
  FRICTION_ROWS,
  HEALTH_SUMMARY,
  KPIS,
  MAP_HOTSPOTS,
  MAP_LAYERS,
  ROLES,
  ROLE_SECTION_ORDER,
  formatKpiValue,
  percentChange,
  scaleVolume,
  type DateRangeId,
  type MapLayerId,
  type RoleId,
  type SectionId
} from "./executiveData";
import { AccessibilitySection, SensorySection } from "./sectionsAccessibility";
import { DestinationsSection, VisitorsSection, EventsSection, PatternsSection } from "./sectionsDestinations";
import { InsightsSection, OpportunitiesSection } from "./sectionsInsights";
import { ImprovementsSection, ReassuranceSection, CompareSection, ReportsSection } from "./sectionsOperations";

const SECTION_LABEL: Record<SectionId, string> = {
  overview: "Overview",
  map: "Experience Map",
  friction: "Friction",
  accessibility: "Accessibility",
  sensory: "Sensory",
  destinations: "Destinations",
  visitors: "Visitors",
  events: "Events",
  patterns: "Patterns",
  insights: "Beacon Insights",
  opportunities: "Opportunities",
  improvements: "Improvements",
  reassurance: "Reassurance",
  compare: "Compare",
  reports: "Reports"
};

export function ExecutiveDashboard({ campus, analytics }: { campus: Campus; analytics: UseAnalytics }) {
  const [role, setRole] = useState<RoleId>("executive");
  const [range, setRange] = useState<DateRangeId>("30d");
  const [section, setSection] = useState<SectionId>("overview");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const sectionOrder = ROLE_SECTION_ORDER[role];
  const rangeLabel = DATE_RANGES.find((r) => r.id === range)?.label ?? "30 Days";
  const roleMeta = ROLES.find((r) => r.id === role)!;

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader
        role={role}
        roleMeta={roleMeta}
        roleMenuOpen={roleMenuOpen}
        onToggleRoleMenu={() => setRoleMenuOpen((v) => !v)}
        onSelectRole={(r) => {
          setRole(r);
          setRoleMenuOpen(false);
        }}
        range={range}
        onSelectRange={setRange}
      />

      <nav aria-label="Executive Dashboard sections" className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {sectionOrder.map((id) => {
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={active ? "page" : undefined}
              className={cx(
                "shrink-0 rounded-[var(--radius-pill)] px-3.5 py-2 text-xs font-semibold transition-[background-image,color]",
                active ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/90"
              )}
            >
              {SECTION_LABEL[id]}
            </button>
          );
        })}
      </nav>

      {section === "overview" && <OverviewSection range={range} rangeLabel={rangeLabel} campus={campus} analytics={analytics} onJump={setSection} />}
      {section === "map" && <ExperienceMapSection campus={campus} range={range} />}
      {section === "friction" && <FrictionSection range={range} />}
      {section === "accessibility" && <AccessibilitySection range={range} />}
      {section === "sensory" && <SensorySection range={range} />}
      {section === "destinations" && <DestinationsSection range={range} />}
      {section === "visitors" && <VisitorsSection range={range} />}
      {section === "events" && <EventsSection />}
      {section === "patterns" && <PatternsSection />}
      {section === "insights" && <InsightsSection onJump={setSection} />}
      {section === "opportunities" && <OpportunitiesSection />}
      {section === "improvements" && <ImprovementsSection />}
      {section === "reassurance" && <ReassuranceSection />}
      {section === "compare" && <CompareSection range={range} />}
      {section === "reports" && <ReportsSection rangeLabel={rangeLabel} />}
    </div>
  );
}

function DashboardHeader({
  role,
  roleMeta,
  roleMenuOpen,
  onToggleRoleMenu,
  onSelectRole,
  range,
  onSelectRange
}: {
  role: RoleId;
  roleMeta: (typeof ROLES)[number];
  roleMenuOpen: boolean;
  onToggleRoleMenu: () => void;
  onSelectRole: (r: RoleId) => void;
  range: DateRangeId;
  onSelectRange: (r: DateRangeId) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-campus-gold">Beacon Executive Dashboard</p>
          <h1 className="text-xl font-bold text-white">Accessibility &amp; Experience Intelligence</h1>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleRoleMenu}
            aria-haspopup="listbox"
            aria-expanded={roleMenuOpen}
            className="flex min-h-[40px] items-center gap-2 rounded-[var(--radius-control)] border border-campus-gold/[0.15] bg-white/[0.05] px-3 text-sm font-medium text-white"
          >
            Viewing as: <span className="font-semibold text-campus-gold">{roleMeta.label}</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {roleMenuOpen && (
            <div role="listbox" aria-label="Choose a role view" className="card-surface absolute right-0 top-[calc(100%+6px)] z-20 w-72 rounded-[var(--radius-card)] border border-campus-gold/[0.15] bg-campus-elevated p-1.5 shadow-[var(--shadow-card)]">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="option"
                  aria-selected={r.id === role}
                  onClick={() => onSelectRole(r.id)}
                  className={cx(
                    "flex w-full flex-col items-start gap-0.5 rounded-[var(--radius-control)] px-3 py-2 text-left",
                    r.id === role ? "beacon-selected" : "text-white/80 hover:bg-white/[0.06]"
                  )}
                >
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className={cx("text-xs", r.id === role ? "text-campus-goldink/70" : "text-white/45")}>{r.blurb}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Date range" className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {DATE_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={range === r.id}
              onClick={() => onSelectRange(r.id)}
              className={cx(
                "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold",
                range === r.id ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/85"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <span
          title="Beacon Executive Insights uses aggregated experience and navigation data to help institutions identify patterns while protecting individual user privacy."
          tabIndex={0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-white/55"
        >
          <Lock size={11} aria-hidden="true" />
          Privacy &amp; Data Protection
        </span>
      </div>
    </div>
  );
}

function OverviewSection({
  range,
  rangeLabel,
  campus,
  analytics,
  onJump
}: {
  range: DateRangeId;
  rangeLabel: string;
  campus: Campus;
  analytics: UseAnalytics;
  onJump: (s: SectionId) => void;
}) {
  const primaryKpis = KPIS.filter((k) => k.primary);
  const secondaryKpis = KPIS.filter((k) => !k.primary);
  const searchTotal = Object.values(analytics.state.searchCounts).reduce((a, b) => a + b, 0);
  const destinationTotal = Object.values(analytics.state.destinationViewCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-start gap-3 border-campus-sky/25 bg-campus-sky/[0.06]">
        <IconTile tone="info">
          <Activity size={17} aria-hidden="true" />
        </IconTile>
        <p className="text-xs leading-relaxed text-white/65">
          The figures below are a modeled demo dataset representing a fictional Beacon deployment across {campus.universityName} —{" "}
          <span className="font-semibold text-white/80">{rangeLabel.toLowerCase()}</span>. Beacon Campus has no backend yet, so nothing here is
          production telemetry. The tile below it, "This browser session," is genuinely tracked from your own use of the app during this session.
        </p>
      </Card>

      <div>
        <SectionHeading title="Key metrics" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {primaryKpis.map((kpi) => {
            const value = kpi.format === "number" ? scaleVolume(kpi.baseValue, range) : kpi.baseValue;
            const prevValue = kpi.format === "number" ? scaleVolume(kpi.previousValue, range) : kpi.previousValue;
            return (
              <KpiCard
                key={kpi.id}
                label={kpi.label}
                value={formatKpiValue(value, kpi.format)}
                deltaPct={percentChange(value, prevValue)}
                invert={kpi.id === "avg-journey-time"}
                trend={kpi.trend}
                tooltip={kpi.tooltip}
              />
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading title="Additional metrics" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {secondaryKpis.map((kpi) => {
            const value = scaleVolume(kpi.baseValue, range);
            const prevValue = scaleVolume(kpi.previousValue, range);
            const goodWhenLower = kpi.id === "recalculations" || kpi.id === "assistance-requests";
            return (
              <Card key={kpi.id} className="flex flex-col gap-1.5 p-3">
                <p className="text-[11px] font-medium leading-tight text-white/55">{kpi.label}</p>
                <p className="text-lg font-bold text-white">{formatKpiValue(value, kpi.format)}</p>
                <TrendPill deltaPct={percentChange(value, prevValue)} invert={goodWhenLower} />
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading title="Beacon Campus Health" action={<span className="text-[11px] text-white/40">Synthesized, explainable summary — not a compliance score</span>} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HEALTH_SUMMARY.map((h) => (
            <Card key={h.id} className="flex items-start gap-3">
              <span
                className={cx(
                  "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                  h.tone === "success" ? "bg-campus-green" : h.tone === "warning" ? "bg-campus-amber" : "bg-campus-sky"
                )}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {h.label} <span className="font-normal text-white/60">— {h.status}</span>
                </p>
                <p className="mt-0.5 text-xs text-white/50">{h.note}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="This browser session (real, not modeled)" />
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="flex flex-col items-center gap-1 py-3 text-center">
            <p className="text-xl font-bold text-campus-gold">{searchTotal}</p>
            <p className="text-[11px] text-white/55">Searches</p>
          </Card>
          <Card className="flex flex-col items-center gap-1 py-3 text-center">
            <p className="text-xl font-bold text-campus-gold">{destinationTotal}</p>
            <p className="text-[11px] text-white/55">Destinations viewed</p>
          </Card>
          <Card className="flex flex-col items-center gap-1 py-3 text-center">
            <p className="text-xl font-bold text-campus-gold">{Object.keys(analytics.state.preferenceToggleCounts).length}</p>
            <p className="text-[11px] text-white/55">Preferences used</p>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onJump("insights")} className="text-xs font-semibold text-campus-sky hover:underline">
          View Beacon Insights →
        </button>
        <span className="text-white/20">·</span>
        <button type="button" onClick={() => onJump("opportunities")} className="text-xs font-semibold text-campus-sky hover:underline">
          View Opportunities →
        </button>
      </div>
    </div>
  );
}

function ExperienceMapSection({ campus, range }: { campus: Campus; range: DateRangeId }) {
  const [layer, setLayer] = useState<MapLayerId>("volume");
  const [selectedId, setSelectedId] = useState<string | null>(MAP_HOTSPOTS[0]?.id ?? null);
  const selected = MAP_HOTSPOTS.find((h) => h.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        eyebrow="Signature feature"
        title="Campus Experience Map"
        description="Toggle a layer to see where journeys, friction, and accessibility or sensory routing concentrate. Hotspot size reflects relative intensity for the selected layer."
      />

      <div role="radiogroup" aria-label="Map layer" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {MAP_LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={layer === l.id}
            onClick={() => setLayer(l.id)}
            className={cx(
              "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold",
              layer === l.id ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/85"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-2">
          <div className="relative">
            <CampusMap campus={campus} fill={false} height={320} className="w-full" />
            {MAP_HOTSPOTS.map((h) => {
              const intensity = h.intensity[layer] ?? 0.12;
              const size = 14 + intensity * 30;
              const active = h.id === selectedId;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedId(h.id)}
                  aria-pressed={active}
                  aria-label={`${h.label} — view details`}
                  className={cx(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-transform",
                    active ? "border-white z-10 scale-110" : "border-white/40 hover:scale-105"
                  )}
                  style={{
                    left: `${(h.point.x / 1000) * 100}%`,
                    top: `${(h.point.y / 700) * 100}%`,
                    width: size,
                    height: size,
                    backgroundColor: `rgba(245, 183, 47, ${0.35 + intensity * 0.5})`
                  }}
                >
                  <span className="sr-only">{h.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-[11px] text-white/40">Simulated campus map — circle size reflects relative intensity for the "{MAP_LAYERS.find((l) => l.id === layer)?.label}" layer.</p>
        </Card>

        <div>
          {selected ? (
            <Card className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-white">{selected.label}</h3>
                <button type="button" onClick={() => setSelectedId(null)} aria-label="Close detail panel" className="text-white/40 hover:text-white">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <Metric label="Journeys through area" value={scaleVolume(selected.journeys30d, range).toLocaleString()} />
                <Metric label="Rerouting vs. average" value={`${selected.rerouteDeltaPct > 0 ? "+" : ""}${selected.rerouteDeltaPct}%`} />
                <Metric label="Step-free routes" value={scaleVolume(selected.stepFreeRoutes30d, range).toLocaleString()} />
                <Metric label="Lower-sensory routes" value={scaleVolume(selected.sensoryRoutes30d, range).toLocaleString()} />
                <Metric label="Recovery Mode activity" value={scaleVolume(selected.recoveryActivations30d, range).toLocaleString()} />
                <Metric label="Assistance requests" value={scaleVolume(selected.assistanceRequests30d, range).toLocaleString()} />
              </dl>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Trend</span>
                <TrendPill deltaPct={selected.trend === "up" ? 8 : selected.trend === "down" ? -8 : 0} />
              </div>
              <ConsiderationNote>{selected.consideration}</ConsiderationNote>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center text-center text-sm text-white/45">Select a hotspot to see details.</Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-white/45">{label}</dt>
      <dd className="text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function FrictionSection({ range }: { range: DateRangeId }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        eyebrow="Navigation Friction"
        title="Where journeys get harder than they should be"
        description="Beacon surfaces evidence and possible review areas — it does not automatically declare a root cause."
      />

      <div className="flex flex-col gap-2">
        {FRICTION_ROWS.map((row) => {
          const expanded = expandedId === row.id;
          return (
            <Card key={row.id} className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{row.location}</p>
                  <p className="text-xs text-white/50">{row.signal}</p>
                </div>
                <SeverityBadge severity={row.severity} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
                <span>{scaleVolume(row.journeysAffected30d, range).toLocaleString()} journeys affected</span>
                <TrendPill deltaPct={row.trend === "up" ? 12 : row.trend === "down" ? -12 : 0} invert />
                <button type="button" onClick={() => setExpandedId(expanded ? null : row.id)} className="ml-auto font-semibold text-campus-sky hover:underline">
                  {expanded ? "Hide" : "View"}
                </button>
              </div>
              {expanded && (
                <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-2.5">
                  <p className="text-sm italic text-white/75">"{row.insight}"</p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Possible factors to review</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {row.possibleFactors.map((f) => (
                        <Badge key={f} tone="neutral">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
