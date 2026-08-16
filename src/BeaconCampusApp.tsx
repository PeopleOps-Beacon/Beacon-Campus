import { useEffect, useMemo, useState } from "react";
import { DEFAULT_START_NODE_ID } from "./data/beaconUniversity";
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
import type { DestinationTarget } from "./lib/campusEngine";
import { effectivePreferences, type Building, type BuildingCategory, type CampusEvent, type ClassScheduleEntry, type Persona, type RouteMode, type SearchResult } from "./types/campus";

import { MobileAppShell } from "./components/shell/MobileAppShell";
import type { TabId } from "./components/shell/TabNavigator";
import { Onboarding } from "./components/Onboarding";
import { LocationPermissionPrompt } from "./components/LocationPermissionPrompt";
import { HomeScreen, type CategoryId } from "./components/HomeScreen";
import { DestinationCard } from "./components/DestinationCard";
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
import { HelpScreen } from "./components/HelpScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { Button, Card, ErrorState, SectionHeading } from "./components/ui/Primitives";
import {
  Accessibility as AccessibilityIcon,
  Compass,
  HelpCircle,
  MapPinned,
  Sparkles,
  Users
} from "lucide-react";

type Screen =
  | "home"
  | "schedule"
  | "alerts"
  | "more"
  | "destination"
  | "route-options"
  | "navigation"
  | "arrival"
  | "building"
  | "directory"
  | "parking"
  | "services"
  | "events"
  | "event-detail"
  | "orientation"
  | "tour"
  | "assistant"
  | "accessibility"
  | "help"
  | "admin";

interface SessionState {
  screen: Screen;
  activeTab: TabId;
  startNodeId: string;
  activeBuildingId: string | null;
  activeDestinationTarget: DestinationTarget | null;
  routeMode: RouteMode;
  activeEventId: string | null;
  navStepIndex: number;
  directoryFilter: { title: string; category?: BuildingCategory } | null;
  locationPromptDismissed: boolean;
}

const SESSION_KEY = "beacon-campus-session";

