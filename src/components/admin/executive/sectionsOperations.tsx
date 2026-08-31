import { useState } from "react";
import { CheckCircle2, Download, FileText, MessageSquareQuote, Sparkles } from "lucide-react";
import { Badge, Button, Card, IconTile, SectionHeading, cx } from "../../ui/Primitives";
import { BarRow, SectionIntro } from "./ExecutiveCharts";
import {
  COMPARISON_ENTITIES,
  IMPROVEMENTS,
  REASSURANCE_GAPS,
  REASSURANCE_POINTS,
  scaleVolume,
  type DateRangeId,
  type ImprovementRecord
} from "./executiveData";

function formatMetric(value: number, format: "percent" | "number"): string {
  return format === "percent" ? `${value.toFixed(1)}%` : value.toLocaleString();
}

const CHANGE_TYPES = ["New signage installed", "Accessible entrance signage updated", "Elevator repaired", "Construction route changed", "Quiet space added", "Pathway reopened", "New reassurance point added"];

export function ImprovementsSection() {
  const records: ImprovementRecord[] = IMPROVEMENTS;
  const [pending, setPending] = useState<{ title: string; changeType: string; location: string } | null>(null);
  const [form, setForm] = useState({ title: "", changeType: CHANGE_TYPES[0], location: "" });

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Before / After Improvement Measurement"
        title="Does an operational change actually help?"
        description="Beacon compares relevant signals before and after a recorded change — an observed association, not proof of causality, unless noted otherwise."
      />

      <div className="flex flex-col gap-3">
        {records.map((r) => {
          const changePct = r.before.value === 0 ? 0 : ((r.after.value - r.before.value) / r.before.value) * 100;
          const improved = changePct < 0;
          return (
            <Card key={r.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{r.title}</p>
                  <p className="text-xs text-white/45">
                    {r.changeType} · {r.date} · {r.location}
                  </p>
                </div>
                <Badge tone={improved ? "success" : "neutral"}>{improved ? `${Math.abs(changePct).toFixed(0)}% reduction` : `${changePct.toFixed(0)}% change`}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-control)] bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Before</p>
                  <p className="mt-1 text-lg font-bold text-white">{formatMetric(r.before.value, r.before.format)}</p>
                  <p className="text-[11px] text-white/45">{r.before.label}</p>
                </div>
                <div className="rounded-[var(--radius-control)] bg-campus-green/[0.08] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-campus-green">After</p>
                  <p className="mt-1 text-lg font-bold text-white">{formatMetric(r.after.value, r.after.format)}</p>
                  <p className="text-[11px] text-white/45">{r.after.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-white/40">{r.note}</p>
            </Card>
          );
        })}

        {pending && (
          <Card className="flex flex-col gap-2 border-dashed border-white/15">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{pending.title || pending.changeType}</p>
                <p className="text-xs text-white/45">{pending.changeType} · Today · {pending.location || "Location not specified"}</p>
              </div>
              <Badge tone="neutral">Awaiting after-data</Badge>
            </div>
            <p className="text-xs text-white/50">
              Recorded. Beacon will populate a before/after comparison once enough post-change journeys have been observed — no numbers are shown yet
              because none genuinely exist.
            </p>
          </Card>
        )}
      </div>

      <div>
        <SectionHeading title="Record an improvement" />
        <Card className="flex flex-col gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="What changed? (e.g. Long Hall west entrance signage)"
            className="min-h-[40px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-sm text-white placeholder:text-white/40"
          />
          <div className="flex gap-2">
            <select
              value={form.changeType}
              onChange={(e) => setForm((f) => ({ ...f, changeType: e.target.value }))}
              className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
            >
              {CHANGE_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Location"
              className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-sm text-white placeholder:text-white/40"
            />
          </div>
          <Button
            tone="primary"
            disabled={!form.changeType}
            onClick={() => {
              setPending({ ...form });
              setForm({ title: "", changeType: CHANGE_TYPES[0], location: "" });
            }}
          >
            Record Improvement
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function ReassuranceSection() {
  const max = Math.max(...REASSURANCE_POINTS.map((p) => p.views30d));
  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Reassurance Point Analytics"
        title="What reassurance information travelers actually value"
        description="Reassurance points are the short, calm confirmations Beacon shows mid-journey — this shows which ones get seen, and where they may be missing."
      />

      <div className="flex flex-col gap-3">
        {REASSURANCE_POINTS.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <IconTile tone="success">
                <MessageSquareQuote size={15} aria-hidden="true" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold italic text-white">"{p.text}"</p>
                <p className="text-xs text-white/45">{p.location}</p>
              </div>
            </div>
            <BarRow label="Views" value={p.views30d} max={max} tone="green" valueLabel={`${p.views30d.toLocaleString()} views`} />
            <p className="text-[11px] text-white/45">Associated with successful arrival in {p.successAssociationPct}% of journeys where it was shown.</p>
          </Card>
        ))}
      </div>

      <div>
        <SectionHeading title="Potential areas missing reassurance information" />
        {REASSURANCE_GAPS.map((g) => (
          <Card key={g.location} className="flex items-start gap-3 border-campus-gold/25 bg-campus-gold/[0.06]">
            <IconTile tone="warning">
              <Sparkles size={15} aria-hidden="true" />
            </IconTile>
            <div>
              <p className="text-sm font-semibold text-white">{g.location}</p>
              <p className="text-xs text-white/60">{g.note}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CompareSection({ range }: { range: DateRangeId }) {
  const [selected, setSelected] = useState<string[]>([COMPARISON_ENTITIES[0].id, COMPARISON_ENTITIES[1].id]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  const entities = COMPARISON_ENTITIES.filter((e) => selected.includes(e.id));
  const rows: { label: string; key: keyof (typeof COMPARISON_ENTITIES)[number]; format: "number" | "percent" }[] = [
    { label: "Journeys", key: "journeys30d", format: "number" },
    { label: "Completion rate", key: "completionPct", format: "percent" },
    { label: "Recalculation rate", key: "recalcPct", format: "percent" },
    { label: "Accessibility routing", key: "accessibilityPct", format: "percent" },
    { label: "Lower-sensory routing", key: "sensoryPct", format: "percent" },
    { label: "Assistance requests", key: "assistanceRequests30d", format: "number" },
    { label: "Recovery Mode activations", key: "recoveryActivations30d", format: "number" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Campus Comparison"
        title="Compare buildings, zones, or time periods side by side"
        description="Select up to four to compare. Built so a future multi-campus deployment could compare institutions the same way, without redesigning this view."
      />

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {COMPARISON_ENTITIES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => toggle(e.id)}
            aria-pressed={selected.includes(e.id)}
            className={cx(
              "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold",
              selected.includes(e.id) ? "beacon-selected" : "bg-white/[0.06] text-white/65 hover:text-white/85"
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      {entities.length < 2 ? (
        <Card className="text-center text-sm text-white/50">Select at least two to compare.</Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-semibold uppercase tracking-wide text-white/40">Metric</th>
                {entities.map((e) => (
                  <th key={e.id} className="p-2 text-left text-xs font-bold text-white">
                    {e.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/[0.06]">
                  <td className="p-2 text-xs text-white/50">{row.label}</td>
                  {entities.map((e) => {
                    const raw = e[row.key] as number;
                    const scaled = row.format === "percent" ? raw : scaleVolume(raw, range);
                    return (
                      <td key={e.id} className="p-2 text-sm font-semibold text-white">
                        {row.format === "percent" ? `${scaled}%` : scaled.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const REPORT_SECTIONS = [
  "Executive Summary",
  "Beacon Adoption",
  "Campus Navigation",
  "Accessibility",
  "Sensory Experience",
  "Visitor Experience",
  "Top Friction Areas",
  "Emerging Trends",
  "Opportunities",
  "Improvements",
  "Event Insights"
];

export function ReportsSection({ rangeLabel }: { rangeLabel: string }) {
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [generated, setGenerated] = useState(false);
  const [exportNote, setExportNote] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SectionIntro
        eyebrow="Exportable Executive Report"
        title="Generate Executive Report"
        description="Builds a structured summary of this dashboard for sharing outside the platform."
      />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Export format">
            {(["pdf", "csv"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={format === f}
                onClick={() => setFormat(f)}
                className={cx("rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold uppercase", format === f ? "beacon-selected" : "bg-white/[0.06] text-white/65")}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/45">Date range: {rangeLabel}</span>
          <Button tone="primary" className="ml-auto" onClick={() => setGenerated(true)}>
            <FileText size={15} aria-hidden="true" />
            Generate Executive Report
          </Button>
        </div>

        {generated && (
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-campus-gold/[0.15] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Report preview — {rangeLabel}</p>
              <Badge tone="neutral">{format.toUpperCase()}</Badge>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 text-sm text-white/75 sm:grid-cols-2">
              {REPORT_SECTIONS.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-campus-green" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
              <Button tone="secondary" onClick={() => setExportNote(true)}>
                <Download size={14} aria-hidden="true" />
                Download {format.toUpperCase()}
              </Button>
              {exportNote && <p className="text-xs text-white/45">Export generation isn't wired to a backend yet — this preview shows exactly what the report would contain.</p>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
