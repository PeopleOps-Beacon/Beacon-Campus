import type { Campus } from "../types/campus";

const CATEGORY_COLOR: Record<string, string> = {
  academic: "#93c5fd",
  residence: "#c084fc",
  dining: "#fb923c",
  "student-life": "#f5b72f",
  administration: "#f5b72f",
  athletics: "#f87171",
  library: "#93c5fd",
  "health-safety": "#4ade80",
  arts: "#f472b6"
};

export function CampusMap({
  campus,
  highlightBuildingId,
  routePath,
  startNodeId,
  pinPoint,
  height = 220,
  onSelectBuilding
}: {
  campus: Campus;
  highlightBuildingId?: string;
  routePath?: string[];
  startNodeId?: string;
  pinPoint?: { x: number; y: number };
  height?: number;
  onSelectBuilding?: (buildingId: string) => void;
}) {
  const pointFor = (id: string) => campus.pathNodes.find((n) => n.id === id)?.point;
  const routePoints = (routePath ?? []).map(pointFor).filter((p): p is { x: number; y: number } => Boolean(p));
  const startPoint = startNodeId ? pointFor(startNodeId) : undefined;

  const issueBuildingIds = new Set([
    ...campus.alerts.filter((a) => a.active).flatMap((a) => a.affectedBuildingIds),
    ...campus.construction.filter((c) => c.active).flatMap((c) => c.affectedBuildingIds)
  ]);

  return (
    <svg
      viewBox="0 0 1000 700"
      role="img"
      aria-label={`Simulated map of ${campus.universityName} campus`}
      style={{ height }}
      className="w-full rounded-[var(--radius-card)] border border-white/[0.06] bg-[#0a0d12]"
    >
      <rect x="0" y="0" width="1000" height="700" fill="#0a0d12" />
      {/* Bowman Field */}
      <ellipse cx="500" cy="380" rx="180" ry="140" fill="#12321f" opacity="0.7" />
      <text x="500" y="380" textAnchor="middle" fill="#4ade80" opacity="0.7" fontSize="14" fontWeight={600}>
        Bowman Field
      </text>

      {/* Path edges, subtle */}
      {campus.pathEdges.map((edge, i) => {
        const a = pointFor(edge.from);
        const b = pointFor(edge.to);
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#ffffff"
            strokeOpacity={0.05}
            strokeWidth={3}
          />
        );
      })}

      {/* Route */}
      {routePoints.length > 1 && (
        <polyline
          points={routePoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#f5b72f"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 10"
        />
      )}

      {/* Parking */}
      {campus.parkingLots.map((lot) => (
        <g key={lot.id} opacity={lot.closed ? 0.35 : 0.9}>
          <circle cx={lot.point.x} cy={lot.point.y} r={10} fill="#1c2430" stroke={lot.closed ? "#f87171" : "#93c5fd"} strokeWidth={1.5} />
          <text x={lot.point.x} y={lot.point.y + 4} textAnchor="middle" fontSize="10" fontWeight={700} fill={lot.closed ? "#f87171" : "#93c5fd"}>
            P
          </text>
        </g>
      ))}

      {/* Buildings */}
      {campus.buildings.map((b) => {
        const isHighlighted = b.id === highlightBuildingId;
        const color = CATEGORY_COLOR[b.category] ?? "#f5b72f";
        return (
          <g
            key={b.id}
            transform={`translate(${b.point.x}, ${b.point.y})`}
            onClick={onSelectBuilding ? () => onSelectBuilding(b.id) : undefined}
            onKeyDown={
              onSelectBuilding
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectBuilding(b.id);
                    }
                  }
                : undefined
            }
            style={{ cursor: onSelectBuilding ? "pointer" : "default", outlineOffset: 4 }}
            role={onSelectBuilding ? "button" : undefined}
            tabIndex={onSelectBuilding ? 0 : undefined}
            aria-label={onSelectBuilding ? b.name : undefined}
          >
            {isHighlighted && <circle r={22} fill={color} opacity={0.18} />}
            <rect
              x={-16}
              y={-12}
              width={32}
              height={24}
              rx={6}
              fill={isHighlighted ? color : "#181d25"}
              stroke={color}
              strokeWidth={isHighlighted ? 0 : 1.5}
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fontSize="9"
              fontWeight={700}
              fill={isHighlighted ? "#080a0d" : color}
            >
              {b.abbreviation}
            </text>
            {issueBuildingIds.has(b.id) && (
              <circle cx={13} cy={-9} r={5} fill="#f87171" stroke="#080a0d" strokeWidth={1.5} />
            )}
          </g>
        );
      })}

      {pinPoint && (
        <g transform={`translate(${pinPoint.x}, ${pinPoint.y})`}>
          <circle r={12} fill="#f472b6" opacity={0.25} />
          <circle r={6} fill="#f472b6" stroke="#080a0d" strokeWidth={2} />
        </g>
      )}

      {/* Current location */}
      {startPoint && (
        <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
          <circle r={9} fill="#f5b72f" opacity={0.3} />
          <circle r={5} fill="#f5b72f" stroke="#080a0d" strokeWidth={2} />
        </g>
      )}
    </svg>
  );
}
