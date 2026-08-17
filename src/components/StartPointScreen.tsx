import { Check, MapPin } from "lucide-react";
import { START_POINT_OPTIONS } from "../data/beaconUniversity";
import { Card, IconTile } from "./ui/Primitives";

export function StartPointScreen({
  currentStartNodeId,
  onSelect
}: {
  currentStartNodeId: string;
  onSelect: (nodeId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">Where are you starting from?</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Starting Point</h1>
        <p className="mt-1 text-sm text-white/60">
          Beacon uses this as the start of every route until you change it or arrive somewhere new.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {START_POINT_OPTIONS.map((option) => {
          const active = option.id === currentStartNodeId;
          return (
            <button key={option.id} type="button" onClick={() => onSelect(option.id)} className="text-left">
              <Card className={active ? "flex items-center gap-3 border-campus-gold/50 bg-campus-gold/[0.06]" : "flex items-center gap-3"}>
                <IconTile tone={active ? "gold" : "neutral"}>
                  <MapPin size={16} aria-hidden="true" />
                </IconTile>
                <span className="flex-1 text-sm font-medium text-white">{option.label}</span>
                {active && <Check size={18} className="text-campus-gold" aria-hidden="true" />}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
