import { useEffect, useMemo, useState } from "react";
import { DEFAULT_START_NODE_ID, START_POINT_OPTIONS } from "./data/beaconUniversity";
import { pulse } from "./lib/haptics";
import {
  computeRoutePlan,
  destinationTargetFromSearchResult,
  getBuilding,
  getDestinationIntel,
  search
} from "./lib/campusEngine";
import { useCampusData } from "./hooks/useCampusData";
import { useLocationPermission } from "./hooks/useLocationPermission";
import { usePreferences } from "./hooks/usePreferences";
import { useAnalytics } from "./hooks/useAnalytics";
import { useNotificationRead } from "./hooks/useNotificationRead";
import { useSavedCar } from "./hooks/useSavedCar";
import type { DestinationTarget } from "./lib/campusEngine";
import {
  effectivePreferences,
  FACILITY_CATEGORY_META,
  type Building,
  type BuildingCategory,
  type Campus,
  type CampusEvent,
  type ClassScheduleEntry,
  type Persona,
  type RouteMode,
  type SearchResult
} from "./types/campus";

import { MobileAppShell } from "./components/shell/MobileAppShell";
import { PhoneFrame } from "./components/shell/PhoneFrame";
import type { TabId } from "./components/shell/TabNavigator";
import { LandingScreen } from "./components/LandingScreen";
import { Onboarding } from "./components/Onboarding";
import { MapScreen } from "./components/MapScreen";
import { NavigationScreen } from "./components/NavigationScreen";
import { ArrivalScreen } from "./components/ArrivalScreen";
import { ScheduleScreen } from "./components/ScheduleScreen";
import { BuildingDetailScreen } from "./components/BuildingDetailScreen";
import { ParkingScreen } from "./components/ParkingScreen";
import { ServicesDirectory } from "./components/ServicesDirectory";
import { AlertsCenter } from "./components/AlertsCenter";
import { EventsScreen } from "./components/EventsScreen";
import { EventDetailScreen } from "./components/EventDetailScreen";
import { OrientationModeScreen } from "./components/OrientationModeScreen";
import { CampusTourScreen } from "./components/CampusTourScreen";
import { AccessibilityPanel } from "./components/AccessibilityPanel";
import { QuickQuestions } from "./components/QuickQuestions";
import { DirectoryScreen } from "./components/DirectoryScreen";
import { StartPointScreen } from "./components/StartPointScreen";
import { ExploreScreen, type CategoryId } from "./components/ExploreScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ReturnToCarScreen } from "./components/ReturnToCarScreen";
import { AssistanceScreen } from "./components/AssistanceScreen";
import { HelpScreen } from "./components/HelpScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { JourneyNeedsScreen } from "./components/onboarding/JourneyNeedsScreen";
import { JourneyStopsScreen } from "./components/onboarding/JourneyStopsScreen";
import { JourneyDestinationScreen } from "./components/onboarding/JourneyDestinationScreen";
import { ErrorState } from "./components/ui/Primitives";

type Screen =
  | "map"
  | "schedule"
  | "explore"
  | "alerts"
  | "profile"
  | "navigation"
  | "arrival"
  | "building"
  | "directory"
  | "start-point"
  | "parking"
  | "services"
  | "events"
  | "event-detail"
  | "orientation"
  | "tour"
  | "assistant"
  | "assistance"
  | "accessibility"
  | "help"
  | "admin"
  | "return-to-car"
  | "onboarding-needs"
  | "onboarding-stops"
  | "onboarding-destination";

const PRIMARY_TABS: Screen[] = ["map", "schedule", "explore", "alerts", "profile"];

interface SessionState {
  screen: Screen;
  activeTab: TabId;
  startNodeId: string;
  activeBuildingId: string | null;
  activeDestinationTarget: DestinationTarget | null;
  activeParkingLotId: string | null;
  sheetExpanded: boolean;
  routeMode: RouteMode;
  activeWaypointFacilityIds: string[];
  /** Manually-searched buildings added as stops — routed through directly, alongside (but tracked separately from) category-based facility waypoints. */
  activeCustomStopBuildingIds: string[];
  activeEventId: string | null;
  navStepIndex: number;
  directoryFilter: { title: string; category?: BuildingCategory } | null;
  locationPromptDismissed: boolean;
}

