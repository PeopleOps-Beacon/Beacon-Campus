/**
 * Executive Dashboard demo data — illustrative, seeded figures representing
 * a fictional Beacon Campus deployment. Beacon Campus has no backend or
 * occupancy sensors, so every number here is clearly a modeled demo dataset,
 * not observed production telemetry. Real, genuinely-tracked usage (this
 * browser's own searches/destinations/preference toggles, via useAnalytics)
 * is surfaced separately in the Overview and is never mixed into these
 * modeled figures without a label distinguishing the two.
 *
 * Numbers are deterministic (not Math.random()) so the dashboard doesn't
 * jitter between renders, and they scale by date range via fixed multipliers
 * rather than independent random datasets per range — real deployments
 * would show smoothly related, not arbitrarily different, numbers as the
 * window widens.
 */

export type DateRangeId = "today" | "7d" | "30d" | "semester" | "academic-year" | "custom";

export const DATE_RANGES: { id: DateRangeId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "semester", label: "Semester" },
  { id: "academic-year", label: "Academic Year" },
  { id: "custom", label: "Custom" }
];

/** Volume scales with the window length; rates/percentages don't. */
const RANGE_SCALE: Record<DateRangeId, number> = {
  today: 1 / 28,
  "7d": 7 / 28,
  "30d": 1,
  semester: 15 * (30 / 28),
  "academic-year": 32 * (30 / 28),
  custom: 7 / 28
};

export function scaleVolume(base30d: number, range: DateRangeId): number {
  return Math.max(1, Math.round(base30d * RANGE_SCALE[range]));
}

export type RoleId =
  | "executive"
  | "accessibility"
  | "facilities"
  | "student-affairs"
  | "campus-safety"
  | "admissions"
  | "events"
  | "it";

export const ROLES: { id: RoleId; label: string; blurb: string }[] = [
  { id: "executive", label: "Executive Leadership", blurb: "Adoption, trends, and opportunities at a glance" },
  { id: "accessibility", label: "Accessibility Services", blurb: "Accessibility and sensory routing first" },
  { id: "facilities", label: "Facilities", blurb: "Physical friction, entrances, and elevators first" },
  { id: "student-affairs", label: "Student Affairs", blurb: "Student experience and wellbeing signals" },
  { id: "campus-safety", label: "Campus Safety", blurb: "Assistance requests and recovery activity" },
  { id: "admissions", label: "Admissions", blurb: "Visitor journeys and parking-to-destination flow" },
  { id: "events", label: "Events", blurb: "Event-driven demand and readiness" },
  { id: "it", label: "IT", blurb: "Platform health and data quality" }
];

/** Section ids in the Executive Dashboard's own sub-navigation. */
export type SectionId =
  | "overview"
  | "map"
  | "friction"
  | "accessibility"
  | "sensory"
  | "destinations"
  | "visitors"
  | "events"
  | "patterns"
  | "insights"
  | "opportunities"
  | "improvements"
  | "reassurance"
  | "compare"
  | "reports";

/** Per-role priority ordering — reorders the same sections, never hides them. */
export const ROLE_SECTION_ORDER: Record<RoleId, SectionId[]> = {
  executive: ["overview", "insights", "opportunities", "map", "friction", "accessibility", "sensory", "destinations", "visitors", "events", "patterns", "improvements", "reassurance", "compare", "reports"],
  accessibility: ["overview", "accessibility", "sensory", "reassurance", "opportunities", "map", "friction", "improvements", "destinations", "visitors", "events", "patterns", "insights", "compare", "reports"],
  facilities: ["overview", "friction", "map", "improvements", "accessibility", "opportunities", "sensory", "destinations", "visitors", "events", "patterns", "insights", "reassurance", "compare", "reports"],
  "student-affairs": ["overview", "destinations", "sensory", "reassurance", "events", "insights", "map", "friction", "accessibility", "opportunities", "visitors", "patterns", "improvements", "compare", "reports"],
  "campus-safety": ["overview", "friction", "map", "opportunities", "accessibility", "sensory", "insights", "events", "destinations", "visitors", "patterns", "improvements", "reassurance", "compare", "reports"],
  admissions: ["overview", "visitors", "destinations", "events", "map", "insights", "friction", "accessibility", "sensory", "opportunities", "patterns", "improvements", "reassurance", "compare", "reports"],
  events: ["overview", "events", "patterns", "map", "friction", "insights", "accessibility", "sensory", "destinations", "visitors", "opportunities", "improvements", "reassurance", "compare", "reports"],
  it: ["overview", "reports", "compare", "map", "friction", "accessibility", "sensory", "destinations", "visitors", "events", "patterns", "insights", "opportunities", "improvements", "reassurance"]
};

export type Severity = "low" | "moderate" | "high" | "priority";
export type Confidence = "emerging" | "moderate" | "strong";
export type OpportunityStatus = "new" | "under-review" | "planned" | "in-progress" | "resolved";

// ---------------------------------------------------------------------------
// Executive Overview KPIs (base = trailing 30 days)
// ---------------------------------------------------------------------------

export interface Kpi {
  id: string;
  label: string;
  baseValue: number;
  previousValue: number;
  format: "number" | "percent" | "minutes";
  tooltip: string;
  trend: number[]; // 8-point sparkline, relative shape (not scaled by range)
  primary: boolean;
}

