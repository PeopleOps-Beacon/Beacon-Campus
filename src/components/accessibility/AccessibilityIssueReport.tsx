import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ACCESSIBILITY_ISSUE_CATEGORIES, type AccessibilityIssueCategory } from "../../hooks/useAccessibilityReports";
import { Button, cx } from "../ui/Primitives";
import { Sheet } from "../ui/Sheet";

/**
 * Quick, low-friction issue reporting — a traveler noticing a barrier
 * shouldn't need more than a few taps to flag it. No photo upload (not
 * supported in this browser-only prototype), no account required.
 */
export function AccessibilityIssueReport({ onSubmit, onClose }: { onSubmit: (category: AccessibilityIssueCategory, location: string, description: string) => void; onClose: () => void }) {
  const [category, setCategory] = useState<AccessibilityIssueCategory | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Sheet variant="picker" className="max-h-[85%]" onHandleActivate={onClose} handleLabel="Close" onClose={onClose} label="Report an Accessibility Issue">
      <div className="flex flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={32} className="text-campus-green" aria-hidden="true" />
            <p className="text-base font-bold text-white">Thank you.</p>
            <p className="text-sm text-white/60">Your report can help improve future Beacon routes.</p>
            <Button tone="primary" className="mt-2 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-white">What's wrong?</h2>
              <p className="mt-0.5 text-sm text-white/55">Quick report — this helps Beacon and campus facilities know what to fix.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ACCESSIBILITY_ISSUE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={cx(
                    "rounded-[var(--radius-control)] border px-3 py-2.5 text-left text-sm font-medium",
                    category === c.id ? "beacon-selected border-transparent" : "border-white/10 bg-white/[0.04] text-white/80"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {category && (
              <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/40">Which location?</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Engineering Hall East Elevator"
                    className="min-h-[44px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-sm text-white placeholder:text-white/35"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/40">Short description (optional)</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Anything else that would help"
                    className="rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 py-2 text-sm text-white placeholder:text-white/35"
                  />
                </label>
                <Button
                  tone="primary"
                  disabled={!location.trim()}
                  onClick={() => {
                    onSubmit(category, location, description);
                    setSubmitted(true);
                  }}
                >
                  Submit
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
