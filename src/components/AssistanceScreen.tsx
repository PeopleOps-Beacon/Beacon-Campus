import { useState } from "react";
import { Accessibility, AlertTriangle, ChevronRight, LifeBuoy, MapPin, MessageSquare, ShieldCheck } from "lucide-react";
import { AccessibilityIssueReport } from "./accessibility/AccessibilityIssueReport";
import { useAccessibilityReports } from "../hooks/useAccessibilityReports";
import { Button, Card, IconTile } from "./ui/Primitives";

interface AssistanceOption {
  id: string;
  title: string;
  description: string;
  icon: typeof LifeBuoy;
  urgent?: boolean;
}

const OPTIONS: AssistanceOption[] = [
  {
    id: "safety",
    title: "Campus Safety & Escort",
    description: "Non-emergency safety concerns or a walking escort after dark.",
    icon: ShieldCheck
  },
  {
    id: "medical",
    title: "Medical Emergency",
    description: "For a real medical emergency, call 911 immediately. Beacon cannot contact emergency services.",
    icon: AlertTriangle,
    urgent: true
  },
  {
    id: "accessibility",
    title: "Accessibility Support",
    description: "Adjust step-free routing, extra time, or other route preferences.",
    icon: Accessibility
  },
  {
    id: "lost",
    title: "Lost or Need Directions",
    description: "Search for where you're trying to go.",
    icon: MapPin
  },
  {
    id: "report",
    title: "Report an Issue",
    description: "A broken elevator, blocked path, or something else Beacon should know about.",
    icon: MessageSquare
  }
];

export function AssistanceScreen({
  onOpenAccessibility,
  onSearchDestination
}: {
  onOpenAccessibility: () => void;
  onSearchDestination: () => void;
}) {
  const [noted, setNoted] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { submitReport } = useAccessibilityReports();

  function handleSelect(option: AssistanceOption) {
    if (option.id === "accessibility") {
      onOpenAccessibility();
      return;
    }
    if (option.id === "lost") {
      onSearchDestination();
      return;
    }
    if (option.id === "report") {
      setReportOpen(true);
      return;
    }
    setNoted(option.title);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Beacon Campus</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Request Assistance</h1>
        <p className="mt-1 text-sm text-white/60">Choose the kind of help you need right now.</p>
      </div>

      {noted && (
        <Card className="flex items-start gap-3 border-campus-gold/25 bg-campus-gold/[0.06]" role="status">
          <IconTile tone="gold">
            <LifeBuoy size={16} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-white">Noted for this demo.</p>
            <p className="mt-1 text-sm text-white/65">
              In a live deployment, "{noted}" would be routed to the right campus team. This preview doesn't send a
              real request.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button key={option.id} type="button" onClick={() => handleSelect(option)} className="text-left">
              <Card className={option.urgent ? "flex items-start gap-3 border-red-500/30 bg-red-500/[0.06]" : "flex items-start gap-3"}>
                <IconTile tone={option.urgent ? "danger" : "neutral"}>
                  <Icon size={16} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{option.title}</p>
                  <p className="mt-0.5 text-xs text-white/60">{option.description}</p>
                </div>
                {!option.urgent && <ChevronRight size={16} className="mt-1 shrink-0 text-white/30" aria-hidden="true" />}
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="flex items-start gap-3">
        <IconTile tone="info">
          <LifeBuoy size={16} aria-hidden="true" />
        </IconTile>
        <p className="text-xs text-white/55">
          This is a demonstration. For a real emergency, call 911. For non-emergency Public Safety matters, contact
          Clemson University Police through official university channels.
        </p>
      </Card>

      {reportOpen && (
        <AccessibilityIssueReport
          onSubmit={(category, location, description) => submitReport(category, location, description)}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

export function AssistanceQuickAction({ onClick }: { onClick: () => void }) {
  return (
    <Button tone="ghost" className="w-full justify-center text-white/60" onClick={onClick}>
      <LifeBuoy size={15} aria-hidden="true" />
      Request assistance
    </Button>
  );
}
