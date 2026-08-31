import { useMemo, useState } from "react";
import { Armchair, Coffee, Toilet } from "lucide-react";
import { pulse } from "../../lib/haptics";
import { recommendFacility } from "../../lib/campusEngine";
import type { Campus, CampusPreferences } from "../../types/campus";
import { Button, Card, IconTile } from "../ui/Primitives";
import { Sheet } from "../ui/Sheet";

/**
 * Pause active navigation and see what's nearby without losing your place —
 * "Resume Route" and simply dismissing both leave stepIndex/plan completely
 * untouched (this component never mutates route state itself; the two
 * facility buttons hand off to the same real Add-a-Stop path NavigationScreen
 * already uses, so choosing one is a genuine route change, not a shortcut).
 */
export function RestResumeSheet({
  campus,
  fromNodeId,
  destinationBuildingId,
  preferences,
  onFindFacility,
  onClose
}: {
  campus: Campus;
  fromNodeId: string;
  destinationBuildingId: string;
  preferences: CampusPreferences;
  onFindFacility: (facilityId: string) => void;
  onClose: () => void;
}) {
  const quietSpace = useMemo(
    () => recommendFacility(campus, "quiet-space", fromNodeId, destinationBuildingId, preferences).options[0],
    [campus, fromNodeId, destinationBuildingId, preferences]
  );
  const restroomCategory = preferences.stepFree ? "accessible-restroom" : "restroom";
  const restroom = useMemo(
    () => recommendFacility(campus, restroomCategory, fromNodeId, destinationBuildingId, preferences).options[0],
    [campus, fromNodeId, destinationBuildingId, preferences, restroomCategory]
  );
  const [breathe, setBreathe] = useState(false);

  return (
    <Sheet variant="picker" className="max-h-[75%]" onHandleActivate={onClose} handleLabel="Close" onClose={onClose} label="Need a break?">
      <div className="flex flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        <div>
          <h2 className="text-lg font-bold text-white">Need a break?</h2>
          <p className="mt-0.5 text-sm text-white/55">Pause here for a moment — your route and progress stay exactly where they are.</p>
        </div>

        {quietSpace && (
          <Card className="flex items-center gap-3">
            <IconTile tone="info">
              <Armchair size={16} aria-hidden="true" />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Quiet space</p>
              <p className="truncate text-xs text-white/55">{quietSpace.building.name} · +{quietSpace.addedMinutes} min</p>
            </div>
            <Button tone="secondary" className="shrink-0 px-3 text-xs" onClick={() => onFindFacility(quietSpace.facility.id)}>
              Find Quiet Space
            </Button>
          </Card>
        )}

        {restroom && (
          <Card className="flex items-center gap-3">
            <IconTile tone="info">
              <Toilet size={16} aria-hidden="true" />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{preferences.stepFree ? "Accessible restroom" : "Restroom"}</p>
              <p className="truncate text-xs text-white/55">{restroom.building.name} · +{restroom.addedMinutes} min</p>
            </div>
            <Button tone="secondary" className="shrink-0 px-3 text-xs" onClick={() => onFindFacility(restroom.facility.id)}>
              Find Restroom
            </Button>
          </Card>
        )}

        {!quietSpace && !restroom && (
          <Card className="flex items-center gap-3 text-sm text-white/60">
            <IconTile tone="neutral">
              <Coffee size={16} aria-hidden="true" />
            </IconTile>
            Nothing reachable nearby under your current preferences — Resume Route when you're ready.
          </Card>
        )}

        <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
          <Button
            tone="ghost"
            className="text-white/60"
            onClick={() => {
              pulse(15);
              setBreathe(true);
            }}
          >
            Take a Break
          </Button>
          {breathe && <p className="text-center text-xs text-white/50">Take your time. Resume whenever you're ready.</p>}
          <Button tone="primary" onClick={onClose}>
            Resume Route
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
