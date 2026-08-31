import { Card, IconTile, SectionHeading } from "../../ui/Primitives";
import { BarRow, ConsiderationNote, HeatmapGrid, SectionIntro } from "./ExecutiveCharts";
import {
  ACCESSIBILITY_INTEL,
  SENSORY_INTEL,
  TIME_HEATMAP,
  TIME_HEATMAP_DAYS,
  TIME_HEATMAP_HOURS,
  scaleVolume,
  type DateRangeId
} from "./executiveData";
import { Accessibility, Armchair, Heart, Volume1 } from "lucide-react";

export function AccessibilitySection({ range }: { range: DateRangeId }) {
  const maxDest = Math.max(...ACCESSIBILITY_INTEL.mostRequestedDestinations.map((d) => d.journeys30d));
  const maxEntrance = Math.max(...ACCESSIBILITY_INTEL.mostUsedEntrances.map((e) => e.uses30d));
  const maxDemand = Math.max(...ACCESSIBILITY_INTEL.highestStepFreeDemandBuildings.map((d) => d.demand30d));
  const maxElevator = Math.max(...ACCESSIBILITY_INTEL.elevatorsInJourneys.map((e) => e.journeys30d));

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Accessibility Intelligence"
        title="How accessibility routing is actually used"
        description="Aggregated patterns from step-free routing, accessible entrances, and elevator-dependent journeys — never individual diagnoses or profiles."
      />

      <div>
        <SectionHeading title="Most requested accessible destinations" />
        <div className="flex flex-col gap-2.5">
          {ACCESSIBILITY_INTEL.mostRequestedDestinations.map((d) => (
            <BarRow key={d.name} label={d.name} value={scaleVolume(d.journeys30d, range)} max={scaleVolume(maxDest, range)} tone="sky" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <SectionHeading title="Most used accessible entrances" />
          <div className="flex flex-col gap-2.5">
            {ACCESSIBILITY_INTEL.mostUsedEntrances.map((e) => (
              <BarRow key={e.name} label={e.name} sub={e.note} value={scaleVolume(e.uses30d, range)} max={scaleVolume(maxEntrance, range)} tone="gold" />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading title="Highest step-free routing demand" />
          <div className="flex flex-col gap-2.5">
            {ACCESSIBILITY_INTEL.highestStepFreeDemandBuildings.map((d) => (
              <BarRow key={d.name} label={d.name} value={scaleVolume(d.demand30d, range)} max={scaleVolume(maxDemand, range)} tone="gold" />
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeading title="Elevators appearing most in Beacon journeys" />
        <div className="flex flex-col gap-2.5">
          {ACCESSIBILITY_INTEL.elevatorsInJourneys.map((e) => (
            <BarRow key={e.name} label={e.name} value={scaleVolume(e.journeys30d, range)} max={scaleVolume(maxElevator, range)} tone="sky" />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Locations generating accessibility-related reroutes" />
        <div className="flex flex-col gap-2">
          {ACCESSIBILITY_INTEL.accessibilityRerouteLocations.map((r) => (
            <Card key={r.name} className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{r.name}</p>
              <p className="text-sm font-semibold text-campus-amber">+{r.deltaPct}% vs. average · {scaleVolume(r.reroutes30d, range)} reroutes</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Accessibility Opportunity Areas" />
        {ACCESSIBILITY_INTEL.opportunityAreas.map((o) => (
          <Card key={o.id} className="flex flex-col gap-2.5 border-campus-gold/25 bg-campus-gold/[0.06]">
            <div className="flex items-start gap-3">
              <IconTile tone="warning">
                <Accessibility size={16} aria-hidden="true" />
              </IconTile>
              <div>
                <p className="text-sm font-bold text-white">{o.location}</p>
                <p className="text-xs text-white/55">Signal: {o.signal}</p>
              </div>
            </div>
            <ConsiderationNote>{o.recommendation}</ConsiderationNote>
            <p className="text-xs text-white/45">Impact: approximately {scaleVolume(o.impactJourneys30d, range).toLocaleString()} Beacon journeys interacted with this area during the selected period.</p>
          </Card>
        ))}
        <p className="mt-2 text-[11px] text-white/35">Beacon Executive Insights describes routing patterns only — it does not assess or represent legal accessibility compliance.</p>
      </div>
    </div>
  );
}

export function SensorySection({ range }: { range: DateRangeId }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Sensory Experience Intelligence"
        title="A Beacon differentiator: routing for sensory comfort, not just distance"
        description="Lower-sensory routing, Recovery Mode, and Rest & Resume reveal needs a traditional campus map can't show."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Volume1} label="Lower-sensory routes" value={scaleVolume(SENSORY_INTEL.lowerSensoryRequests30d, range).toLocaleString()} />
        <Stat icon={Heart} label="Completion rate" value={`${SENSORY_INTEL.lowerSensoryCompletionPct.toFixed(1)}%`} />
        <Stat icon={Armchair} label="Rest & Resume uses" value={scaleVolume(SENSORY_INTEL.restResumeUses30d, range).toLocaleString()} />
        <Stat icon={Volume1} label="Quiet Space searches" value={scaleVolume(SENSORY_INTEL.quietSpaceSearches30d, range).toLocaleString()} />
      </div>

      <div>
        <SectionHeading title="Most frequently avoided areas" />
        <div className="flex flex-col gap-2">
          {SENSORY_INTEL.mostAvoidedAreas.map((a) => (
            <Card key={a.name} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{a.name}</p>
                <p className="text-xs text-white/45">{a.window}</p>
              </div>
              <p className="text-sm font-semibold text-campus-sky">+{a.avoidancePct}% avoidance</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Recovery Mode activation locations" />
        <div className="flex flex-col gap-2.5">
          {SENSORY_INTEL.recoveryModeLocations.map((l) => (
            <BarRow
              key={l.name}
              label={l.name}
              value={scaleVolume(l.activations30d, range)}
              max={scaleVolume(Math.max(...SENSORY_INTEL.recoveryModeLocations.map((x) => x.activations30d)), range)}
              tone="green"
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/40">Not every Recovery Mode activation has the same cause — this shows where it happens, not why.</p>
      </div>

      <div>
        <SectionHeading title="Sensory patterns by time of day" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {SENSORY_INTEL.timeOfDay.map((t) => (
            <Card key={t.period} className="flex flex-col gap-1 p-3">
              <p className="text-xs font-semibold text-white">{t.period}</p>
              <p className="text-[11px] text-white/40">{t.label}</p>
              <p className="mt-1 text-lg font-bold text-campus-gold">{scaleVolume(t.sensoryRoutes, range)}</p>
              <p className="text-[11px] text-white/45">sensory routes</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Campus Sensory Heatmap" />
        <Card>
          <HeatmapGrid rows={TIME_HEATMAP} rowLabels={TIME_HEATMAP_DAYS} colLabels={TIME_HEATMAP_HOURS} />
          <p className="mt-3 text-[11px] text-white/40">Relative demand for lower-sensory and Recovery Mode routing by day and hour.</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-2 border-campus-sky/25 bg-campus-sky/[0.06]">
        <p className="text-sm italic text-white/85">"{SENSORY_INTEL.insight.text}"</p>
        <ConsiderationNote>{SENSORY_INTEL.insight.consideration}</ConsiderationNote>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Volume1; label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1.5 p-3">
      <IconTile tone="info">
        <Icon size={15} aria-hidden="true" />
      </IconTile>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] font-medium text-white/55">{label}</p>
    </Card>
  );
}
