// Core data model for Beacon Campus. Designed so a real university's data could
// replace BEACON_UNIVERSITY (see src/data/beaconUniversity.ts) without changing
// application code.

// ---------------------------------------------------------------------------
// Data provenance — structural, not just a code comment. Every building and
// parking lot declares where its information came from, so the UI can never
// silently present fabricated specifics as verified campus fact.
// ---------------------------------------------------------------------------

export type DataStatus =
  /** Directly sourced from an official/authoritative reference this session (see `source`). */
  | "verified"
  /** Illustrative placeholder — building/landmark may be real, but this record's specifics (hours, room numbers, exact entrance sides, coordinates, etc.) are not sourced from an authoritative record. */
  | "development-fixture"
  /** Computed/estimated from other data (e.g. walk times from the simulated path graph) rather than sourced directly. */
  | "derived";

export interface DataProvenance {
  status: DataStatus;
  /** Citation for verified data — a URL or named source. */
  source?: string;
  /** Human-readable caveat, e.g. "Building is real; hours and room numbers are illustrative." */
  note?: string;
}

export interface CitedSource {
  label: string;
  url: string;
  retrievedNote?: string;
}

export type Persona =
  | "student"
  | "new-student"
  | "prospective-student"
  | "parent"
  | "visitor"
  | "faculty-staff";

export type Point = { x: number; y: number };

export interface Entrance {
  id: string;
  label: string;
  side: "north" | "south" | "east" | "west";
  accessible: boolean;
  automaticDoor: boolean;
  point: Point;
  notes?: string;
}

export interface Room {
  id: string;
  number: string;
  name?: string;
  floor: number;
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
  abbreviation?: string;
  floor: number;
  roomId?: string;
  hoursNote?: string;
  appointmentRequired?: boolean;
  phone?: string;
}

export type AmenityType =
  | "restroom"
  | "accessible-restroom"
  | "service-animal-relief"
  | "lactation-room"
  | "quiet-space"
  | "elevator"
  | "stairs"
  | "emergency-exit"
  | "coffee"
  | "dining"
  | "study-space"
  | "vending"
  | "atm"
  | "printing";

export interface Amenity {
  id: string;
  type: AmenityType;
  label: string;
  floor: number;
}

export interface BuildingHours {
  opens: string; // "07:00"
  closes: string; // "22:00"
  note?: string;
}

export type BuildingCategory =
  | "academic"
  | "residence"
  | "dining"
  | "student-life"
  | "administration"
  | "athletics"
  | "library"
  | "health-safety"
  | "arts";

export interface Building {
  id: string;
  name: string;
  abbreviation: string;
  aliases: string[];
  category: BuildingCategory;
  description: string;
  address: string;
  point: Point;
  floors: number;
  primaryEntranceId: string;
  accessibleEntranceId: string;
  entrances: Entrance[];
  rooms: Room[];
  departments: Department[];
  amenities: Amenity[];
  hours: BuildingHours;
  nearbyParkingIds: string[];
  landmarkNote?: string;
  photoTone: "stone" | "brick" | "glass" | "green";
  /** A real photo of the actual building, when one is available and confidently matched. Falls back to the illustration when absent. */
  photo?: BuildingPhoto;
  /**
   * General, non-building-specific life-safety guidance (e.g. "don't use elevators
   * during a fire"). Deliberately generic and disclaimer-heavy — Beacon has no
   * verified building-specific evacuation routes or assembly points, and must
   * never imply otherwise. Always defer to official campus alerts and staff.
   */
  safetyGuidance?: string;
  /** Is this building real, and how much of this record is sourced vs. illustrative? */
  provenance: DataProvenance;
}

export interface BuildingPhoto {
  /** Imported asset path (Vite resolves this to a hashed URL at build time). */
  src: string;
  credit: string;
  sourceUrl: string;
}

export type ParkingEligibility = "visitor" | "student" | "faculty";

