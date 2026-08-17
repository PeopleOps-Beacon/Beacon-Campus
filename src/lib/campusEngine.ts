import type {
  AmenityType,
  Building,
  Campus,
  CampusAlert,
  CampusFacility,
  CampusPreferences,
  DestinationIntel,
  Entrance,
  FacilityCategory,
  GuidanceStep,
  ParkingEligibility,
  ParkingLot,
  Point,
  RouteMode,
  RoutePlan,
  RouteWaypoint,
  SearchResult
} from "../types/campus";
import { DEFAULT_PREFERENCES, FACILITY_CATEGORY_META, ROUTE_MODE_META } from "../types/campus";
import { isWithinHours } from "../utils/time";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getBuilding(campus: Campus, buildingId: string): Building | undefined {
  return campus.buildings.find((b) => b.id === buildingId);
}

export function getEntrance(building: Building, entranceId: string): Entrance | undefined {
  return building.entrances.find((e) => e.id === entranceId);
}

export function activeAlertsForBuilding(campus: Campus, buildingId: string): CampusAlert[] {
  return campus.alerts.filter((a) => a.active && a.affectedBuildingIds.includes(buildingId));
}

export function activeAlertsForParking(campus: Campus, lotId: string): CampusAlert[] {
  return campus.alerts.filter((a) => a.active && a.affectedParkingIds?.includes(lotId));
}

export function activeConstructionForBuilding(campus: Campus, buildingId: string) {
  return campus.construction.filter((c) => c.active && c.affectedBuildingIds.includes(buildingId));
}

export function buildingOpenStatus(building: Building, now: Date = new Date()): { isOpen: boolean; label: string } {
  const isOpen = isWithinHours(building.hours.opens, building.hours.closes, now);
  if (building.hours.opens === "00:00" && building.hours.closes === "23:59") {
    return { isOpen: true, label: building.hours.note ?? "Open 24 hours" };
  }
  const closesLabel = formatHourLabel(building.hours.closes);
  const opensLabel = formatHourLabel(building.hours.opens);
  return {
    isOpen,
    label: isOpen ? `Open until ${closesLabel}` : `Closed now — opens at ${opensLabel}`
  };
}

function formatHourLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: m === 0 ? undefined : "2-digit" });
}

// ---------------------------------------------------------------------------
// Graph / routing
// ---------------------------------------------------------------------------

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export interface PathResult {
  path: string[];
  minutes: number;
}

export interface RouteWeightOptions {
  preferStepFree?: boolean;
  avoidCrowds?: boolean;
  calmRoute?: boolean;
}

/**
 * Weighted "cost" for a given edge under the active preferences — this is
 * what Dijkstra minimizes. It is deliberately different from the edge's real
 * walking time: avoidCrowds/calmRoute nudge the algorithm toward a calmer
 * path even when it takes a little longer, exactly like a real wayfinding
 * preference should.
 */
function edgeCost(edge: Campus["pathEdges"][number], opts: RouteWeightOptions): number {
  let cost = edge.minutes;
  if (opts.avoidCrowds && edge.crowdLevel) cost += edge.crowdLevel * 1.2;
  if (opts.calmRoute) {
    if (edge.noiseLevel) cost += edge.noiseLevel * 0.6;
    if (edge.lowStimulation) cost -= 0.8;
  }
  return cost;
}

/** Dijkstra shortest path over the campus walking graph, weighted by preference. */
export function findShortestPath(campus: Campus, fromId: string, toId: string, opts: RouteWeightOptions = {}): PathResult | null {
  if (fromId === toId) return { path: [fromId], minutes: 0 };

  const adjacency = new Map<string, { to: string; cost: number; minutes: number }[]>();
  for (const edge of campus.pathEdges) {
    if (opts.preferStepFree && !edge.accessible) continue;
    const cost = edgeCost(edge, opts);
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from)!.push({ to: edge.to, cost, minutes: edge.minutes });
    adjacency.get(edge.to)!.push({ to: edge.from, cost, minutes: edge.minutes });
  }

  const costSoFar = new Map<string, number>();
  const minutesSoFar = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  costSoFar.set(fromId, 0);
  minutesSoFar.set(fromId, 0);

  const queue = new Set<string>(campus.pathNodes.map((n) => n.id));

  while (queue.size > 0) {
    let current: string | null = null;
    let currentCost = Infinity;
    for (const id of queue) {
      const c = costSoFar.get(id) ?? Infinity;
      if (c < currentCost) {
        currentCost = c;
        current = id;
      }
    }
    if (current === null || currentCost === Infinity) break;
    queue.delete(current);
    visited.add(current);
    if (current === toId) break;

    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor.to)) continue;
      const candidateCost = currentCost + neighbor.cost;
      if (candidateCost < (costSoFar.get(neighbor.to) ?? Infinity)) {
        costSoFar.set(neighbor.to, candidateCost);
        minutesSoFar.set(neighbor.to, (minutesSoFar.get(current) ?? 0) + neighbor.minutes);
        prev.set(neighbor.to, current);
      }
    }
  }

  if (!costSoFar.has(toId)) return null;

  const path: string[] = [toId];
  let cursor = toId;
  while (prev.has(cursor)) {
    cursor = prev.get(cursor)!;
    path.unshift(cursor);
  }

  return { path, minutes: Math.round(minutesSoFar.get(toId) ?? 0) };
}

