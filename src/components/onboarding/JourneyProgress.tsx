import { Check } from "lucide-react";
import { cx } from "../ui/Primitives";

const STEPS = ["Your Needs", "Stops", "Destination", "Route"];

/** Shared 4-step progress indicator for the post-Begin personalization flow. `current` is 1-indexed (matches the numbered list in the design brief). */
export function JourneyProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Personalize your journey — progress" className="flex items-center gap-1.5 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-1 flex-col gap-1">
              <div
                className={cx("h-1 rounded-full transition-colors", done || active ? "bg-campus-gold" : "bg-white/10")}
                aria-hidden="true"
              />
              <span className={cx("truncate text-[10px] font-semibold uppercase tracking-wide", active ? "text-campus-gold" : done ? "text-white/60" : "text-white/30")}>
                {done ? <Check size={10} className="mr-0.5 inline" aria-hidden="true" /> : null}
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
