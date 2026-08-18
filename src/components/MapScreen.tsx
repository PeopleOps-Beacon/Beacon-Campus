import { useState, type ReactNode } from "react";
import { Accessibility, Car, ChevronRight, Crosshair, MapPinPlus, Navigation, ShieldAlert, Toilet, X } from "lucide-react";
import type { SavedCar } from "../hooks/useSavedCar";
import type { Campus, CampusPreferences, DestinationIntel, RouteMode, RouteWaypoint, SearchResult } from "../types/campus";
import { ROUTE_MODE_META } from "../types/campus";
import { formatWalkDistance, routeRationale } from "../lib/campusEngine";
import { useComboboxNavigation } from "../hooks/useComboboxNavigation";
import { AddStopSheet } from "./AddStopSheet";
import { BottomSheet } from "./BottomSheet";
import { BuildingVisual } from "./BuildingVisual";
import { CampusMap } from "./CampusMap";
import { DataProvenanceBadge } from "./DataProvenanceBadge";
import { LocationPermissionPrompt } from "./LocationPermissionPrompt";
import { SearchBar } from "./SearchBar";
import { SearchResultsList } from "./SearchResultsList";
import { Badge, Button, IconTile, cx } from "./ui/Primitives";

export function MapScreen({
  campus,
  startNodeId,
  startPointLabel,
  onChangeStartPoint,
  preferences,
  effectivePreferences,
  routeMode,
  onSelectRouteMode,
  onToggleAccessibleRoute,
  onFindRestroom,
  onOpenParkingList,
  onOpenEmergency,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectSearchResult,
  savedCar,
  savedCarLot,
  onOpenReturnToCar,
  destinationIntel,
  activeWaypoints,
  onAddWaypoint,
  onRemoveWaypoint,
  sheetExpanded,
  onToggleSheetExpanded,
  onCloseSheet,
  onSelectBuilding,
  onStartRoute,
  onViewBuildingDetails,
  activeParkingLot,
  onSelectParkingPin,
  onRememberCarHere,
  locationPrompt
}: {
  campus: Campus;
  startNodeId: string;
  startPointLabel: string;
  onChangeStartPoint: () => void;
  preferences: CampusPreferences;
  effectivePreferences: CampusPreferences;
  routeMode: RouteMode;
  onSelectRouteMode: (mode: RouteMode) => void;
  onToggleAccessibleRoute: () => void;
  onFindRestroom: () => void;
  onOpenParkingList: () => void;
  onOpenEmergency: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: SearchResult[];
  onSelectSearchResult: (result: SearchResult) => void;
  savedCar: SavedCar | null;
  savedCarLot: Campus["parkingLots"][number] | undefined;
  onOpenReturnToCar: () => void;
  destinationIntel: DestinationIntel | null;
  activeWaypoints: RouteWaypoint[];
  onAddWaypoint: (facilityId: string) => void;
  onRemoveWaypoint: (facilityId: string) => void;
  sheetExpanded: boolean;
  onToggleSheetExpanded: () => void;
  onCloseSheet: () => void;
  onSelectBuilding: (buildingId: string) => void;
  onStartRoute: () => void;
  onViewBuildingDetails: () => void;
  activeParkingLot: Campus["parkingLots"][number] | undefined;
  onSelectParkingPin: (lotId: string) => void;
  onRememberCarHere: (lotId: string) => void;
  locationPrompt: { onAllow: () => void; onDecline: () => void } | null;
}) {
  const combobox = useComboboxNavigation(searchResults, onSelectSearchResult);
  const searching = searchQuery.trim().length > 0;
  const sheetOpen = Boolean(destinationIntel || activeParkingLot);

  return (
    <div className="relative h-full w-full">
      <CampusMap
        campus={campus}
        startNodeId={startNodeId}
        highlightBuildingId={destinationIntel?.buildingId}
        onSelectBuilding={onSelectBuilding}
        onSelectParking={onSelectParkingPin}
        savedCarLotId={savedCar?.lotId}
        fill
        className="absolute inset-0 rounded-none border-0"
      />

      <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2.5 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="rounded-[999px] border border-white/10 bg-campus-surface/90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur">
          <SearchBar
            value={searchQuery}
            onChange={onSearchQueryChange}
            listboxId="map-search-results"
            expanded={searching}
            activeDescendant={combobox.activeId}
            onKeyDown={combobox.onKeyDown}
            autoFocus={false}
          />
        </div>

        {!searching && (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            <Chip
              active={preferences.stepFree}
              icon={<Accessibility size={13} aria-hidden="true" />}
              label="Accessible route"
              onClick={onToggleAccessibleRoute}
            />
            <Chip icon={<Toilet size={13} aria-hidden="true" />} label="Restroom" onClick={onFindRestroom} />
            <Chip icon={<Car size={13} aria-hidden="true" />} label="Parking" onClick={onOpenParkingList} />
            <Chip icon={<ShieldAlert size={13} aria-hidden="true" />} label="Emergency" onClick={onOpenEmergency} />
            <Chip
              accent={Boolean(savedCar)}
              icon={<Car size={13} aria-hidden="true" />}
              label={savedCar ? (savedCarLot ? `My car · ${savedCarLot.name}` : "My car") : "Remember my car"}
              onClick={savedCar ? onOpenReturnToCar : onOpenParkingList}
            />
          </div>
        )}

        {!searching && locationPrompt && (
          <div className="rounded-[var(--radius-card)] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]">
            <LocationPermissionPrompt onAllow={locationPrompt.onAllow} onDecline={locationPrompt.onDecline} />
          </div>
        )}
      </div>

      {searching && (
        <div className="absolute inset-x-0 top-[70px] bottom-[var(--tabbar-clearance)] z-10 overflow-y-auto bg-campus-ink/98 px-3 pb-6 pt-2 backdrop-blur">
          <SearchResultsList
            results={searchResults}
            query={searchQuery}
            onSelect={onSelectSearchResult}
            listboxId="map-search-results"
            activeId={combobox.activeId}
          />
        </div>
      )}

      {!searching && !sheetExpanded && (
        <button
          type="button"
          onClick={onChangeStartPoint}
          aria-label={`Starting point: ${startPointLabel}. Tap to change.`}
          className={cx(
            "absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-campus-surface/90 text-campus-sky shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] backdrop-blur",
            sheetOpen ? "bottom-[calc(var(--tabbar-clearance)+172px+14px)]" : "bottom-[calc(var(--tabbar-clearance)+14px)]"
          )}
        >
          <Crosshair size={19} aria-hidden="true" />
        </button>
      )}

      {sheetOpen && (
        <BottomSheet
          expanded={sheetExpanded}
          onToggleExpanded={onToggleSheetExpanded}
          label={destinationIntel?.title ?? activeParkingLot?.name ?? "Details"}
          peek={
            destinationIntel ? (
              <PeekDestination intel={destinationIntel} onClose={onCloseSheet} onExpand={onToggleSheetExpanded} />
            ) : activeParkingLot ? (
              <PeekParking lot={activeParkingLot} isCar={activeParkingLot.id === savedCar?.lotId} onClose={onCloseSheet} onExpand={onToggleSheetExpanded} />
            ) : null
          }
        >
          {destinationIntel ? (
            <ExpandedDestination
              campus={campus}
              startNodeId={startNodeId}
              intel={destinationIntel}
              routeMode={routeMode}
              onSelectRouteMode={onSelectRouteMode}
              effectivePreferences={effectivePreferences}
              activeWaypoints={activeWaypoints}
              onAddWaypoint={onAddWaypoint}
              onRemoveWaypoint={onRemoveWaypoint}
              onStartRoute={onStartRoute}
              onViewDetails={onViewBuildingDetails}
              onClose={onCloseSheet}
            />
          ) : activeParkingLot ? (
            <ExpandedParking
              lot={activeParkingLot}
              isCar={activeParkingLot.id === savedCar?.lotId}
              onRememberCar={() => onRememberCarHere(activeParkingLot.id)}
              onWalkToCar={onOpenReturnToCar}
              onClose={onCloseSheet}
            />
          ) : null}
        </BottomSheet>
      )}
    </div>
  );
}

