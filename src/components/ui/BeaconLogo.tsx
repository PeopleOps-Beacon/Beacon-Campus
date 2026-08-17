import beaconEmblem from "../../assets/beacon-emblem.png";

export function BeaconLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <img
      src={beaconEmblem}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
