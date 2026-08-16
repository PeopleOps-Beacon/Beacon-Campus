import type { BuildingCategory } from "../types/campus";

// Real AI-generated stock photography isn't available in this environment
// (no image-generation credits), so each building category gets a distinct,
// hand-drawn vector illustration instead of a flat placeholder — enough to
// give a visitor a sense of "what does this place look like" at a glance.

const PALETTE: Record<BuildingCategory, { sky: [string, string]; building: string; accent: string; roof: string }> = {
  academic: { sky: ["#1c2333", "#3a2e1a"], building: "#8a8578", accent: "#f5b72f", roof: "#5f5a4d" },
  residence: { sky: ["#241a2e", "#3a2420"], building: "#a35b45", accent: "#ffcf66", roof: "#6e3626" },
  dining: { sky: ["#1a2733", "#2e3a24"], building: "#7fa8c9", accent: "#ffcf66", roof: "#3f5a72" },
  "student-life": { sky: ["#141c2c", "#233047"], building: "#5b7690", accent: "#f5b72f", roof: "#33465c" },
  administration: { sky: ["#1c2130", "#332a1c"], building: "#93897a", accent: "#f5b72f", roof: "#5c5140" },
  athletics: { sky: ["#241418", "#2e1a1a"], building: "#a35050", accent: "#f87171", roof: "#5c2a2a" },
  library: { sky: ["#161c2c", "#2a2033"], building: "#8f8271", accent: "#93c5fd", roof: "#544a3a" },
  "health-safety": { sky: ["#131f24", "#1b2e2a"], building: "#6fa89a", accent: "#4ade80", roof: "#33544a" },
  arts: { sky: ["#241826", "#2e1c30"], building: "#a56b8f", accent: "#f472b6", roof: "#5c3350" }
};

function Roofline({ category, color }: { category: BuildingCategory; color: string }) {
  switch (category) {
    case "academic":
    case "administration":
      return <polygon points="70,70 200,20 330,70" fill={color} />;
    case "athletics":
      return <path d="M 60 70 Q 200 -10 340 70 Z" fill={color} />;
    case "arts":
      return <polygon points="70,70 150,15 260,45 330,70" fill={color} />;
    case "library":
      return <polygon points="80,70 200,25 320,70" fill={color} />;
    default:
      return <rect x="65" y="55" width="270" height="18" fill={color} />;
  }
}

function Windows({ category, accent }: { category: BuildingCategory; accent: string }) {
  const rows = category === "residence" ? 4 : category === "student-life" || category === "dining" ? 2 : 3;
  const cols = category === "residence" ? 7 : 5;
  const startY = 90;
  const cellW = 240 / cols;
  const cellH = 26;
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      items.push(
        <rect
          key={`${r}-${c}`}
          x={80 + c * cellW + 6}
          y={startY + r * (cellH + 10)}
          width={cellW - 14}
          height={cellH}
          rx={category === "student-life" || category === "dining" ? 3 : 2}
          fill={accent}
          opacity={0.55}
        />
      );
    }
  }
  return <>{items}</>;
}

export function BuildingIllustration({ category, className, height = 160 }: { category: BuildingCategory; className?: string; height?: number }) {
  const p = PALETTE[category];
  return (
    <svg viewBox="0 0 400 220" style={{ height }} className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${category}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky-${category})`} />
      <circle cx="345" cy="35" r="18" fill={p.accent} opacity="0.85" />
      <rect x="0" y="185" width="400" height="35" fill="#0d3320" opacity="0.6" />
      <Roofline category={category} color={p.roof} />
      <rect x="65" y="70" width="270" height="120" fill={p.building} />
      <Windows category={category} accent={p.accent} />
      <rect x="180" y="150" width="40" height="40" fill={p.roof} opacity="0.8" />
      {(category === "academic" || category === "administration" || category === "library") && (
        <>
          <rect x="90" y="150" width="10" height="40" fill={p.roof} opacity="0.5" />
          <rect x="115" y="150" width="10" height="40" fill={p.roof} opacity="0.5" />
          <rect x="275" y="150" width="10" height="40" fill={p.roof} opacity="0.5" />
          <rect x="300" y="150" width="10" height="40" fill={p.roof} opacity="0.5" />
        </>
      )}
    </svg>
  );
}
