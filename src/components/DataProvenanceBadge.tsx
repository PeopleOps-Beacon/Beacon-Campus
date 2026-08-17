import { BadgeCheck, FlaskConical, Info } from "lucide-react";
import type { DataProvenance } from "../types/campus";
import { Badge, IconTile } from "./ui/Primitives";

const STATUS_META = {
  verified: { label: "Verified building", tone: "success" as const, icon: BadgeCheck },
  "development-fixture": { label: "Preview data", tone: "neutral" as const, icon: FlaskConical },
  derived: { label: "Estimated", tone: "info" as const, icon: Info }
};

/** Compact badge — use inline alongside other facts (open status, walk time, etc). */
export function DataProvenanceBadge({ provenance }: { provenance: DataProvenance }) {
  const meta = STATUS_META[provenance.status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Full card — the citation and caveat behind a badge. Use once per screen, near the top. */
export function DataProvenanceNote({ provenance }: { provenance: DataProvenance }) {
  const meta = STATUS_META[provenance.status];
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.03] p-3">
      <IconTile tone={meta.tone}>
        <Icon size={15} aria-hidden="true" />
      </IconTile>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{meta.label}</p>
        {provenance.note && <p className="mt-1 text-xs text-white/60">{provenance.note}</p>}
        {provenance.source && <p className="mt-1 text-[11px] text-white/40">Source: {provenance.source}</p>}
      </div>
    </div>
  );
}
