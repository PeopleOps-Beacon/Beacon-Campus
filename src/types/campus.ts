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
}

export interface QuickQuestion {
  id: string;
  question: string;
  answer: string;
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
}

export type StepCategory = "direction" | "landmark" | "accessibility" | "advisory" | "arrival" | "reassurance";

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
  fastest: { stepFree: false, avoidCrowds: false, calmRoute: false, restroomStop: false },
  calm: { stepFree: false, avoidCrowds: true, calmRoute: true },
  mobility: { stepFree: true },
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
  reassurance: false
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
}

export interface RoutePlan {
  destination: DestinationIntel;
  steps: GuidanceStep[];
  totalMinutes: number;
  startLabel: string;
  waypoint?: { building: Building; note: string };
  /** Resolved walking-graph node path, including any waypoint detour — for map rendering. */
  path: string[];
}