/** Finds the nearest building (other than `excludeBuildingId`) with a given amenity type. */
export function findNearbyAmenityBuilding(
  campus: Campus,
  fromNodeId: string,
  amenityType: AmenityType,
  excludeBuildingId: string,
  opts: RouteWeightOptions = {}
): { building: Building; minutes: number } | undefined {
  let best: { building: Building; minutes: number } | undefined;
  for (const building of campus.buildings) {
    if (building.id === excludeBuildingId) continue;
    if (!building.amenities.some((a) => a.type === amenityType)) continue;
    const result = findShortestPath(campus, fromNodeId, building.id, opts);
    if (result && (!best || result.minutes < best.minutes)) {
      best = { building, minutes: result.minutes };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Entrance recommendation
// ---------------------------------------------------------------------------

export interface EntranceRecommendation {
  entrance: Entrance;
  substituted: boolean;
  addedMinutes: number;
  substitutionReason?: string;
}

export function recommendEntrance(
  campus: Campus,
  building: Building,
  opts: { preferStepFree?: boolean } = {}
): EntranceRecommendation {
  if (opts.preferStepFree) {
    const accessible = getEntrance(building, building.accessibleEntranceId) ?? building.entrances[0];
    return { entrance: accessible, substituted: false, addedMinutes: 0 };
  }

  const primary = getEntrance(building, building.primaryEntranceId) ?? building.entrances[0];
  const alerts = activeAlertsForBuilding(campus, building.id);
  const closingAlert = alerts.find((a) => a.affectedEntranceIds?.includes(primary.id) && a.substituteEntranceId);

  if (closingAlert) {
    const substitute = getEntrance(building, closingAlert.substituteEntranceId!) ?? primary;
    return {
      entrance: substitute,
      substituted: true,
      addedMinutes: closingAlert.addedWalkMinutes ?? 0,
      substitutionReason: closingAlert.message
    };
  }

  return { entrance: primary, substituted: false, addedMinutes: 0 };
}

// ---------------------------------------------------------------------------
// Parking
// ---------------------------------------------------------------------------

export interface ParkingRecommendation {
  lot: ParkingLot;
  walkMinutes?: number;
  substituted: boolean;
}

export function resolveParkingForBuilding(
  campus: Campus,
  building: Building,
  opts: { eligibility?: ParkingEligibility; preferredLotId?: string } = {}
): ParkingRecommendation | undefined {
  const candidateIds = opts.preferredLotId
    ? [opts.preferredLotId, ...building.nearbyParkingIds]
    : building.nearbyParkingIds;

  const candidates = candidateIds
    .map((id) => campus.parkingLots.find((lot) => lot.id === id))
    .filter((lot): lot is ParkingLot => Boolean(lot));

  const eligible = opts.eligibility
    ? candidates.filter((lot) => lot.eligibility.includes(opts.eligibility!))
    : candidates;

  const open = eligible.find((lot) => !lot.closed);
  if (open) {
    return { lot: open, walkMinutes: open.walkTimeMinutesTo[building.id], substituted: opts.preferredLotId ? open.id !== opts.preferredLotId : false };
  }

  // Every nearby lot is closed — fall back to the closest open lot campus-wide.
  const fallback = campus.parkingLots
    .filter((lot) => !lot.closed && (!opts.eligibility || lot.eligibility.includes(opts.eligibility)))
    .sort((a, b) => distance(a.point, building.point) - distance(b.point, building.point))[0];

  if (fallback) {
    return { lot: fallback, walkMinutes: fallback.walkTimeMinutesTo[building.id], substituted: true };
  }

  return candidates[0] ? { lot: candidates[0], substituted: false } : undefined;
}

// ---------------------------------------------------------------------------
// Remember My Car — routing back to a saved parking spot. Kept deliberately
// separate from the building-oriented DestinationIntel/RoutePlan pipeline
// above (which assumes a Building at the far end, with entrances, floors,
// rooms) rather than contorting a parking lot into a fake building.
// ---------------------------------------------------------------------------

export interface ParkingReturnPlan {
  lot: ParkingLot;
  walkMinutes: number;
  path: string[];
  startLabel: string;
  steps: string[];
}

export function planReturnToCar(
  campus: Campus,
  fromNodeId: string,
  lot: ParkingLot,
  preferences: CampusPreferences
): ParkingReturnPlan | null {
  const weightOpts: RouteWeightOptions = {
    preferStepFree: preferences.stepFree,
    avoidCrowds: preferences.avoidCrowds,
    calmRoute: preferences.calmRoute
  };
  const result = findShortestPath(campus, fromNodeId, lot.id, weightOpts);
  if (!result) return null;

  const minutes = preferences.extraTime ? Math.round(result.minutes * 1.25) : result.minutes;
  const startNode = campus.pathNodes.find((n) => n.id === fromNodeId);

  const steps: string[] = [];
  for (let i = 1; i < result.path.length - 1; i++) {
    const node = campus.pathNodes.find((n) => n.id === result.path[i]);
    if (node?.isLandmark) steps.push(`Continue past ${node.label}.`);
  }
  steps.push(`You've arrived at ${lot.name}, where you parked.`);

  return {
    lot,
    walkMinutes: minutes,
    path: result.path,
    startLabel: startNode?.label ?? "Your location",
    steps
  };
}

// ---------------------------------------------------------------------------
// Destination intelligence + route plan
// ---------------------------------------------------------------------------

export interface DestinationTarget {
  buildingId: string;
  title?: string;
  subtitle?: string;
  roomNumber?: string;
  floor?: number;
  eligibility?: ParkingEligibility;
}

// ---------------------------------------------------------------------------
// Facility waypoints — restroom, accessible restroom, service animal relief,
// and lactation room stops that become genuine legs of a route rather than
// nearby suggestions. Mirrors Beacon Airport's buildStopSequence/
// calculateRoute pattern (routeEngine.ts): one preferences object is threaded
// through every segment's pathfinding call, so accessibility constraints —
// step-free, avoid crowds, calm route — apply to the whole journey, not just
// the leg to the first stop.
// ---------------------------------------------------------------------------

/** A facility on an upper floor is only step-free reachable if its building has an elevator — Campus doesn't track per-amenity accessibility separately from that. */
export function facilityAccessible(campus: Campus, facility: CampusFacility): boolean {
  if (facility.floor <= 1) return true;
  const building = getBuilding(campus, facility.buildingId);
  return building?.amenities.some((a) => a.type === "elevator") ?? false;
}

export interface FacilityRecommendation {
  facility: CampusFacility;
  building: Building;
  addedMinutes: number;
  accessible: boolean;
}

export interface FacilityRecommendationResult {
  category: FacilityCategory;
  options: FacilityRecommendation[];
  /** Instances that exist but were left out because they can't be reached under the traveler's active accessibility preferences — never silently offered as if they were compatible. */
  excludedForAccessibility: number;
}

/**
 * Ranks facility instances of a category by how much detour they'd add
 * between `fromNodeId` and `destinationBuildingId` under the traveler's
 * active preferences, cheapest first. A facility that can't be reached at
 * all under `stepFree` (or has no known accessible path from/to it) is
 * excluded rather than recommended and silently routed around the
 * preference — see ERROR HANDLING in the feature brief.
 */
export function recommendFacility(
  campus: Campus,
  category: FacilityCategory,
  fromNodeId: string,
  destinationBuildingId: string,
  preferences: CampusPreferences
): FacilityRecommendationResult {
  const weightOpts: RouteWeightOptions = {
    preferStepFree: preferences.stepFree,
    avoidCrowds: preferences.avoidCrowds,
    calmRoute: preferences.calmRoute
  };

  const direct = findShortestPath(campus, fromNodeId, destinationBuildingId, weightOpts);
  const directMinutes = direct?.minutes ?? 0;

  const options: FacilityRecommendation[] = [];
  let excludedForAccessibility = 0;

  for (const facility of campus.facilities) {
    if (facility.category !== category) continue;
    const building = getBuilding(campus, facility.buildingId);
    if (!building || facility.buildingId === destinationBuildingId || facility.buildingId === fromNodeId) continue;

    const accessible = facilityAccessible(campus, facility);
    if (preferences.stepFree && !accessible) {
      excludedForAccessibility += 1;
      continue;
    }

    const toFacility = findShortestPath(campus, fromNodeId, facility.buildingId, weightOpts);
    const fromFacility = findShortestPath(campus, facility.buildingId, destinationBuildingId, weightOpts);
    if (!toFacility || !fromFacility) {
      excludedForAccessibility += 1;
      continue;
    }

    options.push({
      facility,
      building,
      addedMinutes: Math.max(0, Math.round(toFacility.minutes + fromFacility.minutes - directMinutes)),
      accessible
    });
  }

  options.sort((a, b) => a.addedMinutes - b.addedMinutes);
  return { category, options, excludedForAccessibility };
}

function toRouteWaypoint(campus: Campus, facility: CampusFacility): RouteWaypoint {
  const building = getBuilding(campus, facility.buildingId);
  const label = FACILITY_CATEGORY_META[facility.category].label;
  return {
    facilityId: facility.id,
    category: facility.category,
    label: building?.name ? `${label} — ${building.name}` : label,
    buildingId: facility.buildingId,
    note: `Quick stop: ${label.toLowerCase()} inside ${building?.name ?? label}.`
  };
}

interface WeightedRoute {
  path: string[];
  minutes: number;
  waypoints: RouteWaypoint[];
}

/**
 * Resolves the actual path to walk — including any facility waypoints,
 * whether explicitly chosen (`waypointFacilityIds`) or auto-added by the
 * `restroomStop` preference — and the extraTime multiplier on the final
 * estimate. Both getDestinationIntel and computeRoutePlan call this so the
 * walk time shown on a destination card always matches the route that's
 * actually guided step by step.
 *
 * Every leg of a multi-stop route is pathfound with the same `weightOpts`,
 * so accessibility preferences apply to the complete journey, not just the
 * first segment — the same guarantee Beacon Airport's calculateRoute makes
 * by threading one preferences array through its stop-sequence loop.
 */
function planWeightedPath(
  campus: Campus,
  fromNodeId: string,
  buildingId: string,
  preferences: CampusPreferences,
  waypointFacilityIds: string[] = []
): WeightedRoute {
  const weightOpts: RouteWeightOptions = {
    preferStepFree: preferences.stepFree,
    avoidCrowds: preferences.avoidCrowds,
    calmRoute: preferences.calmRoute
  };

  let facilities = waypointFacilityIds
    .map((id) => campus.facilities.find((f) => f.id === id))
    .filter((f): f is CampusFacility => Boolean(f));

  const hasRestroomWaypoint = facilities.some((f) => f.category === "restroom" || f.category === "accessible-restroom");
  if (preferences.restroomStop && !hasRestroomWaypoint) {
    const category: FacilityCategory = preferences.stepFree ? "accessible-restroom" : "restroom";
    const recommendation = recommendFacility(campus, category, fromNodeId, buildingId, preferences);
    if (recommendation.options.length > 0) {
      facilities = [...facilities, recommendation.options[0].facility];
    }
  }

  const seen = new Set<string>();
  facilities = facilities.filter((f) => {
    if (f.buildingId === buildingId || f.buildingId === fromNodeId) return false;
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  const stopSequence = [fromNodeId, ...facilities.map((f) => f.buildingId), buildingId];
  const legs: PathResult[] = [];
  for (let i = 0; i < stopSequence.length - 1; i++) {
    const leg = findShortestPath(campus, stopSequence[i], stopSequence[i + 1], weightOpts);
    if (!leg) {
      // A waypoint leg is unreachable under the active preferences — fall back
      // to the direct route rather than silently dropping the destination.
      return planWeightedPath(campus, fromNodeId, buildingId, preferences, []);
    }
    legs.push(leg);
  }

  const path = legs.reduce<string[]>((all, leg, index) => (index === 0 ? leg.path : [...all, ...leg.path.slice(1)]), []);
  let minutes = legs.reduce((total, leg) => total + leg.minutes, 0);
  if (preferences.extraTime) minutes = Math.round(minutes * 1.25);

  return { path, minutes, waypoints: facilities.map((f) => toRouteWaypoint(campus, f)) };
}

export function getDestinationIntel(
  campus: Campus,
  target: DestinationTarget,
  opts: { fromNodeId?: string; preferences?: CampusPreferences; now?: Date; waypointFacilityIds?: string[] } = {}
): DestinationIntel | null {
  const building = getBuilding(campus, target.buildingId);
  if (!building) return null;

  const preferences = opts.preferences ?? DEFAULT_PREFERENCES;

  // Room-only callers (e.g. the class schedule) may omit floor — resolve it
  // from the building's room list so arrival guidance is never wrong.
  const resolvedFloor =
    target.floor ?? (target.roomNumber ? building.rooms.find((r) => r.number === target.roomNumber)?.floor : undefined);

  const fromNodeId = opts.fromNodeId ?? "green";
  const route = planWeightedPath(campus, fromNodeId, building.id, preferences, opts.waypointFacilityIds ?? []);
  const entranceRec = recommendEntrance(campus, building, { preferStepFree: preferences.stepFree });
  const openStatus = buildingOpenStatus(building, opts.now);
  const parkingRec = resolveParkingForBuilding(campus, building, { eligibility: target.eligibility });
  const activeAlerts = activeAlertsForBuilding(campus, building.id);

  const notes: string[] = [];
  if (preferences.stepFree) notes.push(`Route adjusted for step-free access via the ${entranceRec.entrance.label}.`);
  if (preferences.avoidCrowds) notes.push("Route adjusted to avoid the busiest walkways.");
  if (preferences.calmRoute) notes.push("Route adjusted for a quieter, lower-stimulation path.");
  route.waypoints.forEach((waypoint) => notes.push(waypoint.note));

  return {
    buildingId: building.id,
    building,
    title: target.title ?? building.name,
    subtitle: target.subtitle,
    roomNumber: target.roomNumber,
    floor: resolvedFloor,
    walkMinutes: route.minutes + entranceRec.addedMinutes,
    recommendedEntrance: entranceRec.entrance,
    entranceSubstituted: entranceRec.substituted,
    addedMinutes: entranceRec.addedMinutes,
    openStatus,
    accessibilityNote: notes.length > 0 ? notes.join(" ") : undefined,
    recommendedParking: parkingRec?.lot,
    parkingWalkMinutes: parkingRec?.walkMinutes,
    activeAlerts
  };
}

const REASSURANCE_MESSAGES = [
  "You're doing great — no need to rush.",
  "Almost there. Take your time.",
  "You're on the right path.",
  "Nice and easy — you've got this."
];

function reassuranceMessageFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return REASSURANCE_MESSAGES[hash % REASSURANCE_MESSAGES.length];
}

function arrivalMessage(intel: DestinationIntel, simplified: boolean): string {
  const { building, recommendedEntrance, roomNumber, floor } = intel;

  if (simplified) {
    const parts = [`You've arrived at ${building.name}.`, `Go in through the ${recommendedEntrance.label.toLowerCase()}.`];
    if (roomNumber && floor && floor > 1) {
      parts.push(`Room ${roomNumber} is on floor ${floor}.`);
    } else if (roomNumber) {
      parts.push(`Room ${roomNumber} is on this floor.`);
    }
    return parts.join(" ");
  }

  const parts: string[] = [`You're at ${building.name}.`];
  parts.push(`Enter through the ${recommendedEntrance.label.toLowerCase()}${recommendedEntrance.notes ? ` — ${recommendedEntrance.notes.toLowerCase()}` : ""}.`);

  if (roomNumber && floor && floor > 1) {
    const elevator = building.amenities.find((a) => a.type === "elevator");
    const stairs = building.amenities.find((a) => a.type === "stairs");
    const ordinal = floor === 2 ? "second" : floor === 3 ? "third" : floor === 4 ? "fourth" : `${floor}th`;
    let accessText = "";
    if (stairs && elevator) {
      accessText = ` Take the stairs just inside the entrance, or use the elevator (${elevator.label.toLowerCase()}).`;
    } else if (elevator) {
      accessText = ` Use the elevator — ${elevator.label.toLowerCase()}.`;
    }
    parts.push(`Room ${roomNumber} is on the ${ordinal} floor.${accessText}`);
  } else if (roomNumber) {
    parts.push(`Room ${roomNumber} is on the 1st floor, just past the entrance.`);
  }

  return parts.join(" ");
}

/** Average adult walking pace (~3 mph), used only to turn a step's walk time into a simulated distance-in-feet readout — never a measured distance. */
export const WALK_FEET_PER_MINUTE = 265;

/** Rounds a simulated distance to a sensible increment (nearest 25 ft) so it reads like an estimate, not a precise measurement. */
export function roundFeet(feet: number): number {
  if (feet <= 0) return 0;
  return Math.max(25, Math.round(feet / 25) * 25);
}

/** Formats a simulated walk distance (derived from minutes, not measured) as "850 ft" or "0.4 mi". */
export function formatWalkDistance(minutes: number): string {
  const feet = roundFeet(minutes * WALK_FEET_PER_MINUTE);
  if (feet < 1000) return `${feet} ft`;
  return `${(feet / 5280).toFixed(1)} mi`;
}

/** A short "why this route" line for a destination preview — the active route mode plus any preference-driven adjustments already computed onto the intel. */
export function routeRationale(mode: RouteMode, intel: DestinationIntel): string {
  const parts = [ROUTE_MODE_META[mode].label];
  if (intel.accessibilityNote) parts.push(intel.accessibilityNote);
  else if (intel.entranceSubstituted) parts.push(`Entrance changed — ${intel.recommendedEntrance.label} instead, +${intel.addedMinutes} min.`);
  return parts.join(" — ");
}

const JOURNEY_PREFERENCE_LABELS: Partial<Record<keyof CampusPreferences, string>> = {
  stepFree: "Step-free route",
  avoidCrowds: "Lower-crowd routing",
  calmRoute: "Calm route",
  restroomStop: "Restroom stop",
  extraTime: "Extra time",
  simplifiedDirections: "Simplified directions",
  reassurance: "Reassurance prompts"
};

/** A short journey recap for the arrival screen — destination, time, route mode used, which accessibility/comfort preferences actually shaped this route, and whether an alert changed anything. */
export function journeySummaryRows(
  plan: RoutePlan,
  mode: RouteMode,
  effective: CampusPreferences
): { label: string; value: string }[] {
  const support = (Object.keys(JOURNEY_PREFERENCE_LABELS) as (keyof CampusPreferences)[])
    .filter((key) => effective[key])
    .map((key) => JOURNEY_PREFERENCE_LABELS[key]!)
    .join(", ");

  const rows = [
    { label: "Destination", value: plan.destination.title },
    { label: "Walk time", value: `${plan.totalMinutes} min` },
    { label: "Route", value: ROUTE_MODE_META[mode].label }
  ];
  if (plan.waypoints.length > 0) {
    rows.push({ label: "Stops", value: plan.waypoints.map((w) => w.label.split(" — ")[0]).join(", ") });
  }
  rows.push(
    { label: "Accessibility support", value: support || "None" },
    { label: "Route changes", value: plan.destination.entranceSubstituted ? "Entrance changed for a closure" : "None" }
  );
  return rows;
}

export function getGuidanceSteps(
  campus: Campus,
  intel: DestinationIntel,
  path: string[],
  opts: { preferences?: CampusPreferences; waypoints?: RouteWaypoint[] } = {}
): GuidanceStep[] {
  const waypoints = opts.waypoints ?? [];
  const preferences = opts.preferences ?? DEFAULT_PREFERENCES;
  const simplified = preferences.simplifiedDirections;
  const steps: GuidanceStep[] = [];
  let order = 0;
  let minutesFromStart = 0;
  let feetSinceLastStep = 0;

  if (intel.entranceSubstituted && intel.activeAlerts.length > 0) {
    const alert = intel.activeAlerts.find((a) => a.substituteEntranceId === intel.recommendedEntrance.id);
    steps.push({
      id: `step-${order}`,
      order: order++,
      instruction: alert?.message ?? `A usual entrance is closed — this route uses the ${intel.recommendedEntrance.label} instead.`,
      category: "advisory",
      minutesFromStart,
      locationId: intel.buildingId
    });
  }

  const weightOpts: RouteWeightOptions = {
    preferStepFree: preferences.stepFree,
    avoidCrowds: preferences.avoidCrowds,
    calmRoute: preferences.calmRoute
  };
  const edgeMinutes = (a: string, b: string) => {
    const candidates = campus.pathEdges.filter((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
    if (candidates.length === 0) return 0;
    const best = candidates.reduce((min, e) => (edgeCost(e, weightOpts) < edgeCost(min, weightOpts) ? e : min));
    return best.minutes;
  };
  const timeScale = preferences.extraTime ? 1.25 : 1;

  for (let i = 1; i < path.length; i++) {
    const nodeId = path[i];
    const prevId = path[i - 1];
    const legMinutes = edgeMinutes(prevId, nodeId) * timeScale;
    minutesFromStart += legMinutes;
    feetSinceLastStep += legMinutes * WALK_FEET_PER_MINUTE;
    const isDestination = i === path.length - 1;
    const node = campus.pathNodes.find((n) => n.id === nodeId);

    if (isDestination) {
      steps.push({
        id: `step-${order}`,
        order: order++,
        instruction: simplified ? `${intel.building.name} is just ahead.` : `${intel.building.name} will be just ahead.`,
        category: "landmark",
        minutesFromStart: Math.round(minutesFromStart),
        feet: roundFeet(feetSinceLastStep),
        locationId: intel.buildingId
      });
      feetSinceLastStep = 0;
      steps.push({
        id: `step-${order}`,
        order: order++,
        instruction: simplified ? `Go in the ${intel.recommendedEntrance.label.toLowerCase()}.` : `Use the ${intel.recommendedEntrance.label.toLowerCase()}.`,
        category: "direction",
        minutesFromStart: Math.round(minutesFromStart),
        feet: 0,
        locationId: intel.buildingId
      });
    } else if (!isDestination && waypoints.some((w) => w.buildingId === nodeId)) {
      const waypointIndex = waypoints.findIndex((w) => w.buildingId === nodeId);
      const waypoint = waypoints[waypointIndex];
      steps.push({
        id: `step-${order}`,
        order: order++,
        instruction: waypoint.note,
        category: "waypoint",
        minutesFromStart: Math.round(minutesFromStart),
        feet: roundFeet(feetSinceLastStep),
        locationId: waypoint.buildingId,
        waypointIndex
      });
      feetSinceLastStep = 0;
    } else if (node?.isLandmark) {
      const verb = i === 1 ? "Head toward" : "Continue past";
      steps.push({
        id: `step-${order}`,
        order: order++,
        instruction: simplified ? `Pass ${node.label}.` : `${verb} ${node.label}.`,
        category: "landmark",
        minutesFromStart: Math.round(minutesFromStart),
        feet: roundFeet(feetSinceLastStep),
        locationId: nodeId
      });
      feetSinceLastStep = 0;
    }
  }

  if (preferences.reassurance && steps.length > 0) {
    const insertAt = Math.max(1, Math.floor(steps.length / 2));
    steps.splice(insertAt, 0, {
      id: `step-reassurance`,
      order: insertAt,
      instruction: reassuranceMessageFor(intel.building.id),
      category: "reassurance",
      minutesFromStart: steps[insertAt - 1]?.minutesFromStart ?? 0,
      locationId: steps[insertAt - 1]?.locationId
    });
    steps.forEach((s, i) => (s.order = i));
  }

  steps.push({
    id: `step-${order}`,
    order: steps.length,
    instruction: arrivalMessage(intel, simplified),
    category: "arrival",
    minutesFromStart: intel.walkMinutes,
    locationId: intel.buildingId
  });

  return steps;
}

// ---------------------------------------------------------------------------
// Accessibility Route Score (exertion estimate)
//
// "Step-free" is a hard pass/fail filter — it says nothing about whether a
// technically-accessible route is actually easy to travel. This estimates how
// physically demanding a given path is from grade and surface data on its
// edges, so two "accessible" routes can be told apart. Inputs are illustrative
// (see the edge-authoring comment in beaconUniversity.ts), so this is exposed
// as a plain-language label, never a fabricated precise number.
// ---------------------------------------------------------------------------

export interface ExertionEstimate {
  label: "Easy" | "Moderate" | "Demanding";
  tone: "success" | "warning" | "danger";
  note: string;
}

export function estimateExertion(campus: Campus, path: string[]): ExertionEstimate | null {
  if (path.length < 2) return { label: "Easy", tone: "success", note: "You're already there." };

  let totalElevation = 0;
  let edgeCount = 0;
  let unpavedCount = 0;

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const candidates = campus.pathEdges.filter((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
    if (candidates.length === 0) continue;
    const edge = candidates.reduce((min, e) => ((e.elevationChange ?? 1) < (min.elevationChange ?? 1) ? e : min));
    totalElevation += edge.elevationChange ?? 1;
    if (edge.surface === "unpaved") unpavedCount += 1;
    edgeCount += 1;
  }

  if (edgeCount === 0) return null;
  const avgElevation = totalElevation / edgeCount;

  if (avgElevation <= 1.5 && unpavedCount === 0) {
    return { label: "Easy", tone: "success", note: "Mostly flat, paved ground the whole way." };
  }
  if (avgElevation <= 2.5 || unpavedCount === 1) {
    return {
      label: "Moderate",
      tone: "warning",
      note: unpavedCount > 0 ? "A gentle grade with one unpaved stretch." : "A gentle grade for part of the walk."
    };
  }
  return {
    label: "Demanding",
    tone: "danger",
    note: unpavedCount > 0 ? "Steeper grades and an unpaved stretch — budget extra time and a rest stop if you need one." : "Steeper grades along this route — budget extra time and a rest stop if you need one."
  };
}

export function computeRoutePlan(
  campus: Campus,
  target: DestinationTarget,
  opts: { fromNodeId?: string; preferences?: CampusPreferences; now?: Date; waypointFacilityIds?: string[] } = {}
): RoutePlan | null {
  const preferences = opts.preferences ?? DEFAULT_PREFERENCES;
  const intel = getDestinationIntel(campus, target, opts);
  if (!intel) return null;

  const fromNodeId = opts.fromNodeId ?? "green";
  const route = planWeightedPath(campus, fromNodeId, intel.buildingId, preferences, opts.waypointFacilityIds ?? []);
  const steps = getGuidanceSteps(campus, intel, route.path, { preferences, waypoints: route.waypoints });
  const startNode = campus.pathNodes.find((n) => n.id === fromNodeId);

  return {
    destination: intel,
    steps,
    totalMinutes: intel.walkMinutes,
    startLabel: startNode?.label ?? "Your location",
    waypoints: route.waypoints,
    path: route.path
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

function scoreMatch(query: string, ...fields: (string | undefined)[]): number {
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    const f = field.toLowerCase();
    if (f === query) best = Math.max(best, 100);
    else if (f.startsWith(query)) best = Math.max(best, 80);
    else if (f.includes(query)) best = Math.max(best, 60);
  }
  return best;
}

const FACILITY_SEARCH_AMENITY_TYPES = new Set<string>(["restroom", "accessible-restroom", "service-animal-relief", "lactation-room"]);

const AMENITY_KEYWORDS: { keywords: string[]; type: string }[] = [
  { keywords: ["restroom", "bathroom", "toilet"], type: "restroom" },
  { keywords: ["accessible restroom", "accessible bathroom"], type: "accessible-restroom" },
  { keywords: ["service animal", "pet relief", "dog relief"], type: "service-animal-relief" },
  { keywords: ["lactation", "nursing room", "nursing area", "pumping room"], type: "lactation-room" },
  { keywords: ["coffee"], type: "coffee" },
  { keywords: ["elevator"], type: "elevator" },
  { keywords: ["printing", "printer"], type: "printing" },
  { keywords: ["study space", "study room"], type: "study-space" },
  { keywords: ["dining", "food"], type: "dining" }
];

export function search(campus: Campus, rawQuery: string, limit = 20): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results = new Map<string, SearchResult>();
  const add = (result: SearchResult) => {
    const key = `${result.kind}:${result.id}`;
    const existing = results.get(key);
    if (!existing || existing.score < result.score) results.set(key, result);
  };

  for (const [alias, target] of Object.entries(campus.aliasMap)) {
    if (query.includes(alias) || alias.includes(query)) {
      const [kind, id] = target.split(":");
      const boosted = resolveAliasTarget(campus, kind, id);
      if (boosted) add({ ...boosted, score: 1000 });
    }
  }

  for (const building of campus.buildings) {
    const score = scoreMatch(query, building.name, building.abbreviation, ...building.aliases, building.category);
    if (score > 0) {
      add({ id: building.id, kind: "building", title: building.name, subtitle: building.description, buildingId: building.id, score });
    }

    for (const room of building.rooms) {
      const score = scoreMatch(query, room.number, room.name, `room ${room.number}`, `${building.abbreviation} ${room.number}`);
      if (score > 0) {
        add({
          id: room.id,
          kind: "room",
          title: room.name ? `${room.name} — Room ${room.number}` : `Room ${room.number}`,
          subtitle: building.name,
          buildingId: building.id,
          score
        });
      }
    }

    for (const dept of building.departments) {
      const score = scoreMatch(query, dept.name, dept.abbreviation);
      if (score > 0) {
        add({ id: dept.id, kind: "department", title: dept.name, subtitle: building.name, buildingId: building.id, score });
      }
    }
  }

  for (const service of campus.services) {
    const score = scoreMatch(query, service.name, service.category.replace(/-/g, " "));
    if (score > 0) {
      const building = getBuilding(campus, service.buildingId);
      add({ id: service.id, kind: "service", title: service.name, subtitle: building?.name ?? "", buildingId: service.buildingId, score });
    }
  }

  for (const event of campus.events) {
    const score = scoreMatch(query, event.name);
    if (score > 0) {
      add({ id: event.id, kind: "event", title: event.name, subtitle: event.date, buildingId: event.venueBuildingId, score });
    }
  }

  for (const lot of campus.parkingLots) {
    const score = scoreMatch(query, lot.name, "parking");
    if (score > 0) {
      add({ id: lot.id, kind: "parking", title: lot.name, subtitle: lot.closed ? "Closed today" : "Parking lot", buildingId: "", score });
    }
  }

  for (const group of AMENITY_KEYWORDS) {
    if (group.keywords.some((k) => query.includes(k) || k.includes(query))) {
      for (const building of campus.buildings) {
        for (const amenity of building.amenities) {
          if (amenity.type === group.type) {
            // Restroom/accessible-restroom/service-animal-relief/lactation-room results lead with what the amenity
            // IS (so "lactation room" search results are recognizable as one), not just where it is.
            const isFacilityCategory = FACILITY_SEARCH_AMENITY_TYPES.has(group.type);
            add({
              id: amenity.id,
              kind: "amenity",
              title: isFacilityCategory ? `${FACILITY_CATEGORY_META[group.type as FacilityCategory].label} — ${building.name}` : amenity.label,
              subtitle: isFacilityCategory ? amenity.label : building.name,
              buildingId: building.id,
              score: 70
            });
          }
        }
      }
    }
  }

  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Search result -> destination resolution
// ---------------------------------------------------------------------------

export function destinationTargetFromSearchResult(campus: Campus, result: SearchResult): DestinationTarget | null {
  const building = getBuilding(campus, result.buildingId);
  if (!building) return null;

  switch (result.kind) {
    case "building":
      return { buildingId: building.id };
    case "room": {
      const room = building.rooms.find((r) => r.id === result.id);
      return { buildingId: building.id, title: room?.name ?? result.title, roomNumber: room?.number, floor: room?.floor };
    }
    case "department": {
      const dept = building.departments.find((d) => d.id === result.id);
      const room = dept?.roomId ? building.rooms.find((r) => r.id === dept.roomId) : undefined;
      return { buildingId: building.id, title: dept?.name ?? result.title, roomNumber: room?.number, floor: room?.floor ?? dept?.floor };
    }
    case "service": {
      const service = campus.services.find((s) => s.id === result.id);
      const dept = service?.departmentId ? building.departments.find((d) => d.id === service.departmentId) : undefined;
      const room = dept?.roomId ? building.rooms.find((r) => r.id === dept.roomId) : undefined;
      return {
        buildingId: building.id,
        title: service?.name ?? result.title,
        roomNumber: room?.number,
        floor: room?.floor ?? dept?.floor,
        eligibility: "visitor"
      };
    }
    case "amenity":
      return { buildingId: building.id, title: result.title };
    default:
      return { buildingId: building.id, title: result.title };
  }
}

// ---------------------------------------------------------------------------
// Events & alerts helpers
// ---------------------------------------------------------------------------

export function upcomingEvents(campus: Campus, now: Date = new Date(), limit = 20) {
  const todayKey = now.toISOString().slice(0, 10);
  return campus.events
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, limit);
}

export function activeAlerts(campus: Campus) {
  return campus.alerts.filter((a) => a.active);
}

function resolveAliasTarget(campus: Campus, kind: string, id: string): SearchResult | null {
  switch (kind) {
    case "building": {
      const b = getBuilding(campus, id);
      return b ? { id: b.id, kind: "building", title: b.name, subtitle: b.description, buildingId: b.id, score: 0 } : null;
    }
    case "room": {
      for (const b of campus.buildings) {
        const room = b.rooms.find((r) => r.id === id);
        if (room) {
          return {
            id: room.id,
            kind: "room",
            title: room.name ? `${room.name} — Room ${room.number}` : `Room ${room.number}`,
            subtitle: b.name,
            buildingId: b.id,
            score: 0
          };
        }
      }
      return null;
    }
    case "service": {
      const svc = campus.services.find((s) => s.id === id);
      if (!svc) return null;
      const b = getBuilding(campus, svc.buildingId);
      return { id: svc.id, kind: "service", title: svc.name, subtitle: b?.name ?? "", buildingId: svc.buildingId, score: 0 };
    }
    case "event": {
      const evt = campus.events.find((e) => e.id === id);
      return evt ? { id: evt.id, kind: "event", title: evt.name, subtitle: evt.date, buildingId: evt.venueBuildingId, score: 0 } : null;
    }
    case "parking": {
      const lot = campus.parkingLots.find((p) => p.id === id);
      return lot ? { id: lot.id, kind: "parking", title: lot.name, subtitle: "Parking lot", buildingId: "", score: 0 } : null;
    }
    case "amenity": {
      for (const b of campus.buildings) {
        const amenity = b.amenities.find((a) => a.type === id);
        if (amenity) return { id: amenity.id, kind: "amenity", title: amenity.label, subtitle: b.name, buildingId: b.id, score: 0 };
      }
      return null;
    }
    default:
      return null;
  }
}