export interface ParkingLot {
  id: string;
  name: string;
  point: Point;
  eligibility: ParkingEligibility[];
  permitRequired: boolean;
  freeMinutes?: number;
  accessibleSpaces: number;
  notes?: string;
  walkTimeMinutesTo: Record<string, number>; // buildingId -> minutes
  closed?: boolean;
  closureReason?: string;
  provenance: DataProvenance;
}

export interface WalkingPathNode {
  id: string;
  label: string;
  point: Point;
  isLandmark?: boolean;
}

export interface WalkingPathEdge {
  from: string;
  to: string;
  minutes: number;
  accessible: boolean;
  outdoor: boolean;
  /** 1 (quiet) - 5 (very crowded). Only set on edges where it meaningfully varies. */
  crowdLevel?: number;
  /** 1 (quiet) - 5 (very loud). Only set on edges where it meaningfully varies. */
  noiseLevel?: number;
  /** Flags a calm, low-stimulation stretch (e.g. a garden path) for the calmRoute preference. */
  lowStimulation?: boolean;
  /**
   * 1 (flat) - 5 (steep). Illustrative estimate based on real, documented campus
   * topology, not survey-grade elevation data — see the edge authoring comment
   * in beaconUniversity.ts and the caveat surfaced next to any exertion score.
   */
  elevationChange?: number;
  /** Unpaved surfaces (gravel, grass) are harder going for wheels, canes, and casters even when technically step-free. */
  surface?: "paved" | "unpaved";
}

export type AlertSeverity = "info" | "advisory" | "warning" | "emergency";

export interface CampusAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedBuildingIds: string[];
  affectedEntranceIds?: string[];
  startsAt: string; // ISO
  endsAt?: string; // ISO
  active: boolean;
  addedWalkMinutes?: number;
  substituteEntranceId?: string;
  affectedParkingIds?: string[];
  /** Links this alert to a specific Elevator record it's currently affecting — lets routing react to the outage, not just display the message. */
  elevatorId?: string;
}

/**
 * A specific elevator Beacon can reason about — not just "this building has
 * an elevator" (Amenity), but "is it working right now, and if not, is
 * there another one." `alternateElevatorId` is only meaningful when set;
 * a building can have an elevator with no accessible alternate, which is
 * itself an important, honestly-surfaced state (see ElevatorStatusCard).
 */
export interface Elevator {
  id: string;
  buildingId: string;
  label: string;
  floorsServed: number[];
  status: "operational" | "outage";
  alternateElevatorId?: string;
  /** e.g. "Reported out of service this morning — Facilities has been notified." */
  note?: string;
  lastUpdated?: string; // ISO
}

export interface ConstructionNotice {
  id: string;
  title: string;
  description: string;
  affectedBuildingIds: string[];
  active: boolean;
  startsAt: string;
  endsAt?: string;
}

export interface CampusEvent {
  id: string;
  name: string;
  date: string; // ISO date
  startTime: string; // "09:00"
  endTime?: string;
  venueBuildingId: string;
  description: string;
  recommendedParkingId?: string;
  recommendedEntranceId?: string;
  accessibilityNote?: string;
  arrivalRecommendation: string;
}

export interface ClassScheduleEntry {
  id: string;
  time: string; // "09:00"
  course: string;
  courseName: string;
  buildingId: string;
  roomNumber: string;
}

export interface TourStop {
  id: string;
  order: number;
  buildingId?: string;
  point: Point;
  title: string;
  description: string;
}

export interface OrientationItem {
  id: string;
  order: number;
  title: string;
  time?: string;
  buildingId?: string;
  description: string;
  icon: "schedule" | "parking" | "check-in" | "id" | "financial-aid" | "residence" | "dining" | "sessions";
}

