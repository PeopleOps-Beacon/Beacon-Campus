import beaconEmblem from "../assets/beacon-emblem.png";

export function LandingScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-campus-ink px-8 pb-12 pt-[max(3rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-90"
        style={{ background: "radial-gradient(55% 40% at 50% 32%, rgba(245,183,47,0.16), transparent 70%)" }}
        aria-hidden="true"
      />

      <div />

      <div className="relative flex flex-col items-center text-center">
        <img src={beaconEmblem} alt="" className="w-24 drop-shadow-[0_10px_30px_rgba(245,183,47,0.4)]" />
        <h1
          className="mt-5 text-[2.15rem] font-bold leading-none tracking-[0.1em]"
          style={{
            backgroundImage: "linear-gradient(180deg, #fff3cf 0%, #f5b72f 45%, #b9791a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          BEACON
        </h1>
        <p className="mt-1.5 text-sm font-semibold uppercase tracking-[0.5em] text-campus-gold/90">Campus</p>
      </div>

      <div className="relative flex w-full flex-col items-center gap-9">
        <p className="max-w-[280px] text-base leading-relaxed text-white">
          Every <span className="text-campus-gold">Journey</span>. Every <span className="text-campus-gold">Ability</span>. Every{" "}
          <span className="text-campus-gold">Traveler</span>.
        </p>

        <button
          type="button"
          onClick={onBegin}
          className="min-h-[52px] w-full rounded-[var(--radius-pill)] border border-campus-gold bg-transparent text-[15px] font-semibold uppercase tracking-[0.25em] text-campus-gold transition-colors duration-150 [transition-timing-function:var(--ease-premium)] active:bg-campus-gold/10"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