export const KPIS: Kpi[] = [
  {
    id: "journeys",
    label: "Total Beacon Journeys",
    baseValue: 8420,
    previousValue: 7610,
    format: "number",
    tooltip: "Every completed or attempted guided route started in Beacon Campus during the selected period.",
    trend: [58, 61, 64, 60, 68, 72, 75, 82],
    primary: true
  },
  {
    id: "unique-users",
    label: "Unique Users",
    baseValue: 3120,
    previousValue: 2960,
    format: "number",
    tooltip: "Distinct anonymous devices that started at least one journey. Beacon does not require an account.",
    trend: [40, 42, 41, 45, 47, 46, 49, 52],
    primary: true
  },
  {
    id: "completion-rate",
    label: "Route Completion Rate",
    baseValue: 91.4,
    previousValue: 89.8,
    format: "percent",
    tooltip: "Share of started journeys where the traveler reached the arrival screen for their destination.",
    trend: [86, 87, 88, 87, 89, 90, 91, 91],
    primary: true
  },
  {
    id: "avg-journey-time",
    label: "Average Journey Time",
    baseValue: 8.6,
    previousValue: 9.1,
    format: "minutes",
    tooltip: "Mean time from Start Route to arrival, across all completed journeys.",
    trend: [9.4, 9.2, 9.0, 9.1, 8.9, 8.8, 8.7, 8.6],
    primary: true
  },
  {
    id: "accessibility-routes",
    label: "Accessibility-Optimized Routes",
    baseValue: 1487,
    previousValue: 1290,
    format: "number",
    tooltip: "Journeys where step-free, mobility, or another accessibility preference actually changed the route.",
    trend: [12, 13, 14, 15, 16, 17, 17, 18],
    primary: true
  },
  {
    id: "sensory-routes",
    label: "Lower-Sensory Routes",
    baseValue: 642,
    previousValue: 511,
    format: "number",
    tooltip: "Journeys using Beacon's calmer-route preference, which favors quieter, lower-stimulation paths.",
    trend: [6, 7, 6, 8, 9, 9, 10, 11],
    primary: true
  },
  {
    id: "step-free-routes",
    label: "Step-Free Routes",
    baseValue: 1054,
    previousValue: 902,
    format: "number",
    tooltip: "Journeys that hard-filtered to ramps, elevators, and accessible entrances only.",
    trend: [10, 11, 11, 12, 13, 13, 14, 15],
    primary: false
  },
  {
    id: "successful-arrivals",
    label: "Successful Arrivals",
    baseValue: 7698,
    previousValue: 6835,
    format: "number",
    tooltip: "Journeys that reached the Arrival screen for the traveler's true final destination.",
    trend: [55, 57, 59, 58, 63, 66, 69, 74],
    primary: false
  },
  {
    id: "recovery-mode",
    label: "Recovery Mode Activations",
    baseValue: 94,
    previousValue: 71,
    format: "number",
    tooltip: "Times a traveler used Rest & Resume or a calming pause mid-journey.",
    trend: [4, 5, 6, 5, 8, 9, 11, 12],
    primary: false
  },
  {
    id: "assistance-requests",
    label: "Assistance Requests",
    baseValue: 156,
    previousValue: 168,
    format: "number",
    tooltip: "Times a traveler tapped Request Assistance during active navigation.",
    trend: [22, 20, 19, 21, 18, 17, 16, 15],
    primary: false
  },
  {
    id: "recalculations",
    label: "Routes Recalculated",
    baseValue: 918,
    previousValue: 1004,
    format: "number",
    tooltip: "Times Beacon rebuilt a route mid-journey — from an Add a Stop, an entrance closure, or a manual restart.",
    trend: [38, 36, 35, 33, 31, 30, 29, 28],
    primary: false
  },
  {
    id: "rest-resume",
    label: "Rest & Resume Uses",
    baseValue: 211,
    previousValue: 174,
    format: "number",
    tooltip: "Times a traveler paused a journey and resumed it later from the same point.",
    trend: [8, 9, 9, 10, 11, 12, 13, 14],
    primary: false
  }
];

export const HEALTH_SUMMARY = [
  { id: "experience", label: "Campus Experience", status: "Strong", tone: "success" as const, note: "Completion and adoption both trending up over the selected period." },
  { id: "accessibility", label: "Accessibility Routing", status: "Stable", tone: "info" as const, note: "Demand is steady; one entrance is showing elevated rerouting (see Opportunities)." },
  { id: "friction", label: "Navigation Friction", status: "3 areas need attention", tone: "warning" as const, note: "Long Hall, Cooper Library's east approach, and Lot C wayfinding stand out." },
  { id: "sensory", label: "Sensory Experience", status: "2 emerging patterns", tone: "info" as const, note: "Midday Student Center avoidance and a finals-week rise in quiet-space searches." }
];

// ---------------------------------------------------------------------------
// Campus Experience Map
// ---------------------------------------------------------------------------

export type MapLayerId =
  | "volume"
  | "friction"
  | "recalculations"
  | "accessibility"
  | "step-free"
  | "sensory"
  | "recovery"
  | "assistance"
  | "avoided"
  | "high-demand"
  | "reassurance";

