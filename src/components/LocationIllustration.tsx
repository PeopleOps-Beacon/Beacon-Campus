import { LANDMARK_PHOTOS } from "../data/beaconUniversity";
import type { Campus } from "../types/campus";
import { BuildingVisual, PhotoVisual } from "./BuildingVisual";

// Outdoor/landmark scenes to pair with BuildingIllustration's building scenes —
// together these let every step of a route show "what this spot looks like"
// instead of an abstract node-and-line map. See BuildingIllustration.tsx for
// why these are hand-drawn vectors rather than real photography.

type SceneType = "quad" | "plaza" | "pond" | "residential" | "walkway" | "gate" | "parking";

const LANDMARK_SCENES: Record<string, SceneType> = {
  green: "quad",
  "north-quad": "quad",
  "library-plaza": "plaza",
  "union-plaza": "plaza",
  "garden-walk": "pond",
  "dorm-row": "residential",
  "admin-walk": "walkway",
  "south-gate": "gate",
  "east-walk": "walkway",
  "athletics-walk": "walkway",
  "lot-a": "parking",
  "lot-b": "parking",
  "lot-c": "parking",
  "lot-d": "parking",
  "lot-e": "parking"
};

const SCENE_PALETTE: Record<SceneType, { sky: [string, string]; ground: string; accent: string }> = {
  quad: { sky: ["#141c17", "#1e3325"], ground: "#1c3a26", accent: "#4ade80" },
  plaza: { sky: ["#181c2c", "#2a2233"], ground: "#3a3730", accent: "#f5b72f" },
  pond: { sky: ["#101c22", "#1a2e2c"], ground: "#123038", accent: "#93c5fd" },
  residential: { sky: ["#1c1826", "#2e2020"], ground: "#241c1a", accent: "#ffcf66" },
  walkway: { sky: ["#161c2c", "#242030"], ground: "#22201c", accent: "#f5b72f" },
  gate: { sky: ["#1c1c2c", "#302a1c"], ground: "#2a2620", accent: "#f5b72f" },
  parking: { sky: ["#181a20", "#22242c"], ground: "#26282e", accent: "#93c5fd" }
};