export type ServiceCategory =
  | "admissions"
  | "financial-aid"
  | "registrar"
  | "advising"
  | "career-services"
  | "veterans"
  | "student-affairs"
  | "counseling"
  | "health"
  | "police"
  | "accessibility"
  | "it-help-desk"
  | "bookstore"
  | "dining"
  | "housing"
  | "testing-center"
  | "library"
  | "tutoring";

export interface CampusService {
  id: string;
  name: string;
  category: ServiceCategory;
  buildingId: string;
  departmentId?: string;
  description: string;
  appointmentRequired?: boolean;
  phone?: string;
  email?: string;
  hoursNote?: string;
  /** e.g. "Extended time on exams", "Note-taking support", "Assistive technology lab" — plain-language, not diagnostic. */
  accommodations?: string[];
}

export interface QuickQuestion {
  id: string;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Facility waypoints — restrooms, accessible restrooms, service animal relief
// areas, and lactation rooms that a route can be built *through*, not just
// shown as nearby suggestions. The category list is intentionally broader
// than what's populated with fixture data today, so new stop types (quiet
// space, water fountain, charging) can be introduced later without changing
// the routing architecture.
// ---------------------------------------------------------------------------

export type FacilityCategory =
  | "restroom"
  | "accessible-restroom"
  | "service-animal-relief"
  | "lactation-room"
  | "family-restroom"
  | "quiet-space"
  | "water-fountain"
  | "charging-station"
  /** A manually-chosen building added as a route stop — not ranked/recommended like the other categories, just routed through as-is. */
  | "custom-stop";

export const FACILITY_CATEGORY_META: Record<FacilityCategory, { label: string; shortLabel: string }> = {
  restroom: { label: "Restroom", shortLabel: "Restroom" },
  "accessible-restroom": { label: "Accessible Restroom", shortLabel: "Accessible" },
  "service-animal-relief": { label: "Service Animal Relief Area", shortLabel: "Service Animal" },
  "lactation-room": { label: "Lactation Room", shortLabel: "Lactation" },
  "family-restroom": { label: "Family Restroom", shortLabel: "Family" },
  "quiet-space": { label: "Quiet Space", shortLabel: "Quiet Space" },
  "water-fountain": { label: "Water Fountain", shortLabel: "Water" },
  "charging-station": { label: "Charging Station", shortLabel: "Charging" },
  "custom-stop": { label: "Stop", shortLabel: "Stop" }
};

/** Categories currently offered in the "Add a Stop" flow. Others in FacilityCategory are architecture-ready but not yet populated with fixture data or surfaced in the UI. */
export const ADDABLE_STOP_CATEGORIES: FacilityCategory[] = [
  "restroom",
  "accessible-restroom",
  "service-animal-relief",
  "lactation-room",
  "quiet-space"
];

export interface CampusFacility {
  id: string;
  category: FacilityCategory;
  /** Display name, e.g. "Hendrix Student Center — 1st Floor Restroom". */
  name: string;
  buildingId: string;
  floor: number;
  provenance: DataProvenance;
}

/**
 * A stop a calculated route intentionally passes through on the way to the
 * final destination — not a nearby recommendation, an actual routing leg.
 * `note` is the guidance instruction shown when the route arrives here.
 */
export interface RouteWaypoint {
  facilityId: string;
  category: FacilityCategory;
  label: string;
  buildingId: string;
  note: string;
}

export interface Campus {
  id: string;
  universityName: string;
  shortName: string;
  tagline: string;
  center: Point;
  buildings: Building[];
  parkingLots: ParkingLot[];
  pathNodes: WalkingPathNode[];
  pathEdges: WalkingPathEdge[];
  alerts: CampusAlert[];
  construction: ConstructionNotice[];
  events: CampusEvent[];
  services: CampusService[];
  tourStops: TourStop[];
  orientationItems: OrientationItem[];
  quickQuestions: QuickQuestion[];
  facilities: CampusFacility[];
  elevators: Elevator[];
  aliasMap: Record<string, string>; // lowercase alias -> canonical searchable id ("building:id", "room:id", etc.)
  /** Overall data-integrity summary shown in Help — what's verified vs. illustrative, and where verified facts came from. */
  dataDisclosure: {
    summary: string;
    sources: CitedSource[];
  };
}

// --- Search & routing ---

export type SearchResultKind =
  | "building"
  | "room"
  | "department"
  | "service"
  | "amenity"
  | "event"
  | "parking";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  buildingId: string;
  score: number;
}

