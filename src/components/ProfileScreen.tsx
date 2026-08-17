import { Accessibility, Car, ChevronRight, HelpCircle, MapPin, ShieldCheck } from "lucide-react";
import type { SavedCar } from "../hooks/useSavedCar";
import type { Campus, ParkingLot, Persona } from "../types/campus";
import { Badge, Card, IconTile } from "./ui/Primitives";

const PERSONA_LABEL: Record<Persona, string> = {
  student: "Student",
  "new-student": "New Student",
  "prospective-student": "Prospective Student",
  parent: "Parent or Family",
  visitor: "Visitor",
  "faculty-staff": "Faculty or Staff"
};

export function ProfileScreen({
  campus,
  persona,
  startPointLabel,
  onChangeStartPoint,
  savedCar,
  savedCarLot,
  onWalkToCar,
  onForgetCar,
  onOpenAccessibility,
  onOpenAdmin,
  onOpenHelp
}: {
  campus: Campus;
  persona: Persona | null;
  startPointLabel: string;
  onChangeStartPoint: () => void;
  savedCar: SavedCar | null;
  savedCarLot: ParkingLot | undefined;
  onWalkToCar: () => void;
  onForgetCar: () => void;
  onOpenAccessibility: () => void;
  onOpenAdmin: () => void;
  onOpenHelp: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">{campus.universityName}</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Profile</h1>
        {persona && <Badge tone="gold">{PERSONA_LABEL[persona]}</Badge>}
      </div>

      <Row icon={MapPin} label="Starting point" value={startPointLabel} onClick={onChangeStartPoint} />

      {savedCar ? (
        <Card className="flex items-start gap-3 border-campus-gold/25 bg-campus-gold/[0.06]">
          <IconTile tone="gold">
            <Car size={16} aria-hidden="true" />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">My Car</p>
            <p className="text-xs text-white/60">{savedCarLot?.name ?? savedCar.lotId}</p>
            {savedCar.note && <p className="mt-0.5 text-xs text-campus-gold">"{savedCar.note}"</p>}
            <div className="mt-2.5 flex gap-2">
              <button type="button" onClick={onWalkToCar} className="rounded-full bg-campus-gold px-3 py-1.5 text-xs font-semibold text-campus-ink">
                Walk to car
              </button>
              <button type="button" onClick={onForgetCar} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70">
                Forget
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex items-start gap-3">
          <IconTile>
            <Car size={16} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-white">My Car</p>
            <p className="text-xs text-white/55">Not set — tap a parking lot on the map and choose "Remember my car here."</p>
          </div>
        </Card>
      )}

      <Row icon={Accessibility} label="Accessibility & Preferences" value="Routes, text size, voice" onClick={onOpenAccessibility} />
      <Row icon={HelpCircle} label="Help" value="How Beacon works, data sources" onClick={onOpenHelp} />
      <Row icon={ShieldCheck} label="Admin Preview" value="Staff console (local demo)" onClick={onOpenAdmin} />

      <p className="mt-2 text-center text-xs text-white/35">Beacon Campus · {campus.universityName}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value, onClick }: { icon: typeof MapPin; label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="flex items-center gap-3">
        <IconTile>
          <Icon size={16} aria-hidden="true" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="truncate text-xs text-white/55">{value}</p>
        </div>
        <ChevronRight size={16} className="shrink-0 text-white/30" aria-hidden="true" />
      </Card>
    </button>
  );
}