export const MAP_LAYERS: { id: MapLayerId; label: string }[] = [
  { id: "volume", label: "Journey Volume" },
  { id: "friction", label: "Navigation Friction" },
  { id: "recalculations", label: "Route Recalculations" },
  { id: "accessibility", label: "Accessibility Routes" },
  { id: "step-free", label: "Step-Free Routes" },
  { id: "sensory", label: "Lower-Sensory Routes" },
  { id: "recovery", label: "Recovery Mode Activity" },
  { id: "assistance", label: "Assistance Requests" },
  { id: "avoided", label: "Frequently Avoided Areas" },
  { id: "high-demand", label: "High-Demand Destinations" },
  { id: "reassurance", label: "Reassurance Point Usage" }
];

export interface MapHotspot {
  id: string;
  label: string;
  point: { x: number; y: number };
  journeys30d: number;
  rerouteDeltaPct: number; // vs. campus average
  stepFreeRoutes30d: number;
  sensoryRoutes30d: number;
  recoveryActivations30d: number;
  assistanceRequests30d: number;
  trend: "up" | "down" | "flat";
  consideration: string;
  intensity: Partial<Record<MapLayerId, number>>; // 0-1 relative intensity for the visualization
}

export const MAP_HOTSPOTS: MapHotspot[] = [
  {
    id: "hendrix",
    label: "Hendrix Student Center",
    point: { x: 470, y: 330 },
    journeys30d: 3084,
    rerouteDeltaPct: 4,
    stepFreeRoutes30d: 312,
    sensoryRoutes30d: 268,
    recoveryActivations30d: 21,
    assistanceRequests30d: 18,
    trend: "up",
    consideration: "Highest overall traffic on campus — a strong candidate for a featured reassurance point at the main entrance.",
    intensity: { volume: 1, "high-demand": 1, sensory: 0.7, "step-free": 0.5 }
  },
  {
    id: "cooper-library-east",
    label: "R.M. Cooper Library — East Entrance",
    point: { x: 300, y: 250 },
    journeys30d: 1284,
    rerouteDeltaPct: 18,
    stepFreeRoutes30d: 402,
    sensoryRoutes30d: 156,
    recoveryActivations30d: 9,
    assistanceRequests30d: 14,
    trend: "up",
    consideration: "Review entrance signage and accessible approach from the east pedestrian corridor.",
    intensity: { volume: 0.55, friction: 0.9, recalculations: 0.85, accessibility: 0.9, "step-free": 0.85, assistance: 0.6 }
  },
  {
    id: "long-hall",
    label: "Long Hall",
    point: { x: 355, y: 205 },
    journeys30d: 1046,
    rerouteDeltaPct: 24,
    stepFreeRoutes30d: 88,
    sensoryRoutes30d: 41,
    recoveryActivations30d: 4,
    assistanceRequests30d: 11,
    trend: "up",
    consideration: "Recalculation rate is the highest of any academic building — worth a signage and pathway review from Student Lot C.",
    intensity: { volume: 0.4, friction: 1, recalculations: 1, avoided: 0.3 }
  },
  {
    id: "stadium",
    label: "Memorial Stadium",
    point: { x: 610, y: 470 },
    journeys30d: 512,
    rerouteDeltaPct: 6,
    stepFreeRoutes30d: 214,
    sensoryRoutes30d: 34,
    recoveryActivations30d: 27,
    assistanceRequests30d: 22,
    trend: "up",
    consideration: "Accessibility routing and Recovery Mode both spike on home game days — pattern is event-driven, not a standing issue.",
    intensity: { volume: 0.3, accessibility: 0.8, recovery: 1, assistance: 0.55, "high-demand": 0.4 }
  },
  {
    id: "sikes",
    label: "Sikes Hall (Admissions)",
    point: { x: 320, y: 400 },
    journeys30d: 2431,
    rerouteDeltaPct: 7,
    stepFreeRoutes30d: 168,
    sensoryRoutes30d: 52,
    recoveryActivations30d: 6,
    assistanceRequests30d: 9,
    trend: "up",
    consideration: "Heavy, healthy visitor volume from Visitor Lot A — no material friction detected.",
    intensity: { volume: 0.75, "high-demand": 0.85, "step-free": 0.4 }
  },
  {
    id: "hendrix-hallway",
    label: "Hendrix Student Center — Central Corridor",
    point: { x: 480, y: 345 },
    journeys30d: 640,
    rerouteDeltaPct: 2,
    stepFreeRoutes30d: 40,
    sensoryRoutes30d: 61,
    recoveryActivations30d: 8,
    assistanceRequests30d: 3,
    trend: "flat",
    consideration: "Lower-sensory routing avoids this corridor 31% more often at midday — an alternate quieter path may help during peak hours.",
    intensity: { avoided: 0.8, sensory: 0.6 }
  },
  {
    id: "martin-hall",
    label: "Martin Hall",
    point: { x: 505, y: 240 },
    journeys30d: 874,
    rerouteDeltaPct: -3,
    stepFreeRoutes30d: 61,
    sensoryRoutes30d: 28,
    recoveryActivations30d: 2,
    assistanceRequests30d: 2,
    trend: "flat",
    consideration: "No notable friction — a reliable baseline building for comparison.",
    intensity: { volume: 0.35 }
  }
];

// ---------------------------------------------------------------------------
// Navigation Friction Intelligence
// ---------------------------------------------------------------------------

