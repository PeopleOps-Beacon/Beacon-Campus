import type { ReactNode } from "react";
import { Accessibility, Car, Crosshair, Navigation, ShieldAlert, Toilet, X } from "lucide-react";
import type { SavedCar } from "../hooks/useSavedCar";
import type { Campus, CampusPreferences, DestinationIntel, SearchResult } from "../types/campus";
import { useComboboxNavigation } from "../hooks/useComboboxNavigation";
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
            {savedCar && (
              <Chip
                accent
                icon={<Car size={13} aria-hidden="true" />}
                label={savedCarLot ? `My car · ${savedCarLot.name}` : "My car"}
                onClick={onOpenReturnToCar}
              />
            )}
          </div>
        )}

        {!searching && locationPrompt && (
          <div className="rounded-[var(--radius-card)] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]">
            <LocationPermissionPrompt onAllow={locationPrompt.onAllow} onDecline={locationPrompt.onDecline} />
          </div>
        )}
      </div>

      {searching && (
        <div className="absolute inset-x-0 top-[70px] bottom-0 z-10 overflow-y-auto bg-campus-ink/98 px-3 pb-6 pt-2 backdrop-blur">
          <SearchResultsList
            results={searchResults}
            query={searchQuery}
            onSelect={onSelectSearchResult}
            listboxId="map-search-results"
            activeId={combobox.activeId}
          />
        </div>
      )}

      {!searching && (
        <button
          type="button"
          onClick={onChangeStartPoint}
          aria-label={`Starting point: ${startPointLabel}. Tap to change.`}
          className={cx(
            "absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-campus-surface/90 text-campus-sky shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] backdrop-blur",
            sheetOpen ? (sheetExpanded ? "bottom-[calc(78%+14px)]" : "bottom-[186px]") : "bottom-[14px]"
          )}
        >
          <Crosshair size={19} aria-hidden="true" />
        </button>
      )}

      {sheetOpen && (
        <BottomSheet
          expanded={sheetExpanded}
          onToggleExpanded={onToggleSheetExpanded}
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
              intel={destinationIntel}
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
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)] backdrop-blur transition-transform active:scale-95",
        active || accent
          ? "border-campus-gold/50 bg-campus-gold/15 text-campus-gold"
          : "border-white/10 bg-campus-surface/90 text-white/80"
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

function ExpandedDestination({
  intel,
  onStartRoute,
  onViewDetails,
  onClose
}: {
  intel: DestinationIntel;
  onStartRoute: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}) {
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
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm text-white/70">
        {intel.walkMinutes} min walk · {intel.recommendedEntrance.label}
        {intel.entranceSubstituted ? " (adjusted for a closure)" : ""}
      </p>
      {intel.accessibilityNote && <p className="text-xs text-campus-sky">{intel.accessibilityNote}</p>}

      <div className="flex gap-2">
        <Button tone="secondary" className="flex-1" onClick={onViewDetails}>
          View details
        </Button>
        <Button tone="primary" className="flex-1" onClick={onStartRoute}>
          <Navigation size={15} aria-hidden="true" />
          Start route
        </Button>
      </div>
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
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
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white">
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
