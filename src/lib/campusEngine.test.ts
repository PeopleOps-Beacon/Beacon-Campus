import { describe, expect, it } from "vitest";
import { BEACON_UNIVERSITY } from "../data/beaconUniversity";
import { DEFAULT_PREFERENCES } from "../types/campus";
import {
  computeRoutePlan,
  facilityAccessible,
  findShortestPath,
  getDestinationIntel,
  journeySummaryRows,
  recommendEntrance,
  recommendFacility,
  resolveParkingForBuilding,
  search
} from "./campusEngine";

describe("findShortestPath", () => {
  it("computes the Bowman Field -> Long Hall walk in 8 minutes", () => {
    const result = findShortestPath(BEACON_UNIVERSITY, "green", "richardson");
    expect(result).not.toBeNull();
    expect(result!.minutes).toBe(8);
    expect(result!.path).toContain("library-plaza");
  });

  it("computes Visitor Lot A -> Admissions in 4 minutes", () => {
    const result = findShortestPath(BEACON_UNIVERSITY, "lot-a", "admissions");
    expect(result!.minutes).toBe(4);
  });

  it("excludes non-accessible edges when preferStepFree is set", () => {
    const fast = findShortestPath(BEACON_UNIVERSITY, "north-quad", "fine-arts");
    const accessible = findShortestPath(BEACON_UNIVERSITY, "north-quad", "fine-arts", { preferStepFree: true });
    expect(fast!.minutes).toBe(2);
    expect(accessible!.minutes).toBe(4);
  });

  it("routes through the calmer Reflection Pond when calmRoute is preferred", () => {
    const direct = findShortestPath(BEACON_UNIVERSITY, "green", "union-plaza");
    const calm = findShortestPath(BEACON_UNIVERSITY, "green", "union-plaza", { calmRoute: true });
    expect(direct!.minutes).toBe(2);
    expect(calm!.path).toContain("garden-walk");
    expect(calm!.minutes).toBe(4);
  });

  it("also avoids the busy plaza when avoidCrowds is preferred", () => {
    const crowdAware = findShortestPath(BEACON_UNIVERSITY, "green", "union-plaza", { avoidCrowds: true });
    expect(crowdAware!.path).toContain("garden-walk");
  });
});

describe("recommendEntrance", () => {
  it("substitutes Long Hall's closed west entrance with the south entrance", () => {
    const richardson = BEACON_UNIVERSITY.buildings.find((b) => b.id === "richardson")!;
    const rec = recommendEntrance(BEACON_UNIVERSITY, richardson);
    expect(rec.entrance.id).toBe("richardson-south");
    expect(rec.substituted).toBe(true);
    expect(rec.addedMinutes).toBe(2);
  });

  it("always recommends the accessible entrance when step-free is preferred", () => {
    const richardson = BEACON_UNIVERSITY.buildings.find((b) => b.id === "richardson")!;
    const rec = recommendEntrance(BEACON_UNIVERSITY, richardson, { preferStepFree: true });
    expect(rec.entrance.id).toBe(richardson.accessibleEntranceId);
  });

  it("recommends Old Main's east entrance with no substitution needed", () => {
    const admissions = BEACON_UNIVERSITY.buildings.find((b) => b.id === "admissions")!;
    const rec = recommendEntrance(BEACON_UNIVERSITY, admissions);
    expect(rec.entrance.id).toBe("admissions-east");
    expect(rec.substituted).toBe(false);
  });
});

describe("data provenance", () => {
  it("gives every building and parking lot a provenance status", () => {
    for (const building of BEACON_UNIVERSITY.buildings) {
      expect(["verified", "development-fixture", "derived"]).toContain(building.provenance.status);
    }
    for (const lot of BEACON_UNIVERSITY.parkingLots) {
      expect(["verified", "development-fixture", "derived"]).toContain(lot.provenance.status);
    }
  });

  it("marks real, cited Clemson buildings as verified with a source", () => {
    const sikes = BEACON_UNIVERSITY.buildings.find((b) => b.id === "founders")!;
    expect(sikes.name).toBe("Sikes Hall");
    expect(sikes.provenance.status).toBe("verified");
    expect(sikes.provenance.source).toBeTruthy();
  });

  it("exposes a campus-level data disclosure with citations", () => {
    expect(BEACON_UNIVERSITY.dataDisclosure.summary.length).toBeGreaterThan(0);
    expect(BEACON_UNIVERSITY.dataDisclosure.sources.length).toBeGreaterThan(5);
  });
});

