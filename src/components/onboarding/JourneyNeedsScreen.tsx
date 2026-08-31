import {
  Accessibility,
  Armchair,
  Check,
  Ear,
  Footprints,
  Home,
  MessageSquareText,
  PawPrint,
  Ruler,
  ShieldCheck,
  Toilet,
  Trees,
  Type,
  Users,
  Volume2
} from "lucide-react";
import { isSpeechAvailable } from "../../lib/speech";
import type { CampusPreferences } from "../../types/campus";
import { Button, cx } from "../ui/Primitives";
import { JourneyProgress } from "./JourneyProgress";

type NeedGroup = "Mobility" | "Sensory & Comfort" | "Navigation" | "Support Along the Way";

const NEEDS: { key: keyof CampusPreferences; label: string; icon: typeof Accessibility; group: NeedGroup; disabled?: () => boolean }[] = [
  { key: "stepFree", label: "Wheelchair / Step-Free", icon: Accessibility, group: "Mobility" },
  { key: "avoidStairs", label: "Avoid Stairs / Prefer Elevators", icon: Footprints, group: "Mobility" },
  { key: "minimizeDistance", label: "Shorter Walking Distance", icon: Ruler, group: "Mobility" },
  { key: "seatingStops", label: "More Places to Rest", icon: Armchair, group: "Mobility" },
  { key: "restroomStop", label: "Accessible Restrooms Nearby", icon: Toilet, group: "Mobility" },
  { key: "calmRoute", label: "Lower Stimulation / Quieter Route", icon: Ear, group: "Sensory & Comfort" },
  { key: "avoidCrowds", label: "Avoid Crowds", icon: Users, group: "Sensory & Comfort" },
  { key: "simplifiedDirections", label: "Simpler Directions", icon: MessageSquareText, group: "Navigation" },
  { key: "reassurance", label: "More Reassurance", icon: ShieldCheck, group: "Navigation" },
  { key: "indoorPreferred", label: "Indoor Route Preferred", icon: Home, group: "Navigation" },
  { key: "outdoorPreferred", label: "Outdoor Route Preferred", icon: Trees, group: "Navigation" },
  { key: "serviceAnimalSupport", label: "Service Animal Support", icon: PawPrint, group: "Support Along the Way" },
  { key: "largerText", label: "Large Text", icon: Type, group: "Support Along the Way" },
  { key: "audioGuidance", label: "Voice Guidance", icon: Volume2, group: "Support Along the Way", disabled: () => !isSpeechAvailable() }
];

const GROUPS: NeedGroup[] = ["Mobility", "Sensory & Comfort", "Navigation", "Support Along the Way"];

/**
 * The first screen of the post-Begin personalization flow. Toggling a chip
 * here calls the same `togglePreference` the Accessibility & Preferences
 * screen and every route calculation already use — there is no separate,
 * onboarding-only preferences state, so a selection here has the exact same
 * real routing effect it would have from Profile.
 */
export function JourneyNeedsScreen({
  preferences,
  onTogglePreference,
  onContinue,
  onSkip
}: {
  preferences: CampusPreferences;
  onTogglePreference: (key: keyof CampusPreferences) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <JourneyProgress current={1} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <h1 className="text-[var(--font-display)] font-bold text-white">Let's personalize your journey.</h1>
        <p className="mt-2 text-sm text-white/60">
          Tell Beacon what would make this trip more comfortable or accessible. You can skip anything that doesn't
          apply.
        </p>
        <p className="mt-4 text-sm font-medium text-white/70">What would make this journey work better for you?</p>
        <p className="mt-0.5 text-xs text-white/40">Select all that apply.</p>

        <div className="mt-4 flex flex-col gap-5">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40">{group}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {NEEDS.filter((n) => n.group === group).map((need) => {
                  const Icon = need.icon;
                  const isDisabled = need.disabled?.() ?? false;
                  const selected = preferences[need.key] as boolean;
                  return (
                    <button
                      key={need.key}
                      type="button"
                      aria-pressed={selected}
                      disabled={isDisabled}
                      onClick={() => onTogglePreference(need.key)}
                      className={cx(
                        "card-surface relative flex min-h-[84px] flex-col items-start gap-2 rounded-[var(--radius-card)] border p-3 text-left transition-[background-image,color] active:translate-y-px disabled:opacity-40",
                        selected ? "beacon-selected border-transparent" : "border-campus-gold/[0.12] bg-campus-surface text-white"
                      )}
                    >
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-campus-goldink/15">
                          <Check size={11} strokeWidth={3} aria-hidden="true" />
                        </span>
                      )}
                      <Icon size={19} aria-hidden="true" />
                      <span className="text-xs font-semibold leading-snug">{need.label}</span>
                      {isDisabled && <span className="text-[10px] font-normal opacity-70">Not supported in this browser</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button tone="primary" onClick={onContinue}>
          Continue
        </Button>
        <Button tone="ghost" className="text-white/50" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