const DEFAULT_SESSION: SessionState = {
  screen: "home",
  activeTab: "home",
  startNodeId: DEFAULT_START_NODE_ID,
  activeBuildingId: null,
  activeDestinationTarget: null,
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
 * dated events resolve correctly. See the spec's guidance to mock time
 * awareness where needed for the MVP.
 */
function getDemoNow(): Date {
  const d = new Date();
  d.setHours(10, 12, 0, 0);
  return d;
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
  const { preferences, togglePreference } = usePreferences();
  const analytics = useAnalytics();

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

  const routePathIds = routePlan?.path ?? [];

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
    patch({ screen: "destination", activeDestinationTarget: target, activeBuildingId: target.buildingId, routeMode: "fastest" });
  }

  function handleSelectSearchResult(result: SearchResult) {
    if (result.kind === "event") {
      patch({ screen: "event-detail", activeEventId: result.id });
      setSearchQuery("");
      return;
    }
    if (result.kind === "parking") {
      patch({ screen: "parking" });
      setSearchQuery("");
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

  function startRoute() {
    patch({ screen: "route-options" });
  }

  function confirmRouteMode() {
    patch({ screen: "navigation", navStepIndex: 0 });
  }

  function arrive() {
    patch({ screen: "arrival" });
  }

  function doneArrival() {
    patch({
      screen: "home",
      activeTab: "home",
      startNodeId: session.activeDestinationTarget?.buildingId ?? session.startNodeId,
      activeDestinationTarget: null
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

  if (!onboardingSeen) {
    return (
      <div className="mx-auto h-full max-w-[520px] bg-campus-ink">
        <Onboarding onSelect={handlePersonaSelect} onSkip={skipOnboarding} />
      </div>
    );
  }

  const hideTabs = (["destination", "route-options", "navigation", "arrival", "admin"] as Screen[]).includes(session.screen);
  const showBack = session.screen !== "home" && session.screen !== "more";

  return (
    <MobileAppShell
      activeTab={session.activeTab}
      onTabChange={(tab: TabId) => {
        if (tab === "home" || tab === "search") patch({ screen: "home", activeTab: tab });
        else if (tab === "schedule") patch({ screen: "schedule", activeTab: tab });
        else if (tab === "alerts") patch({ screen: "alerts", activeTab: tab });
        else patch({ screen: "more", activeTab: tab });
      }}
      alertCount={unreadCount}
      hideTabs={hideTabs}
      title={screenTitle(session.screen)}
      onBack={showBack ? () => patch({ screen: previousScreenFor(session.screen), activeTab: "home" }) : undefined}
      onAssistant={() => patch({ screen: "assistant" })}
      onAdmin={() => patch({ screen: "admin" })}
    >
      {location.status === "unknown" && !session.locationPromptDismissed && session.screen === "home" && (
        <div className="mb-4">
          <LocationPermissionPrompt
            onAllow={() => {
              location.requestLocation();
              patch({ locationPromptDismissed: true });
            }}
            onDecline={() => {
              location.declineLocation();
              patch({ locationPromptDismissed: true });
            }}
          />
        </div>
      )}

      {session.screen === "home" && (
        <HomeScreen
          campus={campus}
          persona={persona}
          now={now}
          startNodeId={session.startNodeId}
          preferences={preferences}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
          onSelectCategory={handleSelectCategory}
          onSelectBuilding={(id) => openBuilding(id)}
          onStartClassNav={handleStartClassNav}
          onOpenAlerts={() => patch({ screen: "alerts", activeTab: "alerts" })}
          onOpenEvent={(eventId) => patch({ screen: "event-detail", activeEventId: eventId })}
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

      {session.screen === "alerts" && <AlertsCenter campus={campus} onSelectBuilding={(id) => openBuilding(id)} />}

      {session.screen === "more" && <MoreMenu onNavigate={(screen) => patch({ screen })} />}

      {session.screen === "destination" &&
        (destinationIntel ? (
          <DestinationCard
            intel={destinationIntel}
            campus={campus}
            startNodeId={session.startNodeId}
            onStartRoute={startRoute}
            onViewBuilding={() => openBuilding(destinationIntel.buildingId)}
            onViewParking={() => patch({ screen: "parking" })}
          />
        ) : (
          <ErrorState title="Route unavailable" message="We couldn't find a route to this destination right now." />
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
            routePath={routePathIds}
            startNodeId={session.startNodeId}
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

      {session.screen === "parking" && <ParkingScreen campus={campus} />}

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
          onTogglePreference={(key) => {
            togglePreference(key);
            analytics.trackPreferenceToggle(key);
          }}
        />
      )}

      {session.screen === "help" && <HelpScreen campus={campus} />}

      {session.screen === "admin" && (
        <AdminDashboard campus={campus} actions={actions} hasCustomizations={hasCustomizations} analytics={analytics} />
      )}
    </MobileAppShell>
  );
}

function previousScreenFor(screen: Screen): Screen {
  const backMap: Partial<Record<Screen, Screen>> = {
    destination: "home",
    "route-options": "destination",
    navigation: "route-options",
    arrival: "home",
    building: "home",
    directory: "home",
    parking: "home",
    services: "home",
    events: "more",
    "event-detail": "events",
    orientation: "more",
    tour: "more",
    assistant: "home",
    accessibility: "more",
    help: "more",
    admin: "home"
  };
  return backMap[screen] ?? "home";
}

function screenTitle(screen: Screen): string | undefined {
  const titles: Partial<Record<Screen, string>> = {
    schedule: "Schedule",
    alerts: "Alerts",
    more: "More",
    destination: "Destination",
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
    admin: "Admin Preview"
  };
  return titles[screen];
}

function MoreMenu({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const items: { screen: Screen; label: string; description: string; icon: typeof Compass }[] = [
    { screen: "events", label: "Events", description: "Campus events and arrival guidance", icon: Sparkles },
    { screen: "orientation", label: "Orientation Mode", description: "New student welcome & first-day checklist", icon: Users },
    { screen: "tour", label: "Campus Tour", description: "Self-guided walking tour", icon: MapPinned },
    { screen: "accessibility", label: "Accessibility", description: "Step-free routing & accessible entrances", icon: AccessibilityIcon },
    { screen: "assistant", label: "Ask Beacon", description: "Quick answers to common questions", icon: Compass },
    { screen: "help", label: "Help", description: "How to use Beacon Campus", icon: HelpCircle }
  ];
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="More" />
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.screen} type="button" onClick={() => onNavigate(item.screen)} className="text-left">
              <Card className="flex items-center gap-3">
                <Icon size={18} className="text-campus-gold" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/55">{item.description}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
      <Button tone="ghost" onClick={() => onNavigate("home")} className="text-white/50">
        Back to Home
      </Button>
    </div>
  );
}