describe("resolveParkingForBuilding", () => {
  it("falls back away from a closed lot", () => {
    const athletics = BEACON_UNIVERSITY.buildings.find((b) => b.id === "athletics-center")!;
    const rec = resolveParkingForBuilding(BEACON_UNIVERSITY, athletics, { eligibility: "visitor" });
    expect(rec).toBeDefined();
    expect(rec!.lot.closed).not.toBe(true);
  });
});

describe("getDestinationIntel / computeRoutePlan", () => {
  it("builds Jordan's BIO 101 destination intel end to end", () => {
    const intel = getDestinationIntel(BEACON_UNIVERSITY, { buildingId: "richardson", roomNumber: "204", floor: 2, title: "BIO 101" }, { fromNodeId: "green" });
    expect(intel).not.toBeNull();
    expect(intel!.walkMinutes).toBe(10); // 8 min path + 2 min entrance-closure adjustment
    expect(intel!.recommendedEntrance.id).toBe("richardson-south");
    expect(intel!.activeAlerts.length).toBeGreaterThan(0);
  });

  it("resolves floor from the room number when the caller only supplies roomNumber", () => {
    const intel = getDestinationIntel(BEACON_UNIVERSITY, { buildingId: "richardson", roomNumber: "204" }, { fromNodeId: "green" });
    expect(intel!.floor).toBe(2);
  });

  it("produces a route plan with landmark and arrival steps", () => {
    const plan = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "richardson", roomNumber: "204", floor: 2 }, { fromNodeId: "green" });
    expect(plan).not.toBeNull();
    const categories = plan!.steps.map((s) => s.category);
    expect(categories).toContain("advisory");
    expect(categories).toContain("landmark");
    expect(categories).toContain("arrival");
    expect(plan!.steps[plan!.steps.length - 1].instruction).toMatch(/Room 204/);
  });

  it("stretches the walk estimate by 25% when extraTime is preferred", () => {
    const base = getDestinationIntel(
      BEACON_UNIVERSITY,
      { buildingId: "richardson", roomNumber: "204" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES }
    );
    const relaxed = getDestinationIntel(
      BEACON_UNIVERSITY,
      { buildingId: "richardson", roomNumber: "204" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, extraTime: true } }
    );
    expect(base!.walkMinutes).toBe(10);
    expect(relaxed!.walkMinutes).toBe(12); // Math.round(8 * 1.25) + the 2-minute entrance adjustment
  });

  it("routes through a nearby restroom-equipped building when restroomStop is preferred", () => {
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "stadium" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, restroomStop: true } }
    );
    expect(plan).not.toBeNull();
    expect(plan!.waypoints.length).toBe(1);
    expect(plan!.path).toContain(plan!.waypoints[0].buildingId);
    expect(plan!.steps.some((s) => s.category === "waypoint" && s.instruction.toLowerCase().includes("restroom"))).toBe(true);
  });

  it("uses shorter phrasing when simplifiedDirections is preferred", () => {
    const normal = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "richardson", roomNumber: "204" }, { fromNodeId: "green" });
    const simplified = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "richardson", roomNumber: "204" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, simplifiedDirections: true } }
    );
    const normalArrival = normal!.steps[normal!.steps.length - 1].instruction;
    const simpleArrival = simplified!.steps[simplified!.steps.length - 1].instruction;
    expect(simpleArrival.length).toBeLessThan(normalArrival.length);
  });

  it("adds a reassurance step when reassurance is preferred", () => {
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "richardson", roomNumber: "204" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, reassurance: true } }
    );
    expect(plan!.steps.some((s) => s.category === "reassurance")).toBe(true);
  });
});

