import { Heart } from "lucide-react";
import { Button, Card, IconTile } from "../ui/Primitives";

/**
 * A calm, discreet reorientation screen — not medical treatment, just a
 * simplified pause when someone feels overwhelmed, confused, lost, or
 * stressed mid-journey. Reachable from every active-navigation screen.
 *
 * Positioned `absolute inset-0` against NavigationScreen's own root rather
 * than `position: fixed` — a fixed overlay would escape the phone-frame
 * device mockup used throughout Beacon Campus on wider viewports (the same
 * containing-block issue already found and fixed once this session in
 * Sheet.tsx / TabNavigator). This still fully covers the navigation content
 * area; the header above it (with Back) stays reachable, so Recovery Mode
 * never traps anyone.
 */
export function RecoveryMode({
  destinationTitle,
  currentLocationLabel,
  nextInstruction,
  onContinue,
  onFindQuietSpace,
  onSitDown,
  onAskForHelp
}: {
  destinationTitle: string;
  currentLocationLabel?: string;
  nextInstruction?: string;
  onContinue: () => void;
  onFindQuietSpace: () => void;
  onSitDown: () => void;
  onAskForHelp: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recovery Mode"
      className="animate-screen-in absolute inset-0 z-20 flex flex-col justify-center gap-5 overflow-y-auto bg-campus-ink px-5 py-6"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <IconTile tone="success">
          <Heart size={22} aria-hidden="true" />
        </IconTile>
        <div>
          <p className="text-lg font-bold text-white">You're okay.</p>
          <p className="mt-1 text-sm text-white/65">
            {currentLocationLabel ? `You're near ${currentLocationLabel}. ` : ""}
            Your destination is still {destinationTitle}, and you're still on your route.
          </p>
        </div>
      </div>

      {nextInstruction && (
        <Card className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Next step, when you're ready</p>
          <p className="mt-1 text-base font-semibold text-white">{nextInstruction}</p>
        </Card>
      )}

      <div className="flex flex-col gap-2.5">
        <Button tone="primary" onClick={onContinue}>
          Continue
        </Button>
        <Button tone="secondary" onClick={onFindQuietSpace}>
          Find Quiet Space
        </Button>
        <Button tone="secondary" onClick={onSitDown}>
          Sit Down Nearby
        </Button>
        <Button tone="ghost" className="text-white/60" onClick={onAskForHelp}>
          Ask for Help
        </Button>
      </div>
    </div>
  );
}
