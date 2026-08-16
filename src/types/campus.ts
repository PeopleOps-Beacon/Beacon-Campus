// Core data model for Beacon Campus. Designed so a real university's data could
// replace BEACON_UNIVERSITY (see src/data/beaconUniversity.ts) without changing
// application code.

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
}

export type AlertSeverity = "info" | "advisory" | "warning";

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