describe("facility waypoints (restroom, accessible restroom, service animal relief, lactation room)", () => {
  it("computes a standard route with no waypoints when none are requested", () => {
    const plan = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "library" }, { fromNodeId: "green", preferences: DEFAULT_PREFERENCES });
    expect(plan!.waypoints).toEqual([]);
  });

  it("computes an accessible route with no waypoints when none are requested", () => {
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, stepFree: true } }
    );
    expect(plan!.waypoints).toEqual([]);
    expect(plan!.destination.recommendedEntrance.accessible).toBe(true);
  });

  it("ranks restroom recommendations by added detour time, cheapest first", () => {
    const rec = recommendFacility(BEACON_UNIVERSITY, "restroom", "green", "library", DEFAULT_PREFERENCES);
    expect(rec.options.length).toBeGreaterThan(1);
    for (let i = 1; i < rec.options.length; i++) {
      expect(rec.options[i].addedMinutes).toBeGreaterThanOrEqual(rec.options[i - 1].addedMinutes);
    }
  });

  it("recommends accessible restroom, service animal relief, and lactation room facilities", () => {
    for (const category of ["accessible-restroom", "service-animal-relief", "lactation-room"] as const) {
      const rec = recommendFacility(BEACON_UNIVERSITY, category, "green", "library", DEFAULT_PREFERENCES);
      expect(rec.options.length).toBeGreaterThan(0);
      expect(rec.options[0].facility.category).toBe(category);
    }
  });

  it("builds a route that intentionally passes through a chosen restroom before the destination", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-jefferson-restroom")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [facility.id] }
    );
    expect(plan!.waypoints).toHaveLength(1);
    expect(plan!.path).toContain("jefferson");
    expect(plan!.steps.some((s) => s.category === "waypoint" && s.waypointIndex === 0)).toBe(true);
  });

  it("builds a route with a chosen accessible restroom waypoint", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-union-arestroom")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [facility.id] }
    );
    expect(plan!.waypoints[0].category).toBe("accessible-restroom");
    expect(plan!.path).toContain("student-union");
  });

  it("builds a route with a chosen service animal relief waypoint — a real routing leg, not a nearby suggestion", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-union-service-animal")!;
    const direct = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "library" }, { fromNodeId: "green", preferences: DEFAULT_PREFERENCES });
    const withStop = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [facility.id] }
    );
    expect(withStop!.waypoints).toHaveLength(1);
    expect(withStop!.path).toContain("student-union");
    expect(withStop!.totalMinutes).toBeGreaterThan(direct!.totalMinutes);
    // the destination is still the same building — the waypoint is a detour through it, not a replacement
    expect(withStop!.destination.buildingId).toBe(direct!.destination.buildingId);
  });

  it("builds a route with a chosen lactation room waypoint", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-founders-lactation")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [facility.id] }
    );
    expect(plan!.waypoints[0].category).toBe("lactation-room");
    expect(plan!.path).toContain("founders");
  });

  it("applies accessibility preferences to every segment of a multi-stop route, not just the first leg", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-union-arestroom")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "stadium" },
      { fromNodeId: "green", preferences: { ...DEFAULT_PREFERENCES, stepFree: true }, waypointFacilityIds: [facility.id] }
    );
    expect(plan!.waypoints).toHaveLength(1);
    for (let i = 1; i < plan!.path.length; i++) {
      const edge = BEACON_UNIVERSITY.pathEdges.find(
        (e) => (e.from === plan!.path[i - 1] && e.to === plan!.path[i]) || (e.from === plan!.path[i] && e.to === plan!.path[i - 1])
      );
      expect(edge?.accessible).not.toBe(false);
    }
  });

  it("routes through multiple waypoints in the order they were added", () => {
    const restroom = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-jefferson-restroom")!;
    const relief = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-union-service-animal")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [restroom.id, relief.id] }
    );
    expect(plan!.waypoints).toHaveLength(2);
    const waypointSteps = plan!.steps.filter((s) => s.category === "waypoint");
    expect(waypointSteps.map((s) => s.waypointIndex)).toEqual([0, 1]);
  });

  it("removing a waypoint (omitting it) returns to the direct route", () => {
    const withStop = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: ["facility-union-service-animal"] }
    );
    const withoutStop = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "library" }, { fromNodeId: "green", preferences: DEFAULT_PREFERENCES });
    expect(withStop!.waypoints).toHaveLength(1);
    expect(withoutStop!.waypoints).toHaveLength(0);
    expect(withStop!.totalMinutes).toBeGreaterThan(withoutStop!.totalMinutes);
  });

  it("changing the waypoint produces a different route", () => {
    const viaUnion = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: ["facility-union-lactation"] }
    );
    const viaFounders = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: ["facility-founders-lactation"] }
    );
    expect(viaUnion!.waypoints[0].buildingId).not.toBe(viaFounders!.waypoints[0].buildingId);
    expect(viaUnion!.path).not.toEqual(viaFounders!.path);
  });

  it("simulates adding a stop during active navigation: recalculating from the current position preserves the final destination", () => {
    const original = computeRoutePlan(BEACON_UNIVERSITY, { buildingId: "library" }, { fromNodeId: "green", preferences: DEFAULT_PREFERENCES });
    const currentPositionNodeId = original!.path[Math.floor(original!.path.length / 2)];
    const recalculated = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: currentPositionNodeId, preferences: DEFAULT_PREFERENCES, waypointFacilityIds: ["facility-union-service-animal"] }
    );
    expect(recalculated!.destination.buildingId).toBe(original!.destination.buildingId);
    expect(recalculated!.waypoints).toHaveLength(1);
  });

  it("returns no recommendations when a category's only nearby instances are the start or destination themselves", () => {
    const rec = recommendFacility(BEACON_UNIVERSITY, "service-animal-relief", "student-union", "library", DEFAULT_PREFERENCES);
    expect(rec.options).toHaveLength(0);
  });

  it("treats an upper-floor facility as inaccessible unless its building has an elevator", () => {
    const buildingWithoutElevator = BEACON_UNIVERSITY.buildings.find((b) => b.id === "veterans")!;
    expect(buildingWithoutElevator.amenities.some((a) => a.type === "elevator")).toBe(false);
    const upperFloorFacility = {
      id: "test-only",
      category: "restroom" as const,
      name: "test",
      buildingId: "veterans",
      floor: 2,
      provenance: { status: "development-fixture" as const }
    };
    expect(facilityAccessible(BEACON_UNIVERSITY, upperFloorFacility)).toBe(false);
    expect(facilityAccessible(BEACON_UNIVERSITY, { ...upperFloorFacility, floor: 1 })).toBe(true);
  });

  it("excludes accessibility-incompatible facilities from recommendations rather than silently offering them", () => {
    const buildingWithoutElevator = BEACON_UNIVERSITY.buildings.find((b) => b.id === "veterans")!;
    const incompatible = {
      id: "test-incompatible",
      category: "restroom" as const,
      name: "test",
      buildingId: buildingWithoutElevator.id,
      floor: 3,
      provenance: { status: "development-fixture" as const }
    };
    const campusWithIncompatibleFacility = { ...BEACON_UNIVERSITY, facilities: [...BEACON_UNIVERSITY.facilities, incompatible] };
    const rec = recommendFacility(campusWithIncompatibleFacility, "restroom", "green", "library", { ...DEFAULT_PREFERENCES, stepFree: true });
    expect(rec.options.some((o) => o.facility.id === "test-incompatible")).toBe(false);
    expect(rec.excludedForAccessibility).toBeGreaterThan(0);
  });

  it("includes any added stops in the arrival journey summary", () => {
    const facility = BEACON_UNIVERSITY.facilities.find((f) => f.id === "facility-union-service-animal")!;
    const plan = computeRoutePlan(
      BEACON_UNIVERSITY,
      { buildingId: "library" },
      { fromNodeId: "green", preferences: DEFAULT_PREFERENCES, waypointFacilityIds: [facility.id] }
    )!;
    const rows = journeySummaryRows(plan, "custom", DEFAULT_PREFERENCES);
    const stopsRow = rows.find((r) => r.label === "Stops");
    expect(stopsRow?.value).toContain("Service Animal Relief Area");
  });
});

