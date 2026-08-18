import type { ReactNode } from "react";
import { cx } from "./ui/Primitives";
import { Sheet } from "./ui/Sheet";

/**
 * The peek variant of Beacon's shared Sheet — rises from the bottom of the
 * map instead of replacing it: collapsed shows a compact preview, expanded
 * shows full content, and the map stays visible and interactive either way.
 * Toggled by tapping the handle (not a drag gesture) so it stays fully
 * keyboard- and switch-accessible.
 */
export function BottomSheet({
  expanded,
  onToggleExpanded,
  label,
  peek,
  children
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  /** Announced as the sheet's accessible name, e.g. the destination or parking lot's name. */
  label: string;
  peek: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet
      variant="peek"
      className={cx("absolute inset-x-0 bottom-[var(--tabbar-clearance)]", expanded ? "max-h-[78%]" : "max-h-[172px]")}
      onHandleActivate={onToggleExpanded}
      handleLabel={expanded ? "Collapse details" : "Expand details"}
      label={label}
    >
      <div aria-expanded={expanded} className="overflow-y-auto px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
        {expanded ? children : peek}
      </div>
    </Sheet>
  );
}