export interface FrictionRow {
  id: string;
  location: string;
  signal: string;
  journeysAffected30d: number;
  trend: "up" | "down" | "flat";
  severity: Severity;
  insight: string;
  possibleFactors: string[];
}

export const FRICTION_ROWS: FrictionRow[] = [
  {
    id: "long-hall-lot-c",
    location: "Long Hall (from Student Lot C)",
    signal: "Most Recalculated Route",
    journeysAffected30d: 251,
    trend: "up",
    severity: "priority",
    insight: "Travelers approaching Long Hall from Student Lot C recalculated their route 2.4x more frequently than the campus average.",
    possibleFactors: ["Signage", "Entrance visibility", "Pathway configuration", "Accessible entrance identification"]
  },
  {
    id: "cooper-east",
    location: "R.M. Cooper Library — East Entrance",
    signal: "Highest Accessibility-Related Rerouting",
    journeysAffected30d: 231,
    trend: "up",
    severity: "high",
    insight: "Step-free routes to Cooper Library reroute through the east approach 18% more than the campus average for accessible entrances.",
    possibleFactors: ["Signage", "Accessible entrance identification", "Ramp visibility from the pedestrian corridor"]
  },
  {
    id: "hendrix-repeat-assist",
    location: "Hendrix Student Center — Main Entrance",
    signal: "Repeat Assistance Requests",
    journeysAffected30d: 46,
    trend: "flat",
    severity: "moderate",
    insight: "A small but steady share of travelers request assistance at the main entrance despite high overall traffic and completion.",
    possibleFactors: ["Entrance visibility", "Wayfinding at a high-traffic junction"]
  },
  {
    id: "martin-hall-delay",
    location: "Martin Hall",
    signal: "Longest Unexpected Delay",
    journeysAffected30d: 38,
    trend: "down",
    severity: "low",
    insight: "A small number of journeys ran longer than the predicted time, concentrated in a single week — no longer trending.",
    possibleFactors: ["Temporary construction (resolved)", "Seasonal foot traffic"]
  },
  {
    id: "sikes-abandon",
    location: "Sikes Hall — Visitor Approach",
    signal: "Journey Abandonment",
    journeysAffected30d: 29,
    trend: "flat",
    severity: "low",
    insight: "A small share of visitor journeys from Visitor Lot A end before arrival, consistent with visitors browsing rather than a routing problem.",
    possibleFactors: ["Visitor behavior (likely benign)", "Parking lot signage"]
  },
  {
    id: "stadium-gameday",
    location: "Memorial Stadium — North Concourse",
    signal: "Missed Turns",
    journeysAffected30d: 64,
    trend: "up",
    severity: "moderate",
    insight: "Missed-turn signals cluster tightly around home game days, suggesting an event-density effect rather than a standing path issue.",
    possibleFactors: ["Event crowd density", "Temporary signage during events"]
  }
];

// ---------------------------------------------------------------------------
// Accessibility Intelligence
// ---------------------------------------------------------------------------

export const ACCESSIBILITY_INTEL = {
  mostRequestedDestinations: [
    { name: "R.M. Cooper Library", journeys30d: 402 },
    { name: "Sikes Hall (Admissions)", journeys30d: 168 },
    { name: "Memorial Stadium", journeys30d: 214 },
    { name: "Redfern Health Center", journeys30d: 121 },
    { name: "Hendrix Student Center", journeys30d: 312 }
  ],
  mostUsedEntrances: [
    { name: "Cooper Library — East Entrance", uses30d: 402, note: "Automatic doors, ramp" },
    { name: "Sikes Hall — South Entrance", uses30d: 168, note: "Ramp, elevator lobby" },
    { name: "Memorial Stadium — Accessible Gate", uses30d: 214, note: "Elevated on game days" },
    { name: "Hendrix Student Center — East Entrance", uses30d: 205, note: "Automatic doors" }
  ],
  highestStepFreeDemandBuildings: [
    { name: "R.M. Cooper Library", demand30d: 402 },
    { name: "Memorial Stadium", demand30d: 214 },
    { name: "Hendrix Student Center", demand30d: 205 },
    { name: "Sikes Hall", demand30d: 168 },
    { name: "Long Hall", demand30d: 88 }
  ],
  accessibilityRerouteLocations: [
    { name: "R.M. Cooper Library — East Entrance", reroutes30d: 74, deltaPct: 18 },
    { name: "Memorial Stadium — Accessible Gate", reroutes30d: 31, deltaPct: 9 }
  ],
  elevatorsInJourneys: [
    { name: "R.M. Cooper Library — Main Elevator", journeys30d: 289 },
    { name: "Sikes Hall — East Wing Elevator", journeys30d: 141 },
    { name: "Hendrix Student Center — Central Elevator", journeys30d: 96 }
  ],
  opportunityAreas: [
    {
      id: "cooper-south-opportunity",
      location: "Cooper Library South Entrance",
      signal: "High step-free route demand + elevated rerouting",
      recommendation: "Review accessible entrance visibility and directional signage.",
      impactJourneys30d: 126
    }
  ]
};

// ---------------------------------------------------------------------------
// Sensory Experience Intelligence
// ---------------------------------------------------------------------------

