import { useState } from "react";
import type { Campus } from "../types/campus";
import { BuildingIllustration } from "./BuildingIllustration";
import { CampusMap } from "./CampusMap";
import { Badge, Button, Card } from "./ui/Primitives";

export function CampusTourScreen({ campus, onNavigateToBuilding }: { campus: Campus; onNavigateToBuilding: (buildingId: string) => void }) {
  const stops = campus.tourStops.slice().sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const stop = stops[index];
  const building = stop.buildingId ? campus.buildings.find((b) => b.id === stop.buildingId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Self-Guided Campus Tour</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">
          Stop {index + 1} of {stops.length}
        </h1>
      </div>

      {building && <BuildingIllustration category={building.category} height={130} className="w-full rounded-[var(--radius-card)]" />}

      <CampusMap campus={campus} highlightBuildingId={stop.buildingId} pinPoint={stop.buildingId ? undefined : stop.point} height={190} />

      <Card>
        <Badge tone="gold">{stop.title}</Badge>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{stop.description}</p>
        {building && (
          <Button tone="secondary" className="mt-4 w-full" onClick={() => onNavigateToBuilding(building.id)}>
            Navigate to {building.name}
          </Button>
        )}
      </Card>

      <div className="mt-auto flex gap-2.5">
        <Button tone="secondary" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          Previous Stop
        </Button>
        <Button
          tone="primary"
          className="flex-1"
          disabled={index === stops.length - 1}
          onClick={() => setIndex((i) => Math.min(stops.length - 1, i + 1))}
        >
          Next Stop
        </Button>
      </div>
    </div>
  );
}