function Chip({ icon, label, onClick, active, accent }: { icon: ReactNode; label: string; onClick: () => void; active?: boolean; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)] backdrop-blur transition-transform active:translate-y-px",
        active || accent ? "beacon-selected border-transparent" : "border-white/10 bg-campus-surface/90 text-white/80"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function PeekDestination({ intel, onClose, onExpand }: { intel: DestinationIntel; onClose: () => void; onExpand: () => void }) {
  return (
    <button type="button" onClick={onExpand} className="flex w-full items-center gap-3 py-2 text-left">
      <BuildingVisual building={intel.building} height={44} className="w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{intel.title}</p>
        <p className="truncate text-xs text-white/55">{intel.walkMinutes} min walk · {intel.recommendedEntrance.label}</p>
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

const ROUTE_MODE_ORDER: RouteMode[] = ["fastest", "calm", "mobility", "custom"];

function ExpandedDestination({
  campus,
  startNodeId,
  intel,
  routeMode,
  onSelectRouteMode,
  effectivePreferences,
  activeWaypoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onStartRoute,
  onViewDetails,
  onClose
}: {
  campus: Campus;
  startNodeId: string;
  intel: DestinationIntel;
  routeMode: RouteMode;
  onSelectRouteMode: (mode: RouteMode) => void;
  effectivePreferences: CampusPreferences;
  activeWaypoints: RouteWaypoint[];
  onAddWaypoint: (facilityId: string) => void;
  onRemoveWaypoint: (facilityId: string) => void;
  onStartRoute: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}) {
  const [addStopOpen, setAddStopOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex items-start gap-3">
        <BuildingVisual building={intel.building} height={64} className="w-16 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-white">{intel.title}</p>
          {intel.roomNumber && <p className="text-xs text-white/55">Room {intel.roomNumber}{intel.floor ? ` · Floor ${intel.floor}` : ""}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={intel.openStatus.isOpen ? "success" : "neutral"}>{intel.openStatus.label}</Badge>
            <DataProvenanceBadge provenance={intel.building.provenance} />
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm text-white/70">
        {intel.walkMinutes} min · {formatWalkDistance(intel.walkMinutes)} walk · {intel.recommendedEntrance.label}
        {intel.entranceSubstituted ? " (adjusted for a closure)" : ""}
      </p>

      {activeWaypoints.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Via</p>
          {activeWaypoints.map((waypoint) => (
            <div key={waypoint.facilityId} className="flex items-center gap-2 rounded-[var(--radius-control)] bg-white/[0.05] px-2.5 py-1.5">
              <MapPinPlus size={13} className="shrink-0 text-campus-gold" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">{waypoint.label}</span>
              <button
                type="button"
                onClick={() => onRemoveWaypoint(waypoint.facilityId)}
                aria-label={`Remove stop: ${waypoint.label}`}
                className="shrink-0 text-white/40 hover:text-white"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Route mode">
          {ROUTE_MODE_ORDER.map((mode) => {
            const active = routeMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelectRouteMode(mode)}
                className={cx(
                  "rounded-[var(--radius-control)] px-2 py-1.5 text-center text-xs font-semibold transition-all active:translate-y-px",
                  active ? "beacon-selected" : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
                )}
              >
                {ROUTE_MODE_META[mode].label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-white/50">{routeRationale(routeMode, intel)}</p>
      </div>

      <button
        type="button"
        onClick={() => setAddStopOpen(true)}
        className="flex items-center justify-between rounded-[var(--radius-control)] border border-dashed border-white/15 px-3 py-2 text-left text-sm font-medium text-white/70 hover:border-white/25 hover:text-white"
      >
        <span className="flex items-center gap-2">
          <MapPinPlus size={15} aria-hidden="true" />
          Add a stop
        </span>
        <ChevronRight size={15} className="text-white/30" aria-hidden="true" />
      </button>

      <div className="flex gap-2">
        <Button tone="secondary" className="flex-1" onClick={onViewDetails}>
          View details
        </Button>
        <Button tone="primary" className="flex-1" onClick={onStartRoute}>
          <Navigation size={15} aria-hidden="true" />
          Start route
        </Button>
      </div>

      {addStopOpen && (
        <AddStopSheet
          campus={campus}
          fromNodeId={startNodeId}
          destinationBuildingId={intel.buildingId}
          preferences={effectivePreferences}
          excludeFacilityIds={activeWaypoints.map((w) => w.facilityId)}
          onAdd={(facilityId) => {
            onAddWaypoint(facilityId);
            setAddStopOpen(false);
          }}
          onClose={() => setAddStopOpen(false)}
        />
      )}
    </div>
  );
}

function PeekParking({ lot, isCar, onClose, onExpand }: { lot: Campus["parkingLots"][number]; isCar: boolean; onClose: () => void; onExpand: () => void }) {
  return (
    <button type="button" onClick={onExpand} className="flex w-full items-center gap-3 py-2 text-left">
      <IconTile tone={isCar ? "gold" : "neutral"}>
        <Car size={18} aria-hidden="true" />
      </IconTile>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{lot.name}</p>
        <p className="truncate text-xs text-white/55">{isCar ? "This is where you parked" : lot.closed ? "Closed" : "Tap to remember your car here"}</p>
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

function ExpandedParking({
  lot,
  isCar,
  onRememberCar,
  onWalkToCar,
  onClose
}: {
  lot: Campus["parkingLots"][number];
  isCar: boolean;
  onRememberCar: () => void;
  onWalkToCar: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex items-start gap-3">
        <IconTile tone={isCar ? "gold" : "neutral"}>
          <Car size={18} aria-hidden="true" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-white">{lot.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {lot.closed && <Badge tone="danger">Closed</Badge>}
            {lot.eligibility.map((e) => (
              <Badge key={e} tone="neutral">
                {e}
              </Badge>
            ))}
            <Badge tone="neutral">{lot.accessibleSpaces} accessible</Badge>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {lot.notes && <p className="text-sm text-white/65">{lot.notes}</p>}

      {isCar ? (
        <Button tone="primary" onClick={onWalkToCar}>
          <Navigation size={15} aria-hidden="true" />
          Walk back to my car
        </Button>
      ) : (
        <Button tone="primary" onClick={onRememberCar} disabled={lot.closed}>
          <Car size={15} aria-hidden="true" />
          Remember my car here
        </Button>
      )}
    </div>
  );
}