export const SENSORY_INTEL = {
  lowerSensoryRequests30d: 642,
  lowerSensoryCompletionPct: 93.6,
  mostAvoidedAreas: [
    { name: "Hendrix Student Center — Central Corridor", avoidancePct: 31, window: "11:30 AM – 1:30 PM" },
    { name: "Sikes Hall — Main Lobby", avoidancePct: 14, window: "9:00 AM – 10:00 AM" }
  ],
  recoveryModeLocations: [
    { name: "Memorial Stadium concourse", activations30d: 27 },
    { name: "Hendrix Student Center", activations30d: 21 },
    { name: "R.M. Cooper Library", activations30d: 9 }
  ],
  restResumeUses30d: 211,
  quietSpaceSearches30d: 84,
  quietSpaceSearchesFinalsWeek: 152,
  quietSpaceRouting30d: 58,
  timeOfDay: [
    { period: "Morning", label: "6 – 11 AM", sensoryRoutes: 92, recoveryActivations: 8 },
    { period: "Midday", label: "11 AM – 2 PM", sensoryRoutes: 214, recoveryActivations: 19 },
    { period: "Afternoon", label: "2 – 6 PM", sensoryRoutes: 188, recoveryActivations: 24 },
    { period: "Evening", label: "6 PM – Midnight", sensoryRoutes: 96, recoveryActivations: 15 },
    { period: "Event periods", label: "Home games, move-in, etc.", sensoryRoutes: 52, recoveryActivations: 28 }
  ],
  insight: {
    text: "Beacon users selecting lower-sensory routing avoided the Student Center's central corridor 31% more frequently between 11:30 AM and 1:30 PM.",
    consideration: "Consider promoting an alternate corridor or a designated lower-sensory route during peak lunch-period traffic."
  }
};

