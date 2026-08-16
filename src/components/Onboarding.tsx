import { GraduationCap, Handshake, Landmark, Sparkle, Users, Briefcase } from "lucide-react";
import type { Persona } from "../types/campus";
import { BeaconLogo } from "./ui/BeaconLogo";
import { Button, Card, cx } from "./ui/Primitives";

const PERSONAS: { id: Persona; label: string; description: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "Student", description: "Classes, dining, and campus services", icon: GraduationCap },
  { id: "new-student", label: "New Student", description: "First week, move-in, and orientation", icon: Sparkle },
  { id: "prospective-student", label: "Prospective Student", description: "Tours, admissions, and academics", icon: Landmark },
  { id: "parent", label: "Parent or Family", description: "Move-in, events, and visiting", icon: Users },
  { id: "visitor", label: "Visitor", description: "Meetings, events, and parking", icon: Handshake },
  { id: "faculty-staff", label: "Faculty or Staff", description: "Buildings, offices, and meetings", icon: Briefcase }
];

export function Onboarding({ onSelect, onSkip }: { onSelect: (persona: Persona) => void; onSkip: () => void }) {
  return (
    <div className="flex min-h-full flex-col justify-between px-4 py-10">
      <div>
        <div className="mb-8 flex flex-col items-center text-center">
          <BeaconLogo size={56} />
          <h1 className="mt-4 text-[var(--font-display)] font-bold text-white">Beacon Campus</h1>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Beacon helps you understand where you are, where you need to go, and what you need to know along the way.
          </p>
        </div>

        <p className="mb-3 text-center text-sm font-medium text-white/70">How are you visiting campus?</p>
        <div className="grid grid-cols-2 gap-3">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            return (
              <button key={persona.id} type="button" onClick={() => onSelect(persona.id)} className="text-left">
                <Card className={cx("h-full transition-colors hover:border-campus-gold/40")}>
                  <Icon size={22} className="mb-2 text-campus-gold" aria-hidden="true" />
                  <p className="text-sm font-semibold text-white">{persona.label}</p>
                  <p className="mt-0.5 text-xs text-white/55">{persona.description}</p>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button tone="ghost" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