const SESSION_KEY = "beacon-campus-session";

const DEFAULT_SESSION: SessionState = {
  screen: "schedule",
  activeTab: "myday",
  startNodeId: DEFAULT_START_NODE_ID,
  activeBuildingId: null,
  activeDestinationTarget: null,
  activeParkingLotId: null,
  sheetExpanded: false,
  routeMode: "fastest",
  activeWaypointFacilityIds: [],
  activeCustomStopBuildingIds: [],
  activeEventId: null,
  navStepIndex: 0,
  directoryFilter: null,
  locationPromptDismissed: false
};

function loadSession(): SessionState {
  if (typeof window === "undefined") return DEFAULT_SESSION;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT_SESSION;
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SESSION;
  }
}

/**
 * Beacon Campus pins its demo "now" to a fixed time of day (rather than the
 * real wall clock) so the flagship Jordan/BIO101 story — and every other
 * leave-by calculation — always lines up sensibly regardless of when a demo
 * is actually run. The calendar date itself still tracks real time, so
 * dated events resolve correctly.
 */
function getDemoNow(): Date {
  const d = new Date();
  d.setHours(10, 12, 0, 0);
  return d;
}

function startPointLabel(campus: Campus, startNodeId: string): string {
  const known = START_POINT_OPTIONS.find((o) => o.id === startNodeId);
  if (known) return known.label;
  const building = campus.buildings.find((b) => b.id === startNodeId);
  if (building) return building.name;
  const node = campus.pathNodes.find((n) => n.id === startNodeId);
  return node?.label ?? "your last stop";
}

function loadPersona(): Persona | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem("beacon-campus-persona") as Persona | null) ?? null;
}

const CATEGORY_ROUTES: Record<CategoryId, { screen: Screen; buildingId?: string; directory?: { title: string; category?: BuildingCategory } }> = {
  classes: { screen: "schedule" },
  buildings: { screen: "directory", directory: { title: "All Buildings" } },
  dining: { screen: "directory", directory: { title: "Dining", category: "dining" } },
  parking: { screen: "parking" },
  "student-services": { screen: "services" },
  admissions: { screen: "building", buildingId: "admissions" },
  athletics: { screen: "directory", directory: { title: "Athletics", category: "athletics" } },
  "residence-halls": { screen: "directory", directory: { title: "Residence Halls", category: "residence" } },
  emergency: { screen: "building", buildingId: "public-safety" },
  accessibility: { screen: "accessibility" }
};