/** 7 days × hours 6–24 (18 columns), relative demand 0-1. Monday=0 … Sunday=6. */
export const TIME_HEATMAP: number[][] = [
  [0.1, 0.15, 0.35, 0.55, 0.7, 0.6, 0.5, 0.65, 0.75, 0.6, 0.45, 0.4, 0.5, 0.6, 0.55, 0.4, 0.25, 0.15],
  [0.1, 0.18, 0.38, 0.58, 0.72, 0.62, 0.52, 0.66, 0.76, 0.6, 0.46, 0.4, 0.5, 0.6, 0.55, 0.4, 0.25, 0.15],
  [0.1, 0.16, 0.36, 0.56, 0.7, 0.6, 0.5, 0.65, 0.78, 0.62, 0.48, 0.42, 0.52, 0.62, 0.56, 0.42, 0.26, 0.16],
  [0.12, 0.18, 0.4, 0.6, 0.74, 0.64, 0.54, 0.68, 0.8, 0.64, 0.5, 0.44, 0.54, 0.64, 0.58, 0.44, 0.28, 0.18],
  [0.14, 0.2, 0.42, 0.62, 0.76, 0.66, 0.56, 0.7, 0.82, 0.68, 0.55, 0.5, 0.58, 0.66, 0.6, 0.46, 0.3, 0.2],
  [0.08, 0.12, 0.2, 0.3, 0.4, 0.42, 0.4, 0.48, 0.6, 0.9, 0.85, 0.7, 0.55, 0.45, 0.5, 0.55, 0.4, 0.22],
  [0.05, 0.08, 0.14, 0.2, 0.28, 0.3, 0.28, 0.32, 0.4, 0.5, 0.6, 0.55, 0.42, 0.35, 0.32, 0.28, 0.2, 0.12]
];
export const TIME_HEATMAP_HOURS = ["6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
export const TIME_HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------------------------------------------------------------------------
// Destination Intelligence
// ---------------------------------------------------------------------------

export interface DestinationRow {
  id: string;
  name: string;
  category: string;
  searches30d: number;
  completionPct: number;
  recalcPct: number;
  commonOrigin: string;
  peakUsage: string;
  trend: "up" | "down" | "flat";
}

export const DESTINATION_ROWS: DestinationRow[] = [
  { id: "sikes", name: "Sikes Hall (Admissions)", category: "Admissions", searches30d: 2431, completionPct: 92, recalcPct: 7, commonOrigin: "Visitor Lot A", peakUsage: "Mon–Fri, 9 AM–1 PM", trend: "up" },
  { id: "hendrix", name: "Hendrix Student Center", category: "Student Services", searches30d: 3084, completionPct: 95, recalcPct: 4, commonOrigin: "Campus core (walking)", peakUsage: "Weekdays, 11 AM–2 PM", trend: "up" },
  { id: "cooper", name: "R.M. Cooper Library", category: "Academic", searches30d: 2810, completionPct: 90, recalcPct: 11, commonOrigin: "Bowman Field corridor", peakUsage: "Finals week, all day", trend: "up" },
  { id: "long-hall", name: "Long Hall", category: "Academic", searches30d: 1046, completionPct: 84, recalcPct: 19, commonOrigin: "Student Lot C", peakUsage: "Weekdays, 8–10 AM", trend: "up" },
  { id: "stadium", name: "Memorial Stadium", category: "Athletics", searches30d: 512, completionPct: 88, recalcPct: 9, commonOrigin: "Visitor & Event Lot E", peakUsage: "Home game Saturdays", trend: "up" },
  { id: "redfern", name: "Redfern Health Center", category: "Health/Wellness", searches30d: 388, completionPct: 93, recalcPct: 5, commonOrigin: "Residence halls (walking)", peakUsage: "Weekdays, 10 AM–4 PM", trend: "flat" },
  { id: "mickel", name: "Mickel Hall (Housing)", category: "Housing", searches30d: 302, completionPct: 96, recalcPct: 3, commonOrigin: "Faculty & Staff Lot D", peakUsage: "Move-in weekend", trend: "flat" },
  { id: "ffc", name: "Fresh Food Company", category: "Dining", searches30d: 618, completionPct: 97, recalcPct: 2, commonOrigin: "Residence halls (walking)", peakUsage: "Daily, 11:30 AM–1 PM", trend: "up" }
];

export const TRENDING_DESTINATIONS = ["R.M. Cooper Library", "Memorial Stadium", "Sikes Hall (Admissions)"];
export const HARDEST_TO_REACH = ["Long Hall", "R.M. Cooper Library"];
export const HIGHEST_COMPLETION = ["Fresh Food Company", "Mickel Hall (Housing)"];

// ---------------------------------------------------------------------------
// First-Time Visitor Experience
// ---------------------------------------------------------------------------

export const VISITOR_INTEL = {
  journeys30d: 3204,
  completionPct: 90.2,
  recalcPct: 8.1,
  topDestinations: ["Sikes Hall (Admissions)", "Memorial Stadium", "Visitor Lot A parking"],
  parkingToDestination30d: 2652,
  admissionsJourneys30d: 2431,
  eventJourneys30d: 1148,
  funnel: [
    { stage: "Parking / Arrival", count: 3204 },
    { stage: "Campus Entry", count: 3041 },
    { stage: "Primary Destination", count: 2889 },
    { stage: "Secondary Destination", count: 1204 },
    { stage: "Exit / Return to Parking", count: 2812 }
  ],
  frictionNote: "The largest single drop-off is between Campus Entry and reaching the primary destination — consistent with the Long Hall and Cooper Library friction already flagged."
};

// ---------------------------------------------------------------------------
// Campus Events
// ---------------------------------------------------------------------------

export interface EventAnalytic {
  id: string;
  name: string;
  type: string;
  date: string;
  journeys: number;
  uniqueUsers: number;
  peakPeriod: string;
  topDestinations: string[];
  parkingOrigins: string[];
  accessibilityPct: number;
  sensoryPct: number;
  assistanceRequests: number;
  recoveryActivations: number;
  frictionNote: string;
  completionPct: number;
  phases: { phase: "Pre-Event" | "During Event" | "Post-Event"; journeys: number; completionPct: number }[];
}

export const EVENTS: EventAnalytic[] = [
  {
    id: "home-game",
    name: "Home Football Game vs. Wake Forest",
    type: "Home Football Game",
    date: "Nov 8",
    journeys: 1840,
    uniqueUsers: 1512,
    peakPeriod: "90 min before kickoff",
    topDestinations: ["Memorial Stadium", "Visitor & Event Lot E"],
    parkingOrigins: ["Visitor & Event Lot E", "Faculty & Staff Lot D"],
    accessibilityPct: 16,
    sensoryPct: 4,
    assistanceRequests: 22,
    recoveryActivations: 27,
    frictionNote: "Missed-turn signals cluster around the North Concourse in the hour before kickoff.",
    completionPct: 89,
    phases: [
      { phase: "Pre-Event", journeys: 1204, completionPct: 91 },
      { phase: "During Event", journeys: 480, completionPct: 84 },
      { phase: "Post-Event", journeys: 156, completionPct: 93 }
    ]
  },
  {
    id: "move-in",
    name: "Fall Move-In Day",
    type: "Move-In Day",
    date: "Aug 17",
    journeys: 2260,
    uniqueUsers: 980,
    peakPeriod: "9 AM – 12 PM",
    topDestinations: ["Mickel Hall (Housing)", "Faculty & Staff Lot D"],
    parkingOrigins: ["Faculty & Staff Lot D", "Visitor Lot B"],
    accessibilityPct: 21,
    sensoryPct: 9,
    assistanceRequests: 34,
    recoveryActivations: 19,
    frictionNote: "Recalculations were elevated only in the first two hours, consistent with lot reassignments that morning.",
    completionPct: 92,
    phases: [
      { phase: "Pre-Event", journeys: 210, completionPct: 95 },
      { phase: "During Event", journeys: 1840, completionPct: 90 },
      { phase: "Post-Event", journeys: 210, completionPct: 96 }
    ]
  },
  {
    id: "admissions-day",
    name: "Admitted Student Day",
    type: "Admissions Events",
    date: "Apr 5",
    journeys: 964,
    uniqueUsers: 640,
    peakPeriod: "10 AM – 1 PM",
    topDestinations: ["Sikes Hall (Admissions)", "Hendrix Student Center"],
    parkingOrigins: ["Visitor Lot A"],
    accessibilityPct: 14,
    sensoryPct: 6,
    assistanceRequests: 8,
    recoveryActivations: 3,
    frictionNote: "No notable friction — one of Beacon's cleanest event profiles.",
    completionPct: 95,
    phases: [
      { phase: "Pre-Event", journeys: 120, completionPct: 96 },
      { phase: "During Event", journeys: 780, completionPct: 95 },
      { phase: "Post-Event", journeys: 64, completionPct: 97 }
    ]
  },
  {
    id: "finals-week",
    name: "Finals Week",
    type: "Conferences",
    date: "Dec 9–13",
    journeys: 1408,
    uniqueUsers: 1105,
    peakPeriod: "Evenings, 7–11 PM",
    topDestinations: ["R.M. Cooper Library"],
    parkingOrigins: ["Student Lot C"],
    accessibilityPct: 12,
    sensoryPct: 22,
    assistanceRequests: 6,
    recoveryActivations: 14,
    frictionNote: "Lower-sensory routing and Quiet Space searches both rise sharply — a demand pattern, not a navigation problem.",
    completionPct: 94,
    phases: [
      { phase: "Pre-Event", journeys: 380, completionPct: 91 },
      { phase: "During Event", journeys: 1408, completionPct: 94 },
      { phase: "Post-Event", journeys: 240, completionPct: 96 }
    ]
  }
];

export const EVENT_READINESS_NOTE =
  "Based on the last comparable home game, expect elevated missed-turn signals near the Stadium's North Concourse in the hour before kickoff, and a Recovery Mode rate roughly 3x the campus baseline. Consider staffing the North Concourse and confirming accessible-gate signage beforehand.";

// ---------------------------------------------------------------------------
// Beacon Insights
// ---------------------------------------------------------------------------

export interface Insight {
  id: string;
  signal: string;
  whyItMatters: string;
  peopleAffected: string;
  recommendedReview: string;
  trend: "up" | "down" | "flat";
  confidence: Confidence;
  locationId?: string;
}

export const INSIGHTS: Insight[] = [
  {
    id: "long-hall-friction",
    signal: "Navigation friction near Long Hall increased 24% this month.",
    whyItMatters: "Repeated recalculations near a heavily-used academic building can mean lost class time and a worse first impression for new students.",
    peopleAffected: "Approximately 251 journeys this period",
    recommendedReview: "Facilities review of signage and the pedestrian approach from Student Lot C.",
    trend: "up",
    confidence: "strong",
    locationId: "long-hall"
  },
  {
    id: "stadium-step-free",
    signal: "Step-free routing to Memorial Stadium increased significantly on home game Saturdays.",
    whyItMatters: "Confirms accessible routing is being used exactly when it matters most — a strong accessibility signal, not a problem.",
    peopleAffected: "Approximately 214 journeys per home game",
    recommendedReview: "No action needed — consider highlighting this in accessibility reporting.",
    trend: "up",
    confidence: "strong",
    locationId: "stadium"
  },
  {
    id: "sensory-midday",
    signal: "Lower-sensory route demand is highest between 11 AM and 2 PM.",
    whyItMatters: "Aligns with the lunch-period crowd at Hendrix Student Center — a predictable, addressable pattern.",
    peopleAffected: "Approximately 214 journeys during the window",
    recommendedReview: "Consider a designated lower-sensory corridor during peak lunch hours.",
    trend: "flat",
    confidence: "moderate",
    locationId: "hendrix-hallway"
  },
  {
    id: "lot-c-recalc",
    signal: "Visitors and students traveling from Student Lot C experience more recalculations than those from Visitor Lot A.",
    whyItMatters: "Suggests the friction is tied to the Lot C approach specifically, not campus-wide wayfinding.",
    peopleAffected: "Approximately 251 journeys this period",
    recommendedReview: "Facilities review of Lot C pedestrian signage toward Long Hall.",
    trend: "up",
    confidence: "moderate",
    locationId: "long-hall"
  },
  {
    id: "quiet-space-finals",
    signal: "Quiet Space searches increased 81% during finals week.",
    whyItMatters: "A clear, time-bound signal that demand for calm spaces rises with academic stress — useful for Student Affairs planning.",
    peopleAffected: "152 searches during finals week vs. 84 in a typical week",
    recommendedReview: "Consider promoting known quiet spaces proactively during exam periods.",
    trend: "up",
    confidence: "strong"
  }
];

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export interface Opportunity {
  id: string;
  priority: "high" | "moderate" | "low";
  location: string;
  observedSignal: string;
  potentialImpact: string;
  suggestedReview: string;
  department: string;
  status: OpportunityStatus;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "long-hall-west",
    priority: "high",
    location: "Long Hall — West Entrance",
    observedSignal: "Elevated recalculation + high step-free routing demand from Student Lot C.",
    potentialImpact: "184 Beacon journeys during the selected period.",
    suggestedReview: "Inspect accessible entrance visibility and directional signage.",
    department: "Facilities + Accessibility Services",
    status: "new"
  },
  {
    id: "cooper-east-entrance",
    priority: "high",
    location: "R.M. Cooper Library — East Entrance",
    observedSignal: "18% higher accessibility-related rerouting than the campus average.",
    potentialImpact: "126 Beacon journeys during the selected period.",
    suggestedReview: "Review accessible entrance visibility and directional signage from the pedestrian corridor.",
    department: "Accessibility Services",
    status: "under-review"
  },
  {
    id: "hendrix-corridor",
    priority: "moderate",
    location: "Hendrix Student Center — Central Corridor",
    observedSignal: "Lower-sensory routes avoid this corridor 31% more often at midday.",
    potentialImpact: "~65 journeys per week during peak lunch hours.",
    suggestedReview: "Evaluate promoting an alternate, quieter corridor during 11:30 AM – 1:30 PM.",
    department: "Student Affairs",
    status: "planned"
  },
  {
    id: "stadium-concourse",
    priority: "moderate",
    location: "Memorial Stadium — North Concourse",
    observedSignal: "Missed-turn signals concentrated in the hour before kickoff on home game days.",
    potentialImpact: "~64 journeys per home game.",
    suggestedReview: "Confirm temporary event signage and staffing during peak arrival.",
    department: "Campus Safety + Events",
    status: "new"
  },
  {
    id: "quiet-space-finals-op",
    priority: "low",
    location: "R.M. Cooper Library area",
    observedSignal: "Quiet Space searches rise 81% during finals week.",
    potentialImpact: "~152 searches during the exam period.",
    suggestedReview: "Consider proactively surfacing quiet spaces during exam periods.",
    department: "Student Affairs",
    status: "in-progress"
  },
  {
    id: "signage-resolved",
    priority: "low",
    location: "R.M. Cooper Library — East Entrance Signage",
    observedSignal: "New directional signage installed May 12.",
    potentialImpact: "58% reduction in route recalculation observed since the change.",
    suggestedReview: "Monitor for another full cycle before closing out.",
    department: "Facilities",
    status: "resolved"
  }
];

