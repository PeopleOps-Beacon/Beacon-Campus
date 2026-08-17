import type { Building } from "../types/campus";
import { BuildingIllustration } from "./BuildingIllustration";
import { cx } from "./ui/Primitives";

/**
 * Renders a real photo of the building when one is verified and wired
 * (`building.photo`), crediting its source; falls back to the hand-drawn
 * BuildingIllustration otherwise. Same layout contract as BuildingIllustration
 * (fixed `height`, `className` controls width/rounding) so callers can swap
 * one for the other without adjusting surrounding markup.
 */
export function BuildingVisual({ building, height = 160, className }: { building: Building; height?: number; className?: string }) {
  if (!building.photo) {
    return <BuildingIllustration category={building.category} height={height} className={className} />;
  }

  return (
    <div className={cx("relative overflow-hidden", className)} style={{ height }}>
      <img src={building.photo.src} alt={building.name} className="h-full w-full object-cover" />
      <a
        href={building.photo.sourceUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-1 right-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[9px] leading-none text-white/70 backdrop-blur-sm hover:text-white"
      >
        {building.photo.credit}
      </a>
    </div>
  );
}
