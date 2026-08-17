import type { ReactNode } from "react";
import { cx } from "./ui/Primitives";

/**
 * A sheet that peeks up from the bottom of the map instead of replacing it —
 * collapsed shows a compact preview, expanded shows full content, and the map
 * stays visible and in place either way. Toggled by tapping the handle
 * (not a drag gesture) so it stays fully keyboard- and switch-accessible.
 */
export function BottomSheet({
  expanded,
  onToggleExpanded,
  peek,
  children
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  peek: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-campus-surface shadow-[0_-16px_40px_-16px_rgba(0,0,0,0.7)]",
        "transition-[max-height] duration-300 [transition-timing-function:var(--ease-premium)]",
        expanded ? "max-h-[78%]" : "max-h-[172px]"
      )}
    >
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse details" : "Expand details"}
        className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-2.5"
      >
        <span className="h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
      </button>
      <div className="overflow-y-auto px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]">{expanded ? children : peek}</div>
    </div>
  );
}