describe("search", () => {
  it("resolves 'BIO 101' to Long Hall Room 204 via the alias map", () => {
    const results = search(BEACON_UNIVERSITY, "bio 101");
    expect(results[0].kind).toBe("room");
    expect(results[0].title).toMatch(/204/);
  });

  it("groups multiple relevant results for 'science'", () => {
    const results = search(BEACON_UNIVERSITY, "science");
    const kinds = new Set(results.map((r) => r.kind));
    expect(results.length).toBeGreaterThan(2);
    expect(kinds.has("building") || kinds.has("department") || kinds.has("service")).toBe(true);
  });

  it("finds Financial Aid as a service", () => {
    const results = search(BEACON_UNIVERSITY, "financial aid");
    expect(results.some((r) => r.kind === "service" && r.title === "Financial Aid")).toBe(true);
  });

  it("finds a service animal relief area by search", () => {
    const results = search(BEACON_UNIVERSITY, "service animal");
    expect(results.some((r) => r.kind === "amenity" && r.title.toLowerCase().includes("relief"))).toBe(true);
  });

  it("finds a lactation room by search, including the 'nursing room' synonym, titled by what it is", () => {
    const byName = search(BEACON_UNIVERSITY, "lactation room");
    const match = byName.find((r) => r.kind === "amenity" && r.id === "union-lactation");
    expect(match?.title).toBe("Lactation Room — Hendrix Student Center");
    const bySynonym = search(BEACON_UNIVERSITY, "nursing room");
    expect(bySynonym.some((r) => r.kind === "amenity" && r.id === "union-lactation")).toBe(true);
  });
});
