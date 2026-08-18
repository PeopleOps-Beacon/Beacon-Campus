import { useState } from "react";
import { Accessibility, ArrowLeft, Baby, PawPrint, Toilet, X } from "lucide-react";
import { recommendFacility } from "../lib/campusEngine";
import {
  ADDABLE_STOP_CATEGORIES,
  FACILITY_CATEGORY_META,
  type Campus,
  type CampusPreferences,
  type FacilityCategory
} from "../types/campus";
import { Badge, Card, IconTile, cx } from "./ui/Primitives";
import { Sheet } from "./ui/Sheet";

const CATEGORY_ICON: Record<FacilityCategory, typeof Toilet> = {
  restroom: Toilet,
  "accessible-restroom": Accessibility,
  "service-animal-relief": PawPrint,
  "lactation-room": Baby,
  "family-restroom": Toilet,
  "quiet-space": Toilet,
  "water-fountain": Toilet,
  "charging-station": Toilet
};

/**
 * "Add a Stop" — lets a traveler build an intentional waypoint into the route
 * they're already planning or actively walking, rather than just seeing
 * nearby facilities as a suggestion. Two short steps: pick a category, then
 * pick from a ranked, accessibility-filtered list of real instances. Built
 * on Beacon's shared picker sheet (modal, focused selection) — see Sheet.tsx.
 */
export function AddStopSheet({
  campus,
  fromNodeId,
  destinationBuildingId,
  preferences,
  excludeFacilityIds = [],
  onAdd,
  onClose
}: {
  campus: Campus;
  fromNodeId: string;
  destinationBuildingId: string;
  preferences: CampusPreferences;
  /** Facilities already added to the route — hidden from recommendations so they can't be added twice. */
  excludeFacilityIds?: string[];
  onAdd: (facilityId: string) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<FacilityCategory | null>(null);

  const recommendation = category
    ? recommendFacility(campus, category, fromNodeId, destinationBuildingId, preferences)
    : null;
  const visibleOptions = recommendation?.options.filter((o) => !excludeFacilityIds.includes(o.facility.id)) ?? [];
  const sheetLabel = category ? FACILITY_CATEGORY_META[category].label : "Add a Stop";

  return (
    <Sheet
      variant="picker"
      className="max-h-[80%]"
      onHandleActivate={onClose}
      handleLabel="Close"
      onClose={onClose}
      label={sheetLabel}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 pb-3.5">
        {category ? (
          <button
            type="button"
            onClick={() => setCategory(null)}
            aria-label="Back to categories"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-white">{sheetLabel}</p>
          <p className="truncate text-xs text-white/55">
            {category ? "Pick a stop — Beacon ranks these by how little it detours you." : "What do you need along the way?"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {!category ? (
          <div className="grid grid-cols-2 gap-2.5">
            {ADDABLE_STOP_CATEGORIES.map((id) => {
              const Icon = CATEGORY_ICON[id];
              return (
                <button key={id} type="button" onClick={() => setCategory(id)} className="text-left">
                  <Card className="flex flex-col items-start gap-2 py-4">
                    <IconTile>
                      <Icon size={17} aria-hidden="true" />
                    </IconTile>
                    <span className="text-sm font-semibold text-white">{FACILITY_CATEGORY_META[id].label}</span>
                  </Card>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <h2 className="sr-only">{FACILITY_CATEGORY_META[category].label} options</h2>
            {recommendation && visibleOptions.length === 0 ? (
              <Card className="flex flex-col gap-1.5 text-center">
                <p className="text-sm font-semibold text-white">
                  No compatible {FACILITY_CATEGORY_META[category].label.toLowerCase()} found along your route.
                </p>
                <p className="text-xs text-white/55">
                  {recommendation.excludedForAccessibility > 0
                    ? "The closest options don't match your current accessibility preferences."
                    : "Beacon doesn't have one mapped near this route yet."}
                </p>
              </Card>
            ) : null}

            {visibleOptions.map((option, index) => (
              <button key={option.facility.id} type="button" onClick={() => onAdd(option.facility.id)} className="text-left">
                <Card className={cx("flex items-center gap-3", index === 0 && "border-campus-gold/25 bg-campus-gold/[0.06]")}>
                  <IconTile tone={index === 0 ? "gold" : "neutral"}>
                    {(() => {
                      const Icon = CATEGORY_ICON[category];
                      return <Icon size={16} aria-hidden="true" />;
                    })()}
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {option.building.name}
                      {index === 0 && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-campus-gold">Recommended</span>}
                    </p>
                    <p className="truncate text-xs text-white/55">{option.facility.name.split(" — ")[1] ?? option.facility.name}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={index === 0 ? "gold" : "neutral"}>+{option.addedMinutes} min</Badge>
                    {option.accessible ? (
                      <span className="flex items-center gap-1 text-campus-green">
                        <Accessibility size={13} aria-hidden="true" />
                        <span className="sr-only">Accessible</span>
                      </span>
                    ) : null}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
