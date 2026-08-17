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
import { effectivePreferences, type Building, type BuildingCategory, type Campus, type CampusEvent, type ClassScheduleEntry, type Persona, type RouteMode, type SearchResult } from "./types/campus";

import { MobileAppShell } from "./components/shell/MobileAppShell";
import type { TabId } from "./components/shell/TabNavigator";
import { LandingScreen } from "./components/LandingScreen";
import { Onboarding } from "./components/Onboarding";
import { MapScreen } from "./components/MapScreen";
import { RouteModeScreen } from "./components/RouteModeScreen";
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
import { HelpScreen } from "./components/HelpScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ErrorState } from "./components/ui/Primitives";

type Screen =
  | "map"
  | "schedule"
  | "explore"
  | "alerts"
  | "profile"
  | "route-options"
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
  | "accessibility"
  | "help"
  | "admin"
  | "return-to-car";

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
  activeEventId: string | null;
  navStepIndex: number;
  directoryFilter: { title: string; category?: BuildingCategory } | null;
  locationPromptDismissed: boolean;
}

const SESSION_KEY = "beacon-campus-session";

const DEFAULT_SESSION: SessionState = {
  screen: "map",
  activeTab: "map",
  startNodeId: DEFAULT_START_NODE_ID,
  activeBuildingId: null,
  activeDestinationTarget: null,
  activeParkingLotId: null,
  sheetExpanded: false,
  routeMode: "fastest",
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
      now
    });
  }, [campus, session.activeDestinationTarget, session.startNodeId, activeRoutePreferences, now]);

  const routePlan = useMemo(() => {
    if (!session.activeDestinationTarget) return null;
    return computeRoutePlan(campus, session.activeDestinationTarget, {
      fromNodeId: session.startNodeId,
      preferences: activeRoutePreferences,
      now
    });
  }, [campus, session.activeDestinationTarget, session.startNodeId, activeRoutePreferences, now]);

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
      routeMode: "fastest"
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

  function closeSheet() {
    patch({ activeDestinationTarget: null, activeBuildingId: null, activeParkingLotId: null, sheetExpanded: false });
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
    patch({ screen: "route-options" });
  }

  function confirmRouteMode() {
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
      sheetExpanded: false
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
  }

  function skipOnboarding() {
    window.localStorage.setItem("beacon-campus-onboarding-seen", "1");
    setOnboardingSeen(true);
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
      <div className="flex h-full w-full flex-1 flex-col">
        <LandingScreen onBegin={() => setHasBegun(true)} />
      </div>
    );
  }

  if (!onboardingSeen) {
    return (
      <div className="flex h-full w-full flex-1 flex-col overflow-y-auto">
        <Onboarding onSelect={handlePersonaSelect} onSkip={skipOnboarding} />
      </div>
    );
  }

  const hideTabs = (["route-options", "navigation", "arrival", "admin", "return-to-car"] as Screen[]).includes(session.screen);
  const isMap = session.screen === "map";
  const showBack = !PRIMARY_TABS.includes(session.screen);

  return (
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
      hideHeader={isMap}
      fullBleed={isMap}
      title={screenTitle(session.screen)}
      subtitle={campus.universityName}
      onBack={showBack ? () => patch({ screen: previousScreenFor(session.screen), activeTab: "map" }) : undefined}
      onAssistant={() => patch({ screen: "assistant" })}
      onAdmin={() => patch({ screen: "admin" })}
    >
      <div key={session.screen} className={isMap ? "h-full" : "animate-screen-in"}>
      {session.screen === "map" && (
        <MapScreen
          campus={campus}
          startNodeId={session.startNodeId}
          startPointLabel={startPointLabel(campus, session.startNodeId)}
          onChangeStartPoint={() => patch({ screen: "start-point" })}
          preferences={preferences}
          onToggleAccessibleRoute={() => {
            togglePreference("stepFree");
            analytics.trackPreferenceToggle("stepFree");
          }}
          onFindRestroom={handleFindRestroom}
          onOpenParkingList={() => patch({ screen: "parking" })}
          onOpenEmergency={() => openBuilding("public-safety")}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
          savedCar={savedCar}
          savedCarLot={savedCarLot}
          onOpenReturnToCar={handleWalkToCar}
          destinationIntel={destinationIntel}
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

      {session.screen === "route-options" &&
        (session.activeDestinationTarget ? (
          <RouteModeScreen
            campus={campus}
            target={session.activeDestinationTarget}
            startNodeId={session.startNodeId}
            basePreferences={preferences}
            now={now}
            selectedMode={session.routeMode}
            onSelectMode={(mode) => patch({ routeMode: mode })}
            onTogglePreference={togglePreference}
            onContinue={confirmRouteMode}
          />
        ) : (
          <ErrorState title="Route unavailable" message="We couldn't find a route to this destination right now." />
        ))}

      {session.screen === "navigation" &&
        (routePlan ? (
          <NavigationScreen
            plan={routePlan}
            campus={campus}
            stepIndex={session.navStepIndex}
            audioGuidance={preferences.audioGuidance}
            onNextStep={() => patch({ navStepIndex: session.navStepIndex + 1 })}
            onPrevStep={() => patch({ navStepIndex: Math.max(0, session.navStepIndex - 1) })}
            onArrive={arrive}
          />
        ) : (
          <ErrorState title="Route unavailable" message="We couldn't build a route to this destination right now." />
        ))}

      {session.screen === "arrival" &&
        (routePlan ? (
          <ArrivalScreen
            plan={routePlan}
            audioGuidance={preferences.audioGuidance}
            onDone={doneArrival}
            onViewBuilding={() => openBuilding(routePlan.destination.buildingId)}
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
      </div>
    </MobileAppShell>
  );
}

function previousScreenFor(screen: Screen): Screen {
  const backMap: Partial<Record<Screen, Screen>> = {
    "route-options": "map",
    navigation: "route-options",
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
    "route-options": "Choose Route",
    navigation: "Directions",
    arrival: "Arrival",
    parking: "Parking",
    services: "Services",
    events: "Events",
    "event-detail": "Event",
    orientation: "Orientation",
    tour: "Campus Tour",
    assistant: "Beacon Assistant",
    accessibility: "Accessibility",
    help: "Help",
    admin: "Admin Preview",
    "return-to-car": "My Car"
  };
  return titles[screen];
}