export interface DestinationIntel {
  buildingId: string;
  building: Building;
  title: string;
  subtitle?: string;
  roomNumber?: string;
  floor?: number;
  walkMinutes: number;
  recommendedEntrance: Entrance;
  entranceSubstituted: boolean;
  addedMinutes: number;
  openStatus: { isOpen: boolean; label: string };
  accessibilityNote?: string;
  recommendedParking?: ParkingLot;
  parkingWalkMinutes?: number;
  activeAlerts: CampusAlert[];
  /**
   * Set only when the destination floor requires an elevator and Beacon
   * could not confirm a working one — a genuinely unresolved accessibility
   * gap, not a routing bug, and never silently hidden from a step-free
   * traveler (see the "could not identify a confirmed accessible path"
   * state in AssistanceScreen / DestinationCard).
   */
  unconfirmedAccessiblePath?: boolean;
  /** The elevator actually used to reach this destination's floor, when one is required and known. */
  elevatorUsed?: Elevator;
}

export type StepCategory = "direction" | "landmark" | "accessibility" | "advisory" | "arrival" | "reassurance" | "waypoint";

/**
 * Real, functional routing/behavior preferences — mirrors Beacon Airport's
 * traveler-preference system, adapted for campus. Each one measurably changes
 * pathfinding weight, route composition, copy, or app behavior; see
 * campusEngine.ts and NavigationScreen for where each is consumed.
 */
export interface CampusPreferences {
  /** Hard filter: only accessible edges/entrances. */
  stepFree: boolean;
  /** Soft weighting: penalizes high-crowdLevel edges. */
  avoidCrowds: boolean;
  /** Soft weighting: penalizes high-noiseLevel edges, rewards lowStimulation ones. */
  calmRoute: boolean;
  /** Hard waypoint: routes through the nearest restroom-equipped building en route. */
  restroomStop: boolean;
  /** Multiplies displayed walk time by 1.25 and relaxes "leave by" messaging. */
  extraTime: boolean;
  /** Global font-size increase, app-wide. */
  largerText: boolean;
  /** Speaks the current guidance step aloud via the Web Speech API. */
  audioGuidance: boolean;
  /** Shorter, one-action-at-a-time phrasing for guidance and arrival text. */
  simplifiedDirections: boolean;
  /** Adds a rotating, calm reassurance line to each guidance step. */
  reassurance: boolean;
  /** Biases in-building arrival guidance toward the elevator when both stairs and an elevator exist. */
  avoidStairs: boolean;
  /** Soft weighting: penalizes edges with a steeper elevationChange. */
  minimizeElevation: boolean;
  /** Soft weighting: penalizes outdoor edges — climate-controlled, connector-heavy routing. */
  indoorPreferred: boolean;
  /** Surfaces seating opportunities along the route and prioritizes them in Rest & Resume. */
  seatingStops: boolean;
  /** Route-condition changes (recalculation, entrance substitution, elevator outage) are always shown as a visible banner, not only spoken or implied. */
  visualAlerts: boolean;
  /** Higher-contrast color treatment app-wide. */
  highContrast: boolean;
  /** Soft weighting: scales down the other comfort-preference penalties below, so distance/time dominates scoring more when a shorter walk matters most. */
  minimizeDistance: boolean;
  /** Soft weighting: penalizes indoor-connector edges — the inverse of indoorPreferred. */
  outdoorPreferred: boolean;
  /** Not a routing weight — pre-selects the Service Animal Relief Area stop on the "needs along the way" screen. */
  serviceAnimalSupport: boolean;
}

