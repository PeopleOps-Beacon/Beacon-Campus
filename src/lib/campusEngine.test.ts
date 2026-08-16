import { describe, expect, it } from "vitest";
import { BEACON_UNIVERSITY } from "../data/beaconUniversity";
import { DEFAULT_PREFERENCES } from "../types/campus";
import {
  computeRoutePlan,
  findShortestPath,
  getDestinationIntel,
  recommendEntrance,
  resolveParkingForBuilding,
  search
} from "./campusEngine";

describe("findShortestPath", () => {
  it("computes the Green -> Richardson Science Hall walk in 8 minutes", () => {
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

  it("routes through the calmer Reflection Garden when calmRoute is preferred", () => {
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
  it("substitutes Richardson's closed west entrance with the south entrance", () => {
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

  it("recommends Admissions' east entrance with no substitution needed", () => {
    const admissions = BEACON_UNIVERSITY.buildings.find((b) => b.id === "admissions")!;
    const rec = recommendEntrance(BEACON_UNIVERSITY, admissions);
    expect(rec.entrance.id).toBe("admissions-east");
    expect(rec.substituted).toBe(false);
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
    expect(plan!.waypoint).toBeDefined();
    expect(plan!.path).toContain(plan!.waypoint!.building.id);
    expect(plan!.steps.some((s) => s.category === "accessibility" && s.instruction.toLowerCase().includes("restroom"))).toBe(true);
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

describe("search", () => {
  it("resolves 'BIO 101' to Richardson Room 204 via the alias map", () => {
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
});