export default function BeaconCampusApp() {
  const { campus, hasCustomizations, actions } = useCampusData();
  const location = useLocationPermission();
  const { preferences, expiry, togglePreference, setPreferenceWithDuration } = usePreferences();
  const analytics = useAnalytics();
  const { savedCar, rememberCar, clearCar } = useSavedCar();

  const [hasBegun, setHasBegun] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(loadPersona);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("beacon-campus-onboarding-seen") === "1" : false
  );
  /**
   * The post-Begin "personalize your journey" flow (Needs → Stops →
   * Destination) — a one-time sequence, same persistence pattern as the
   * persona picker above. Tracked separately so returning users never see
   * it again once they've completed or skipped it once.
   */
  const [journeyOnboardingSeen, setJourneyOnboardingSeen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("beacon-campus-journey-onboarding-seen") === "1" : false
  );

  const [session, setSession] = useState<SessionState>(loadSession);
  const [searchQuery, setSearchQuery] = useState("");
  const [now] = useState(getDemoNow);

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const patch = (partial: Partial<SessionState>) => setSession((prev) => ({ ...prev, ...partial }));

  const searchResults = useMemo<SearchResult[]>(() => search(campus, searchQuery), [campus, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) analytics.trackSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const activeBuilding: Building | undefined = session.activeBuildingId ? getBuilding(campus, session.activeBuildingId) : undefined;
  const activeParkingLot = session.activeParkingLotId ? campus.parkingLots.find((p) => p.id === session.activeParkingLotId) : undefined;
  const savedCarLot = savedCar ? campus.parkingLots.find((p) => p.id === savedCar.lotId) : undefined;

  const activeRoutePreferences = useMemo(
    () => effectivePreferences(preferences, session.routeMode),
    [preferences, session.routeMode]
  );

  const destinationIntel = useMemo(() => {
    if (!session.activeDestinationTarget) return null;
    return getDestinationIntel(campus, session.activeDestinationTarget, {
      fromNodeId: session.startNodeId,
      preferences: activeRoutePreferences,
      waypointFacilityIds: session.activeWaypointFacilityIds,
      customStopBuildingIds: session.activeCustomStopBuildingIds,
      now
    });
  }, [campus, session.activeDestinationTarget, session.startNodeId, activeRoutePreferences, session.activeWaypointFacilityIds, session.activeCustomStopBuildingIds, now]);

  const routePlan = useMemo(() => {
    if (!session.activeDestinationTarget) return null;
    return computeRoutePlan(campus, session.activeDestinationTarget, {
      fromNodeId: session.startNodeId,
      preferences: activeRoutePreferences,
      waypointFacilityIds: session.activeWaypointFacilityIds,
      customStopBuildingIds: session.activeCustomStopBuildingIds,
      now
    });
  }, [campus, session.activeDestinationTarget, session.startNodeId, activeRoutePreferences, session.activeWaypointFacilityIds, session.activeCustomStopBuildingIds, now]);

  const onboardingStopLabels = useMemo(() => {
    const facilityLabels = session.activeWaypointFacilityIds
      .map((id) => campus.facilities.find((f) => f.id === id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => FACILITY_CATEGORY_META[f.category].label);
    const customLabels = session.activeCustomStopBuildingIds
      .map((id) => campus.buildings.find((b) => b.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return [...facilityLabels, ...customLabels];
  }, [campus, session.activeWaypointFacilityIds, session.activeCustomStopBuildingIds]);

  const activeEvent: CampusEvent | undefined = session.activeEventId ? campus.events.find((e) => e.id === session.activeEventId) : undefined;

  const { unreadCount, markAllRead } = useNotificationRead(campus);

  useEffect(() => {
    if (session.screen === "alerts") markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.screen]);

  function openBuilding(buildingId: string, screen: Screen = "building") {
    patch({ screen, activeBuildingId: buildingId });
  }

  function goToDestination(target: DestinationTarget) {
    setSearchQuery("");
    analytics.trackDestinationView(target.buildingId);
    patch({
      screen: "map",
      activeTab: "map",
      activeDestinationTarget: target,
      activeBuildingId: target.buildingId,
      activeParkingLotId: null,
      sheetExpanded: false,
      routeMode: "custom",
      activeWaypointFacilityIds: [],
      activeCustomStopBuildingIds: []
    });
  }

  /**
   * Used only by the post-Begin journey onboarding's destination step —
   * unlike goToDestination (used everywhere else), this deliberately keeps
   * whatever stops the traveler already chose on the "needs along the way"
   * screen, so picking a destination doesn't silently discard them.
   */
  function goToDestinationFromOnboarding(target: DestinationTarget) {
    setSearchQuery("");
    analytics.trackDestinationView(target.buildingId);
    completeJourneyOnboarding();
    patch({
      screen: "map",
      activeTab: "map",
      activeDestinationTarget: target,
      activeBuildingId: target.buildingId,
      activeParkingLotId: null,
      sheetExpanded: true,
      routeMode: "custom"
    });
  }

  function selectParkingPin(lotId: string) {
    setSearchQuery("");
    patch({
      screen: "map",
      activeTab: "map",
      activeParkingLotId: lotId,
      activeDestinationTarget: null,
      activeBuildingId: null,
      sheetExpanded: false
    });
  }

  function addWaypoint(facilityId: string) {
    if (session.activeWaypointFacilityIds.includes(facilityId)) return;
    patch({ activeWaypointFacilityIds: [...session.activeWaypointFacilityIds, facilityId] });
  }

  function removeWaypoint(facilityId: string) {
    patch({ activeWaypointFacilityIds: session.activeWaypointFacilityIds.filter((id) => id !== facilityId) });
  }

  function addCustomStop(buildingId: string) {
    if (session.activeCustomStopBuildingIds.includes(buildingId)) return;
    patch({ activeCustomStopBuildingIds: [...session.activeCustomStopBuildingIds, buildingId] });
  }

  function removeCustomStop(buildingId: string) {
    patch({ activeCustomStopBuildingIds: session.activeCustomStopBuildingIds.filter((id) => id !== buildingId) });
  }

  /** Facility waypoints are visited in array order, so reordering the array genuinely reorders the route — not cosmetic. */
  function reorderWaypoint(facilityId: string, direction: -1 | 1) {
    const ids = [...session.activeWaypointFacilityIds];
    const index = ids.indexOf(facilityId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    patch({ activeWaypointFacilityIds: ids });
  }

  function reorderCustomStop(buildingId: string, direction: -1 | 1) {
    const ids = [...session.activeCustomStopBuildingIds];
    const index = ids.indexOf(buildingId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    patch({ activeCustomStopBuildingIds: ids });
  }

  /**
   * Adding a stop mid-navigation recalculates from where the traveler
   * currently is, not the original start point, and preserves the final
   * destination. Any waypoint already passed is dropped — routing back to it
   * would be wrong — so only the newly chosen stop remains ahead.
   */
  function addWaypointDuringNavigation(facilityId: string) {
    const currentStep = routePlan?.steps[session.navStepIndex];
    const currentNodeId = currentStep?.locationId ?? session.startNodeId;
    patch({
      startNodeId: currentNodeId,
      activeWaypointFacilityIds: [facilityId],
      navStepIndex: 0
    });
  }

  function closeSheet() {
    patch({
      activeDestinationTarget: null,
      activeBuildingId: null,
      activeParkingLotId: null,
      sheetExpanded: false,
      activeWaypointFacilityIds: [],
      activeCustomStopBuildingIds: []
    });
  }

  function handleSelectSearchResult(result: SearchResult) {
    if (result.kind === "event") {
      patch({ screen: "event-detail", activeEventId: result.id });
      setSearchQuery("");
      return;
    }
    if (result.kind === "parking") {
      selectParkingPin(result.id);
      return;
    }
    const target = destinationTargetFromSearchResult(campus, result);
    if (target) goToDestination(target);
  }

  function handleSelectOnboardingDestination(result: SearchResult) {
    if (result.kind === "event") {
      completeJourneyOnboarding();
      patch({ screen: "event-detail", activeEventId: result.id });
      setSearchQuery("");
      return;
    }
    if (result.kind === "parking") {
      completeJourneyOnboarding();
      selectParkingPin(result.id);
      return;
    }
    const target = destinationTargetFromSearchResult(campus, result);
    if (target) goToDestinationFromOnboarding(target);
  }

  function handleSelectCategory(id: CategoryId) {
    const route = CATEGORY_ROUTES[id];
    patch({
      screen: route.screen,
      activeBuildingId: route.buildingId ?? session.activeBuildingId,
      directoryFilter: route.directory ?? null
    });
  }

  function handleFindRestroom() {
    const results = search(campus, "restroom", 1);
    if (results.length === 0) return;
    const target = destinationTargetFromSearchResult(campus, results[0]);
    if (target) goToDestination(target);
  }

  function startRoute() {
    pulse(15);
    patch({ screen: "navigation", navStepIndex: 0 });
  }

  function arrive() {
    pulse([15, 60, 15]);
    patch({ screen: "arrival" });
  }

  function doneArrival() {
    patch({
      screen: "map",
      activeTab: "map",
      startNodeId: session.activeDestinationTarget?.buildingId ?? session.startNodeId,
      activeDestinationTarget: null,
      activeParkingLotId: null,
      sheetExpanded: false,
      activeWaypointFacilityIds: []
    });
  }

  function handleStartClassNav(entry: ClassScheduleEntry) {
    goToDestination({ buildingId: entry.buildingId, title: `${entry.courseName} (${entry.course})`, roomNumber: entry.roomNumber });
  }

  function handleSelectEvent(event: CampusEvent) {
    patch({ screen: "event-detail", activeEventId: event.id });
  }

  function handleNavigateEvent() {
    if (!activeEvent) return;
    goToDestination({ buildingId: activeEvent.venueBuildingId, title: activeEvent.name, eligibility: "visitor" });
  }

  function handlePersonaSelect(p: Persona) {
    setPersona(p);
    window.localStorage.setItem("beacon-campus-persona", p);
    window.localStorage.setItem("beacon-campus-onboarding-seen", "1");
    setOnboardingSeen(true);
    if (!journeyOnboardingSeen) patch({ screen: "onboarding-needs" });
  }

  function skipOnboarding() {
    window.localStorage.setItem("beacon-campus-onboarding-seen", "1");
    setOnboardingSeen(true);
    if (!journeyOnboardingSeen) patch({ screen: "onboarding-needs" });
  }

  /** Marks the post-Begin personalization flow as seen for good — called whether the traveler finishes it or skips out partway. */
  function completeJourneyOnboarding() {
    window.localStorage.setItem("beacon-campus-journey-onboarding-seen", "1");
    setJourneyOnboardingSeen(true);
  }

  function handleWalkToCar() {
    if (savedCar) patch({ screen: "return-to-car" });
  }

  function handleForgetCar() {
    clearCar();
    if (session.screen === "return-to-car") patch({ screen: "map", activeTab: "map" });
  }

  if (!hasBegun) {
    return (
      <PhoneFrame>
        <div className="flex h-full w-full flex-1 flex-col">
          <LandingScreen onBegin={() => setHasBegun(true)} />
        </div>
      </PhoneFrame>
    );
  }

  if (!onboardingSeen) {
    return (
      <PhoneFrame>
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto">
          <Onboarding onSelect={handlePersonaSelect} onSkip={skipOnboarding} />
        </div>
      </PhoneFrame>
    );
  }

  const isJourneyOnboarding = (["onboarding-needs", "onboarding-stops", "onboarding-destination"] as Screen[]).includes(session.screen);
  const hideTabs = (["navigation", "arrival", "admin", "return-to-car"] as Screen[]).includes(session.screen) || isJourneyOnboarding;
  const isMap = session.screen === "map";
  const showBack = !PRIMARY_TABS.includes(session.screen);

  return (
    <PhoneFrame wide={session.screen === "admin"}>
    <MobileAppShell
      activeTab={session.activeTab}
      onTabChange={(tab: TabId) => {
        if (tab === "map") patch({ screen: "map", activeTab: tab });
        else if (tab === "myday") patch({ screen: "schedule", activeTab: tab });
        else if (tab === "explore") patch({ screen: "explore", activeTab: tab });
        else if (tab === "alerts") patch({ screen: "alerts", activeTab: tab });
        else patch({ screen: "profile", activeTab: tab });
      }}
      alertCount={unreadCount}
      hideTabs={hideTabs}
      hideHeader={isMap || isJourneyOnboarding}
      fullBleed={isMap}
      title={screenTitle(session.screen)}
      subtitle={campus.universityName}
      onBack={
        showBack
          ? () =>
              // Arrival's header Back must end the journey the same way "Done"
              // does — otherwise leaving via the top-left chevron instead of
              // the primary button would land on Map with the just-completed
              // destination/route still active, contradicting the "arrival
              // ends the session" guarantee "Done" already provides.
              session.screen === "arrival" ? doneArrival() : patch({ screen: previousScreenFor(session.screen), activeTab: "map" })
          : undefined
      }
      onAssistant={() => patch({ screen: "assistant" })}
      onAdmin={() => patch({ screen: "admin" })}
    >
      {/* Map's wrapper uses `absolute inset-0` rather than `h-full`: `h-full` is a
          percentage height, and percentage heights can fail to resolve against
          this shell's flex-grow-derived `main` in this environment (verified via
          isolated reproduction — an explicit length always resolves, `height:100%`
          does not) — `absolute inset-0` fills `main` (already `position: relative`)
          without depending on percentage resolution at all. */}
      <div key={session.screen} className={isMap ? "absolute inset-0" : "animate-screen-in"}>
      {session.screen === "map" && (
        <MapScreen
          campus={campus}
          startNodeId={session.startNodeId}
          startPointLabel={startPointLabel(campus, session.startNodeId)}
          onChangeStartPoint={() => patch({ screen: "start-point" })}
          preferences={preferences}
          effectivePreferences={activeRoutePreferences}
          routeMode={session.routeMode}
          onSelectRouteMode={(mode) => patch({ routeMode: mode })}
          onToggleAccessibleRoute={() => {
            togglePreference("stepFree");
            analytics.trackPreferenceToggle("stepFree");
          }}
          onFindRestroom={handleFindRestroom}
          onOpenParkingList={() => patch({ screen: "parking" })}
          onOpenEmergency={() => patch({ screen: "assistance" })}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
          savedCar={savedCar}
          savedCarLot={savedCarLot}
          onOpenReturnToCar={handleWalkToCar}
          destinationIntel={destinationIntel}
          activeWaypoints={routePlan?.waypoints ?? []}
          onAddWaypoint={addWaypoint}
          onRemoveWaypoint={removeWaypoint}
          sheetExpanded={session.sheetExpanded}
          onToggleSheetExpanded={() => patch({ sheetExpanded: !session.sheetExpanded })}
          onCloseSheet={closeSheet}
          onSelectBuilding={(id) => goToDestination({ buildingId: id })}
          onStartRoute={startRoute}
          onViewBuildingDetails={() => destinationIntel && openBuilding(destinationIntel.buildingId)}
          activeParkingLot={activeParkingLot}
          onSelectParkingPin={selectParkingPin}
          onRememberCarHere={(lotId) => rememberCar(lotId)}
          locationPrompt={
            location.status === "unknown" && !session.locationPromptDismissed
              ? {
                  onAllow: () => {
                    location.requestLocation();
                    patch({ locationPromptDismissed: true });
                  },
                  onDecline: () => {
                    location.declineLocation();
                    patch({ locationPromptDismissed: true });
                  }
                }
              : null
          }
        />
      )}

      {session.screen === "start-point" && (
        <StartPointScreen
          currentStartNodeId={session.startNodeId}
          onSelect={(nodeId) => patch({ screen: "map", activeTab: "map", startNodeId: nodeId })}
        />
      )}

      {session.screen === "schedule" && (
        <ScheduleScreen
          campus={campus}
          now={now}
          startNodeId={session.startNodeId}
          preferences={preferences}
          onNavigateClass={handleStartClassNav}
        />
      )}

      {session.screen === "explore" && (
        <ExploreScreen campus={campus} onSelectCategory={handleSelectCategory} onNavigate={(screen) => patch({ screen })} />
      )}

      {session.screen === "alerts" && <AlertsCenter campus={campus} onSelectBuilding={(id) => openBuilding(id)} />}

      {session.screen === "profile" && (
        <ProfileScreen
          campus={campus}
          persona={persona}
          startPointLabel={startPointLabel(campus, session.startNodeId)}
          onChangeStartPoint={() => patch({ screen: "start-point" })}
          savedCar={savedCar}
          savedCarLot={savedCarLot}
          onWalkToCar={handleWalkToCar}
          onForgetCar={handleForgetCar}
          onOpenAccessibility={() => patch({ screen: "accessibility" })}
          onOpenAssistance={() => patch({ screen: "assistance" })}
          onOpenAdmin={() => patch({ screen: "admin" })}
          onOpenHelp={() => patch({ screen: "help" })}
        />
      )}

      {session.screen === "return-to-car" &&
        (savedCar ? (
          <ReturnToCarScreen
            campus={campus}
            lotId={savedCar.lotId}
            note={savedCar.note}
            startNodeId={session.startNodeId}
            preferences={preferences}
            onDone={() => patch({ screen: "map", activeTab: "map" })}
            onForgetCar={handleForgetCar}
          />
        ) : (
          <ErrorState title="No car saved" message="Remember My Car from a parking lot on the map first." />
        ))}

      {session.screen === "navigation" &&
        (routePlan ? (
          <NavigationScreen
            plan={routePlan}
            campus={campus}
            stepIndex={session.navStepIndex}
            audioGuidance={preferences.audioGuidance}
            effectivePreferences={activeRoutePreferences}
            routeMode={session.routeMode}
            onNextStep={() => patch({ navStepIndex: session.navStepIndex + 1 })}
            onPrevStep={() => patch({ navStepIndex: Math.max(0, session.navStepIndex - 1) })}
            onArrive={arrive}
            onAddStop={addWaypointDuringNavigation}
            onRequestAssistance={() => patch({ screen: "assistance" })}
          />
        ) : (
          <ErrorState title="Route unavailable" message="We couldn't build a route to this destination right now." />
        ))}

      {session.screen === "arrival" &&
        (routePlan ? (
          <ArrivalScreen
            plan={routePlan}
            routeMode={session.routeMode}
            effectivePreferences={activeRoutePreferences}
            audioGuidance={preferences.audioGuidance}
            hasSavedCar={!!savedCar}
            onDone={doneArrival}
            onViewBuilding={() => openBuilding(routePlan.destination.buildingId)}
            onReturnToCar={handleWalkToCar}
          />
        ) : (
          <ErrorState title="Something went wrong" message="We lost track of your route." />
        ))}

      {session.screen === "building" &&
        (activeBuilding ? (
          <BuildingDetailScreen
            campus={campus}
            building={activeBuilding}
            now={now}
            onNavigate={() => goToDestination({ buildingId: activeBuilding.id })}
            onViewParking={() => patch({ screen: "parking" })}
          />
        ) : (
          <ErrorState title="Building not found" message="This building isn't in the demo dataset." />
        ))}

      {session.screen === "directory" && (
        <DirectoryScreen
          campus={campus}
          now={now}
          title={session.directoryFilter?.title ?? "Buildings"}
          category={session.directoryFilter?.category}
          onSelectBuilding={(b) => openBuilding(b.id)}
        />
      )}

      {session.screen === "parking" && (
        <ParkingScreen campus={campus} savedCarLotId={savedCar?.lotId} onRememberCarHere={(lotId) => rememberCar(lotId)} />
      )}

      {session.screen === "services" && (
        <ServicesDirectory campus={campus} onSelectService={(s) => goToDestination({ buildingId: s.buildingId, title: s.name, eligibility: "visitor" })} />
      )}

      {session.screen === "events" && <EventsScreen campus={campus} now={now} onSelectEvent={handleSelectEvent} />}

      {session.screen === "event-detail" &&
        (activeEvent ? (
          <EventDetailScreen campus={campus} event={activeEvent} onNavigate={handleNavigateEvent} />
        ) : (
          <ErrorState title="Event not found" message="This event may have ended or been removed." />
        ))}

      {session.screen === "orientation" && <OrientationModeScreen campus={campus} onNavigateToBuilding={(id) => goToDestination({ buildingId: id })} />}

      {session.screen === "tour" && <CampusTourScreen campus={campus} onNavigateToBuilding={(id) => goToDestination({ buildingId: id })} />}

      {session.screen === "assistant" && <QuickQuestions campus={campus} />}

      {session.screen === "assistance" && (
        <AssistanceScreen
          onOpenAccessibility={() => patch({ screen: "accessibility" })}
          onSearchDestination={() => patch({ screen: "map", activeTab: "map" })}
        />
      )}

      {session.screen === "accessibility" && (
        <AccessibilityPanel
          campus={campus}
          preferences={preferences}
          expiry={expiry}
          onTogglePreference={(key) => {
            togglePreference(key);
            analytics.trackPreferenceToggle(key);
          }}
          onSetDuration={(key, durationMs) => setPreferenceWithDuration(key, true, durationMs)}
        />
      )}

      {session.screen === "help" && <HelpScreen campus={campus} />}

      {session.screen === "admin" && (
        <AdminDashboard campus={campus} actions={actions} hasCustomizations={hasCustomizations} analytics={analytics} />
      )}

      {session.screen === "onboarding-needs" && (
        <JourneyNeedsScreen
          preferences={preferences}
          onTogglePreference={(key) => {
            togglePreference(key);
            analytics.trackPreferenceToggle(key);
          }}
          onContinue={() => patch({ screen: "onboarding-stops" })}
          onSkip={() => patch({ screen: "onboarding-stops" })}
        />
      )}

      {session.screen === "onboarding-stops" && (
        <JourneyStopsScreen
          campus={campus}
          fromNodeId={session.startNodeId}
          preferences={preferences}
          activeWaypointFacilityIds={session.activeWaypointFacilityIds}
          activeCustomStopBuildingIds={session.activeCustomStopBuildingIds}
          onAddWaypoint={addWaypoint}
          onRemoveWaypoint={removeWaypoint}
          onReorderWaypoint={reorderWaypoint}
          onAddCustomStop={addCustomStop}
          onRemoveCustomStop={removeCustomStop}
          onReorderCustomStop={reorderCustomStop}
          onContinue={() => patch({ screen: "onboarding-destination" })}
          onSkip={() => patch({ screen: "onboarding-destination" })}
          onBack={() => patch({ screen: "onboarding-needs" })}
        />
      )}

      {session.screen === "onboarding-destination" && (
        <JourneyDestinationScreen
          campus={campus}
          preferences={preferences}
          stopLabels={onboardingStopLabels}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onSelectDestination={handleSelectOnboardingDestination}
          onSkip={() => {
            completeJourneyOnboarding();
            patch({ screen: "schedule", activeTab: "myday" });
          }}
          onBack={() => patch({ screen: "onboarding-stops" })}
        />
      )}
      </div>
    </MobileAppShell>
    </PhoneFrame>
  );
}

function previousScreenFor(screen: Screen): Screen {
  const backMap: Partial<Record<Screen, Screen>> = {
    navigation: "map",
    arrival: "map",
    building: "map",
    directory: "map",
    "start-point": "map",
    parking: "map",
    services: "map",
    events: "explore",
    "event-detail": "events",
    orientation: "explore",
    tour: "explore",
    assistant: "map",
    assistance: "map",
    accessibility: "explore",
    help: "explore",
    admin: "map",
    "return-to-car": "map"
  };
  return backMap[screen] ?? "map";
}

function screenTitle(screen: Screen): string | undefined {
  const titles: Partial<Record<Screen, string>> = {
    "start-point": "Starting Point",
    navigation: "Directions",
    arrival: "Arrival",
    parking: "Parking",
    services: "Services",
    events: "Events",
    "event-detail": "Event",
    orientation: "Orientation",
    tour: "Campus Tour",
    assistant: "Beacon Assistant",
    assistance: "Assistance",
    accessibility: "Accessibility",
    help: "Help",
    admin: "Admin Preview",
    "return-to-car": "My Car"
  };
  return titles[screen];
}