/**
 * Quick route-strategy presets shown before starting navigation — mirrors
 * Beacon Airport's route comparison cards. Fastest/Calm/Mobility override
 * just the routing-strategy preferences (stepFree/avoidCrowds/calmRoute/
 * restroomStop) for this trip only; Custom uses whatever is saved on the
 * Accessibility & Preferences screen, comfort preferences included.
 */
export type RouteMode = "fastest" | "calm" | "mobility" | "custom";

export const ROUTE_MODE_META: Record<RouteMode, { label: string; description: string }> = {
  fastest: { label: "Fastest", description: "The shortest path available, no detours." },
  calm: { label: "Calm", description: "Favors quieter, less crowded walkways." },
  mobility: { label: "Mobility", description: "Always step-free — ramps, elevators, accessible entrances." },
  custom: { label: "Custom", description: "Uses your saved Accessibility & Preferences." }
};

export const ROUTE_MODE_OVERRIDES: Record<RouteMode, Partial<CampusPreferences> | null> = {
  fastest: { stepFree: false, avoidCrowds: false, calmRoute: false, restroomStop: false, minimizeElevation: false, indoorPreferred: false, minimizeDistance: true },
  calm: { stepFree: false, avoidCrowds: true, calmRoute: true, indoorPreferred: true },
  mobility: { stepFree: true, avoidStairs: true, minimizeElevation: true, seatingStops: true },
  custom: null
};

export function effectivePreferences(base: CampusPreferences, mode: RouteMode): CampusPreferences {
  const overrides = ROUTE_MODE_OVERRIDES[mode];
  return overrides ? { ...base, ...overrides } : base;
}

export const DEFAULT_PREFERENCES: CampusPreferences = {
  stepFree: false,
  avoidCrowds: false,
  calmRoute: false,
  restroomStop: false,
  extraTime: false,
  largerText: false,
  audioGuidance: false,
  simplifiedDirections: false,
  reassurance: false,
  avoidStairs: false,
  minimizeElevation: false,
  indoorPreferred: false,
  seatingStops: false,
  visualAlerts: false,
  highContrast: false,
  minimizeDistance: false,
  outdoorPreferred: false,
  serviceAnimalSupport: false
};

export interface GuidanceStep {
  id: string;
  order: number;
  instruction: string;
  category: StepCategory;
  minutesFromStart: number;
  /** Simulated walking distance from the previous step, in feet — estimated from a typical walking pace applied to the path graph's edge times, not a measured distance. */
  feet?: number;
  /** Path node or building id this step is "at" — drives the per-step location illustration. */
  locationId?: string;
  /** Set on the step where the route arrives at `RoutePlan.waypoints[waypointIndex]` — distinguishes a stop arrival ("Continue Route") from the final destination arrival. */
  waypointIndex?: number;
}

/**
 * A plain-language exertion estimate derived from a route's grade and
 * surface data — separate from step-free (pass/fail) because two
 * "accessible" routes can still differ a lot in how demanding they are to
 * actually walk, wheel, or push a stroller along. Inputs are illustrative
 * (see the edge-authoring note in beaconUniversity.ts), so this stays a
 * plain-language label, never a fabricated precise number.
 */
export interface ExertionEstimate {
  label: "Easy" | "Moderate" | "Demanding";
  tone: "success" | "warning" | "danger";
  note: string;
}

export interface RoutePlan {
  destination: DestinationIntel;
  steps: GuidanceStep[];
  totalMinutes: number;
  startLabel: string;
  /** Ordered intentional stops this route passes through before the final destination — empty when none. */
  waypoints: RouteWaypoint[];
  /** Resolved walking-graph node path, including any waypoint detours — for map rendering. */
  path: string[];
  exertion?: ExertionEstimate | null;
}