function SceneArt({ type, accent }: { type: SceneType; accent: string }) {
  switch (type) {
    case "quad":
      return (
        <>
          <circle cx="130" cy="150" r="46" fill="#0e2318" />
          <rect x="126" y="150" width="8" height="45" fill="#4a3220" />
          <path d="M 20 195 Q 200 165 380 195" stroke="#0d3320" strokeWidth="18" fill="none" opacity="0.6" />
          {[300, 330, 355].map((x, i) => (
            <rect key={i} x={x} y={165 - i * 6} width="4" height={25 + i * 6} fill="#22150c" opacity="0.7" />
          ))}
        </>
      );
    case "plaza":
      return (
        <>
          <rect x="0" y="150" width="400" height="70" fill="#332f28" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={i * 60} y="150" width="2" height="70" fill="#221f1a" opacity="0.6" />
          ))}
          <rect x="60" y="70" width="280" height="90" fill="#4a4438" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={80 + i * 55} y="95" width="30" height="35" fill={accent} opacity="0.4" />
          ))}
          <rect x="90" y="120" width="6" height="80" fill="#151515" />
          <circle cx="93" cy="115" r="7" fill={accent} opacity="0.9" />
          <rect x="310" y="120" width="6" height="80" fill="#151515" />
          <circle cx="313" cy="115" r="7" fill={accent} opacity="0.9" />
        </>
      );
    case "pond":
      return (
        <>
          <ellipse cx="200" cy="175" rx="180" ry="35" fill="#0d2830" />
          <ellipse cx="200" cy="175" rx="140" ry="22" fill="#164048" opacity="0.7" />
          <circle cx="70" cy="130" r="34" fill="#0e2016" />
          <rect x="66" y="130" width="8" height="55" fill="#3a2818" />
          <circle cx="330" cy="140" r="26" fill="#0e2016" />
          <rect x="326" y="140" width="7" height="45" fill="#3a2818" />
          <path d="M 150 195 Q 200 180 250 195" stroke="#3a2818" strokeWidth="6" fill="none" opacity="0.7" />
        </>
      );
    case "residential":
      return (
        <>
          <rect x="0" y="185" width="400" height="35" fill="#1a1512" />
          <rect x="20" y="90" width="140" height="100" fill="#5a3a2e" />
          <polygon points="20,90 90,55 160,90" fill="#3a241a" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={40 + c * 40} y={110 + r * 26} width="24" height="18" fill="#ffcf66" opacity="0.35" />)
          )}
          <rect x="240" y="100" width="140" height="90" fill="#4a3226" />
          <polygon points="240,100 310,68 380,100" fill="#301f16" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={258 + c * 40} y={118 + r * 24} width="24" height="16" fill="#ffcf66" opacity="0.3" />)
          )}
          <rect x="196" y="130" width="6" height="60" fill="#151515" />
          <circle cx="199" cy="125" r="7" fill="#f5b72f" opacity="0.9" />
        </>
      );
    case "walkway":
      return (
        <>
          <polygon points="140,220 260,220 210,110 190,110" fill="#2a2620" />
          <polygon points="150,220 250,220 205,120 195,120" fill="#38332a" opacity="0.6" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={150 - i * 34} y={200 - i * 24} width="4" height={40 - i * 8} fill="#151515" />
              <circle cx={152 - i * 34} cy={198 - i * 24} r={6 - i} fill={accent} opacity="0.85" />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={`r${i}`}>
              <rect x={250 + i * 34} y={200 - i * 24} width="4" height={40 - i * 8} fill="#151515" />
              <circle cx={252 + i * 34} cy={198 - i * 24} r={6 - i} fill={accent} opacity="0.85" />
            </g>
          ))}
        </>
      );
    case "gate":
      return (
        <>
          <rect x="60" y="80" width="26" height="130" fill="#3a352c" />
          <rect x="314" y="80" width="26" height="130" fill="#3a352c" />
          <rect x="60" y="70" width="280" height="20" fill="#4a4436" />
          <rect x="160" y="95" width="80" height="30" rx="4" fill={accent} opacity="0.85" />
          <rect x="0" y="200" width="400" height="20" fill="#221f1a" />
        </>
      );
    case "parking":
      return (
        <>
          <rect x="0" y="150" width="400" height="70" fill="#2b2d33" />
          {[40, 130, 220, 310].map((x, i) => (
            <rect key={i} x={x} y="150" width="6" height="70" fill="#e8e6e0" opacity="0.25" />
          ))}
          <rect x="60" y="155" width="70" height="34" rx="6" fill={accent} opacity="0.5" />
          <rect x="180" y="155" width="70" height="34" rx="6" fill="#f87171" opacity="0.4" />
          <rect x="300" y="155" width="70" height="34" rx="6" fill="#93c5fd" opacity="0.45" />
          <rect x="30" y="100" width="6" height="55" fill="#151515" />
          <circle cx="33" cy="95" r="8" fill={accent} opacity="0.9" />
        </>
      );
    default:
      return null;
  }
}

function OutdoorScene({ type, className, height = 160 }: { type: SceneType; className?: string; height?: number }) {
  const p = SCENE_PALETTE[type];
  return (
    <svg viewBox="0 0 400 220" style={{ height }} className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`scene-sky-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#scene-sky-${type})`} />
      <circle cx="345" cy="35" r="16" fill={p.accent} opacity="0.75" />
      <rect x="0" y="195" width="400" height="25" fill={p.ground} opacity="0.8" />
      <SceneArt type={type} accent={p.accent} />
    </svg>
  );
}

export function LocationIllustration({
  campus,
  locationId,
  className,
  height = 160
}: {
  campus: Campus;
  locationId?: string;
  className?: string;
  height?: number;
}) {
  const building = locationId ? campus.buildings.find((b) => b.id === locationId) : undefined;
  if (building) return <BuildingVisual building={building} className={className} height={height} />;

  const landmarkPhoto = locationId ? LANDMARK_PHOTOS[locationId] : undefined;
  if (landmarkPhoto) {
    const label = campus.pathNodes.find((n) => n.id === locationId)?.label ?? "Campus landmark";
    return <PhotoVisual photo={landmarkPhoto} alt={label} className={className} height={height} />;
  }

  const scene = (locationId && LANDMARK_SCENES[locationId]) || "quad";
  return <OutdoorScene type={scene} className={className} height={height} />;
}
