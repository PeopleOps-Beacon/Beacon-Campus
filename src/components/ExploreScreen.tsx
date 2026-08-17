import {
  Accessibility,
  Building2,
  Compass,
  GraduationCap,
  HelpCircle,
  Landmark,
  MapPinned,
  ShieldAlert,
  Sparkles,
  SquareParking,
  Trophy,
  Users,
  UtensilsCrossed
} from "lucide-react";
import type { Campus } from "../types/campus";
import { Card, IconTile, SectionHeading } from "./ui/Primitives";

export type CategoryId =
  | "classes"
  | "buildings"
  | "dining"
  | "parking"
  | "student-services"
  | "admissions"
  | "athletics"
  | "residence-halls"
  | "emergency"
  | "accessibility";

const CATEGORIES: { id: CategoryId; label: string; icon: typeof Building2 }[] = [
  { id: "classes", label: "Classes", icon: GraduationCap },
  { id: "buildings", label: "Buildings", icon: Building2 },
  { id: "dining", label: "Dining", icon: UtensilsCrossed },
  { id: "parking", label: "Parking", icon: SquareParking },
  { id: "student-services", label: "Student Services", icon: Users },
  { id: "admissions", label: "Admissions", icon: Landmark },
  { id: "athletics", label: "Athletics", icon: Trophy },
  { id: "residence-halls", label: "Residence Halls", icon: Building2 },
  { id: "emergency", label: "Emergency", icon: ShieldAlert },
  { id: "accessibility", label: "Accessibility", icon: Accessibility }
];

type ExploreScreenId = "events" | "orientation" | "tour" | "assistant" | "help";

const MORE: { screen: ExploreScreenId; label: string; description: string; icon: typeof Compass }[] = [
  { screen: "events", label: "Events", description: "Campus events and arrival guidance", icon: Sparkles },
  { screen: "orientation", label: "Orientation Mode", description: "First-day welcome & checklist", icon: Users },
  { screen: "tour", label: "Campus Tour", description: "Self-guided walking tour", icon: MapPinned },
  { screen: "assistant", label: "Ask Beacon", description: "Quick answers to common questions", icon: Compass },
  { screen: "help", label: "Help", description: "How to use Beacon Campus", icon: HelpCircle }
];

export function ExploreScreen({
  campus,
  onSelectCategory,
  onNavigate
}: {
  campus: Campus;
  onSelectCategory: (id: CategoryId) => void;
  onNavigate: (screen: ExploreScreenId) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Explore</h1>
      </div>

      <div>
        <SectionHeading title="Get around campus" />
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} type="button" onClick={() => onSelectCategory(cat.id)} className="flex flex-col items-center gap-1.5">
                <IconTile>
                  <Icon size={18} aria-hidden="true" />
                </IconTile>
                <span className="text-center text-[11px] leading-tight text-white/70">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading title="More" />
        <div className="grid grid-cols-2 gap-2.5">
          {MORE.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.screen} type="button" onClick={() => onNavigate(item.screen)} className="text-left">
                <Card className="flex h-full flex-col gap-2">
                  <IconTile tone="gold">
                    <Icon size={16} aria-hidden="true" />
                  </IconTile>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-0.5 text-xs text-white/55">{item.description}</p>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
