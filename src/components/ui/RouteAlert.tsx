import { Accessibility, AlertTriangle, Info, RefreshCcw, Sparkles } from "lucide-react";
import { cx } from "./Primitives";

export type RouteAlertVariant = "reassurance" | "information" | "route-change" | "accessibility" | "warning";

const VARIANT_ICON: Record<RouteAlertVariant, typeof Info> = {
  reassurance: Sparkles,
  information: Info,
  "route-change": RefreshCcw,
  accessibility: Accessibility,
  warning: AlertTriangle
};

const VARIANT_CLASSES: Record<RouteAlertVariant, string> = {
  reassurance: "border-campus-green/25 bg-campus-green/[0.08] text-campus-green",
  information: "border-campus-sky/25 bg-campus-sky/[0.08] text-campus-sky",
  "route-change": "border-campus-sky/25 bg-campus-sky/[0.08] text-campus-sky",
  accessibility: "border-campus-gold/25 bg-campus-gold/[0.06] text-campus-amber",
  warning: "border-red-500/30 bg-red-500/10 text-red-300"
};

/**
 * Beacon's shared reassurance / route-condition banner (planned in Phase 3,
 * built in Phase 4D) — one component, five semantic variants, reusing
 * Campus's existing tone palette rather than inventing new colors. Always
 * calm, confidence-building language ("Updating your route"), never
 * correction language ("ERROR", "WRONG WAY"). `warning` is the one variant
 * with real urgency (red) — reserved for genuine problems, not deviation
 * detection, which Campus doesn't implement yet.
 */
export function RouteAlert({
  variant,
  message,
  className
}: {
  variant: RouteAlertVariant;
  message: string;
  className?: string;
}) {
  const Icon = VARIANT_ICON[variant];
  return (
    <div
      role={variant === "warning" ? "alert" : "status"}
      aria-live={variant === "warning" ? "assertive" : "polite"}
      className={cx(
        "flex items-start gap-2.5 rounded-[var(--radius-card)] border px-3.5 py-2.5",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium leading-snug text-white/90">{message}</p>
    </div>
  );
}
