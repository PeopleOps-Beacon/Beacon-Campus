export function BeaconLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#080a0d" />
      <path d="M32 12 L46 32 L32 52 L18 32 Z" fill="#f5b72f" />
      <circle cx="32" cy="32" r="7" fill="#080a0d" />
    </svg>
  );
}