// ---------------------------------------------------------------------------
// Before / After Improvement Tracking
// ---------------------------------------------------------------------------

export interface ImprovementRecord {
  id: string;
  title: string;
  date: string;
  changeType: string;
  location: string;
  before: { label: string; value: number; format: "percent" | "number" };
  after: { label: string; value: number; format: "percent" | "number" };
  note: string;
}

export const IMPROVEMENTS: ImprovementRecord[] = [
  {
    id: "cooper-signage",
    title: "Cooper Library Accessible Entrance Signage Updated",
    date: "May 12",
    changeType: "New signage installed",
    location: "R.M. Cooper Library — East Entrance",
    before: { label: "Route recalculation", value: 14.8, format: "percent" },
    after: { label: "Route recalculation", value: 6.2, format: "percent" },
    note: "Observed association, not a controlled study — other seasonal factors may also contribute."
  },
  {
    id: "hendrix-elevator",
    title: "Hendrix Student Center Elevator Repaired",
    date: "Sep 3",
    changeType: "Elevator repaired",
    location: "Hendrix Student Center",
    before: { label: "Step-free reroutes", value: 41, format: "number" },
    after: { label: "Step-free reroutes", value: 12, format: "number" },
    note: "Observed association during the two weeks before and after the repair."
  }
];

