import type { ReactNode } from "react";
import { cx } from "../ui/Primitives";

/**
 * On real phones (the primary use case) this is invisible — full-bleed,
 * edge to edge. On wider viewports it renders Beacon Campus inside a
 * phone-shaped device frame so the app reads as a mobile app being
 * previewed, not a website with a narrow column.
 *
 * `wide` swaps the phone mockup for a larger tablet/console-shaped one —
 * used only for the Executive Dashboard, which is a desktop-oriented
 * decision-support surface (maps, tables, side-by-side comparisons) rather
 * than a phone screen. Every other screen keeps the phone frame untouched.
 */
export function PhoneFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col bg-campus-ink sm:min-h-screen sm:items-center sm:justify-center sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(60% 45% at 50% 8%, rgba(245,183,47,0.05), transparent 70%), radial-gradient(50% 40% at 85% 90%, rgba(147,197,253,0.05), transparent 70%)"
      }}
    >
      <div
        className={cx(
          "relative mx-auto flex h-full w-full flex-1 flex-col overflow-hidden bg-campus-ink sm:max-h-[92vh] sm:flex-none sm:border-[10px] sm:border-[#0a0a0a] sm:shadow-[0_50px_120px_-24px_rgba(0,0,0,0.85)]",
          wide ? "sm:h-[760px] sm:w-[1080px] sm:rounded-[1.75rem]" : "sm:h-[860px] sm:w-[412px] sm:rounded-[2.75rem]"
        )}
      >
        {!wide && (
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-30 hidden h-6 w-[128px] -translate-x-1/2 rounded-b-2xl bg-[#0a0a0a] sm:block"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </div>
  );
}
