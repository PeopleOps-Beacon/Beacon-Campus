import type { ReactNode } from "react";
import { HelpCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Card, cx } from "../../ui/Primitives";
import type { Severity } from "./executiveData";

/** Small "?" affordance with a native title tooltip — explains an unfamiliar metric without adding a new UI system. */
export function MetricHint({ text }: { text: string }) {
  return (
    <span title={text} tabIndex={0} className="inline-flex text-white/30 hover:text-white/60 focus-visible:text-white/60">
      <HelpCircle size={12} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  );
}

export function TrendPill({ deltaPct, invert = false }: { deltaPct: number; invert?: boolean }) {
  const up = deltaPct > 0.05;
  const down = deltaPct < -0.05;
  const good = invert ? down : up;
  const bad = invert ? up : down;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-1.5 py-0.5 text-[11px] font-semibold",
        good ? "bg-campus-green/15 text-campus-green" : bad ? "bg-red-500/15 text-red-300" : "bg-white/[0.08] text-white/50"
      )}
    >
      <Icon size={11} aria-hidden="true" />
      {Math.abs(deltaPct).toFixed(1)}%
    </span>
  );
}

/** Tiny inline sparkline — a shape, not a precise chart; values are relative, not axis-labeled. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const w = 64;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={cx("overflow-visible", className)} aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  deltaPct,
  invert,
  trend,
  tooltip
}: {
  label: string;
  value: string;
  deltaPct: number;
  invert?: boolean;
  trend?: number[];
  tooltip: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-white/55">{label}</p>
        <MetricHint text={tooltip} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="flex items-center justify-between gap-2">
        <TrendPill deltaPct={deltaPct} invert={invert} />
        {trend && <Sparkline values={trend} />}
      </div>
    </Card>
  );
}

/** Horizontal bar row — label, a proportional bar, and a value. Used for ranked lists throughout the dashboard. */
export function BarRow({
  label,
  sub,
  value,
  valueLabel,
  max,
  tone = "gold"
}: {
  label: string;
  sub?: string;
  value: number;
  valueLabel?: string;
  max: number;
  tone?: "gold" | "sky" | "green" | "amber";
}) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  const barColor: Record<string, string> = {
    gold: "bg-campus-gold",
    sky: "bg-campus-sky",
    green: "bg-campus-green",
    amber: "bg-campus-amber"
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{label}</p>
        <p className="shrink-0 text-sm font-semibold text-white/85">{valueLabel ?? value.toLocaleString()}</p>
      </div>
      {sub && <p className="truncate text-xs text-white/45">{sub}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div className={cx("h-full rounded-full transition-[width] duration-500", barColor[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Reuses Badge's own tone enum rather than passing a colliding className —
// Badge already applies a tone-based background/text pair, and layering a
// second, overlapping Tailwind color utility on top of it risks an
// unpredictable cascade order (the same class of bug already found and
// fixed once in Sheet.tsx's relative/absolute conflict this session).
const SEVERITY_META: Record<Severity, { label: string; tone: "neutral" | "warning" | "danger" | "selected" }> = {
  low: { label: "Low", tone: "neutral" },
  moderate: { label: "Moderate", tone: "warning" },
  high: { label: "High", tone: "danger" },
  priority: { label: "Priority Review", tone: "selected" }
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Compact day × hour intensity grid — Steps-mode-style: legible without color alone, since each cell is also sized by intensity. */
export function HeatmapGrid({ rows, rowLabels, colLabels }: { rows: number[][]; rowLabels: string[]; colLabels: string[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1" style={{ minWidth: colLabels.length * 18 + 40 }}>
        <div className="flex gap-1 pl-9">
          {colLabels.map((c, i) => (
            <div key={c} className="w-[18px] shrink-0 text-center text-[8px] text-white/35">
              {i % 2 === 0 ? c : ""}
            </div>
          ))}
        </div>
        {rows.map((row, r) => (
          <div key={rowLabels[r]} className="flex items-center gap-1">
            <div className="w-9 shrink-0 text-right text-[10px] font-medium text-white/45">{rowLabels[r]}</div>
            {row.map((v, c) => (
              <div
                key={c}
                title={`${rowLabels[r]} ${colLabels[c]} — relative demand ${Math.round(v * 100)}%`}
                className="h-[18px] w-[18px] shrink-0 rounded-[3px]"
                style={{ backgroundColor: `rgba(245, 183, 47, ${0.08 + v * 0.75})` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionIntro({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-wide text-campus-gold">{eyebrow}</p>}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {children}
      </div>
      <p className="text-sm text-white/55">{description}</p>
    </div>
  );
}

export function ConsiderationNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-control)] border border-campus-sky/20 bg-campus-sky/[0.06] px-3 py-2 text-xs leading-relaxed text-white/75">
      <span className="font-semibold text-campus-sky">Potential consideration — </span>
      {children}
    </p>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-white/10 px-6 py-8 text-center">
      <p className="text-sm text-white/50">{message}</p>
    </div>
  );
}