// ---------------------------------------------------------------------------
// Reassurance Point Analytics
// ---------------------------------------------------------------------------

export const REASSURANCE_POINTS = [
  { id: "correct-path", text: "You're on the correct path.", location: "Campus-wide", views30d: 4210, successAssociationPct: 96 },
  { id: "accessible-ahead", text: "Accessible entrance ahead.", location: "Cooper Library, Sikes Hall, Stadium", views30d: 1180, successAssociationPct: 94 },
  { id: "elevator-hallway", text: "Elevator is through the next hallway.", location: "Sikes Hall, Cooper Library", views30d: 512, successAssociationPct: 91 },
  { id: "quiet-space-ahead", text: "Quiet space is 200 feet ahead.", location: "Cooper Library", views30d: 288, successAssociationPct: 95 },
  { id: "second-floor", text: "Your destination is on the second floor.", location: "Sikes Hall, Martin Hall", views30d: 640, successAssociationPct: 93 }
];

export const REASSURANCE_GAPS = [
  { location: "Long Hall — West Entrance", note: "No reassurance point currently configured despite elevated rerouting — a likely early candidate." }
];

// ---------------------------------------------------------------------------
// Campus Comparison
// ---------------------------------------------------------------------------

export interface ComparisonEntity {
  id: string;
  name: string;
  journeys30d: number;
  completionPct: number;
  recalcPct: number;
  accessibilityPct: number;
  sensoryPct: number;
  assistanceRequests30d: number;
  recoveryActivations30d: number;
}

export const COMPARISON_ENTITIES: ComparisonEntity[] = [
  { id: "hendrix", name: "Hendrix Student Center", journeys30d: 3084, completionPct: 95, recalcPct: 4, accessibilityPct: 17, sensoryPct: 12, assistanceRequests30d: 18, recoveryActivations30d: 21 },
  { id: "cooper", name: "R.M. Cooper Library", journeys30d: 2810, completionPct: 90, recalcPct: 11, accessibilityPct: 22, sensoryPct: 9, assistanceRequests30d: 14, recoveryActivations30d: 9 },
  { id: "stadium", name: "Memorial Stadium", journeys30d: 512, completionPct: 88, recalcPct: 9, accessibilityPct: 30, sensoryPct: 5, assistanceRequests30d: 22, recoveryActivations30d: 27 },
  { id: "long-hall", name: "Long Hall", journeys30d: 1046, completionPct: 84, recalcPct: 19, accessibilityPct: 8, sensoryPct: 4, assistanceRequests30d: 11, recoveryActivations30d: 4 },
  { id: "sikes", name: "Sikes Hall (Admissions)", journeys30d: 2431, completionPct: 92, recalcPct: 7, accessibilityPct: 12, sensoryPct: 4, assistanceRequests30d: 9, recoveryActivations30d: 6 }
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatKpiValue(value: number, format: Kpi["format"]): string {
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "minutes") return `${value.toFixed(1)} min`;
  return Math.round(value).toLocaleString();
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
