import beaconLogoFull from "../assets/beacon-logo-full.png";

export function LandingScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-campus-ink px-8 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3 opacity-70"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(245,183,47,0.16), transparent 70%)" }}
        aria-hidden="true"
      />

      <div />

      <div className="relative flex flex-col items-center text-center">
        <img
          src={beaconLogoFull}
          alt="Beacon"
          className="w-[280px] max-w-full drop-shadow-[0_20px_60px_rgba(245,183,47,0.3)]"
        />
        <p className="-mt-2 text-lg font-semibold uppercase tracking-[0.35em] text-campus-gold">Campus</p>
        <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-white/55">
          Know where you are. Know where you're going.
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center gap-4">
        <button
          type="button"
          onClick={onBegin}
          className="min-h-[52px] w-full rounded-[var(--radius-pill)] bg-campus-gold text-[15px] font-semibold text-campus-ink shadow-[0_12px_32px_-8px_rgba(245,183,47,0.5)] transition-transform duration-150 [transition-timing-function:var(--ease-premium)] active:scale-[0.98]"
        >
          Begin
        </button>
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">Beacon University · Wayfinding</p>
      </div>
    </div>
  );
}
