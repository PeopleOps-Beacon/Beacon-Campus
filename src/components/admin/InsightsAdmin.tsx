import { Accessibility, Building2, CalendarCheck, Car, Clock, Info, MapPinned, Search, TrendingUp } from "lucide-react";
import type { UseAnalytics } from "../../hooks/useAnalytics";
import type { Campus } from "../../types/campus";
import { Badge, Card, IconTile, SectionHeading } from "../ui/Primitives";

// Illustrative, campus-wide operational metrics. Beacon Campus has no
// backend or occupancy sensors, so these are clearly-labeled demo figures —
// see the "This Session" section below for genuinely tracked numbers.
const DEMO_METRICS: { label: string; value: string; icon: typeof TrendingUp; note?: string }[] = [
  { label: "Avg. walk time", value: "7.4 min", icon: Clock, note: "Across all guided routes" },
  { label: "Accessibility routing", value: "18%", icon: Accessibility, note: "Of routes use step-free or calm mode" },
  { label: "Parking utilization", value: "72%", icon: Car, note: "Visitor lots, peak hours" },
  { label: "Alerts issued", value: "5", icon: Info, note: "Active this month" },
  { label: "Orientation completion", value: "94%", icon: CalendarCheck, note: "New students finishing checklist" },
  { label: "Tour completions", value: "61%", icon: MapPinned, note: "Self-guided campus tours" }
];

export function InsightsAdmin({ campus, analytics }: { campus: Campus; analytics: UseAnalytics }) {
  const topSearches = analytics.topEntries(analytics.state.searchCounts);
  const topDestinations = analytics.topEntries(analytics.state.destinationViewCounts);
  const topPreferences = analytics.topEntries(analytics.state.preferenceToggleCounts);

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex items-start gap-3 border-campus-sky/25 bg-campus-sky/[0.06]">
        <IconTile tone="info">
          <TrendingUp size={17} aria-hidden="true" />
        </IconTile>
        <p className="text-xs text-white/60">
          Executive Insights combines real, anonymous usage from this browser session with illustrative campus-wide
          benchmarks — a preview of the analytics a real Beacon deployment could surface for facilities, admissions,
          and student affairs.
        </p>
      </Card>

      <div>
        <SectionHeading title="This session (real)" />
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label="Searches" value={String(Object.values(analytics.state.searchCounts).reduce((a, b) => a + b, 0))} />
          <StatTile label="Destinations viewed" value={String(Object.values(analytics.state.destinationViewCounts).reduce((a, b) => a + b, 0))} />
          <StatTile label="Preferences used" value={String(Object.keys(analytics.state.preferenceToggleCounts).length)} />
        </div>
      </div>

      {topSearches.length > 0 && (
        <div>
          <SectionHeading title="Top searches" />
          <div className="flex flex-col gap-1.5">
            {topSearches.map(([query, count]) => (
              <Card key={query} className="flex items-center gap-3 py-2">
                <IconTile>
                  <Search size={14} aria-hidden="true" />
                </IconTile>
                <p className="flex-1 truncate text-sm text-white">{query}</p>
                <Badge tone="neutral">{count}×</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {topDestinations.length > 0 && (
        <div>
          <SectionHeading title="Most-viewed destinations" />
          <div className="flex flex-col gap-1.5">
            {topDestinations.map(([buildingId, count]) => {
              const building = campus.buildings.find((b) => b.id === buildingId);
              return (
                <Card key={buildingId} className="flex items-center gap-3 py-2">
                  <IconTile>
                    <Building2 size={14} aria-hidden="true" />
                  </IconTile>
                  <p className="flex-1 truncate text-sm text-white">{building?.name ?? buildingId}</p>
                  <Badge tone="neutral">{count}×</Badge>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {topPreferences.length > 0 && (
        <div>
          <SectionHeading title="Accessibility preferences toggled" />
          <div className="flex flex-wrap gap-1.5">
            {topPreferences.map(([key, count]) => (
              <Badge key={key} tone="info">
                {key} · {count}×
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading title="Campus operations (demo data)" />
        <div className="grid grid-cols-2 gap-2.5">
          {DEMO_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="flex flex-col gap-1.5">
                <IconTile>
                  <Icon size={15} aria-hidden="true" />
                </IconTile>
                <p className="text-lg font-bold text-white">{metric.value}</p>
                <p className="text-xs font-medium text-white/70">{metric.label}</p>
                {metric.note && <p className="text-[11px] text-white/45">{metric.note}</p>}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 py-3 text-center">
      <p className="text-xl font-bold text-campus-gold">{value}</p>
      <p className="text-[11px] text-white/55">{label}</p>
    </Card>
  );
}
