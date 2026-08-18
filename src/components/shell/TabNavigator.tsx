import { Bell, Calendar, Compass, MapIcon, User } from "lucide-react";
import { cx } from "../ui/Primitives";

export type TabId = "map" | "myday" | "explore" | "alerts" | "profile";

const TABS: { id: TabId; label: string; icon: typeof MapIcon }[] = [
  { id: "myday", label: "My Day", icon: Calendar },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: User }
];

/**
 * Beacon's floating navigation surface — a centered, inset pill (not a flush
 * full-width bar) matching GSP's tab bar language, sized for Campus's five
 * destinations rather than forced down to GSP's four. Positioned `absolute`
 * against MobileAppShell's own relatively-positioned root rather than
 * `position: fixed` against the viewport: on wide screens the app renders
 * inside PhoneFrame's device mockup, and a true `fixed` element would escape
 * that frame and dock to the real browser window instead — this anchors to
 * the app's own box on every viewport, which reads identically to `fixed` on
 * a real phone (full height = full viewport) while staying correctly
 * contained in the desktop preview.
 */
export function TabNavigator({
  activeTab,
  onChange,
  alertCount = 0
}: {
  activeTab: TabId;
  onChange: (id: TabId) => void;
  alertCount?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Primary"
        className="tabbar-surface pointer-events-auto flex w-full max-w-[380px] items-stretch gap-0.5 rounded-[var(--radius-nav)] border border-campus-gold/[0.14] bg-campus-ink/90 p-1.5 backdrop-blur-xl"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(tab.id)}
              className={cx(
                "relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] text-[0.68rem] font-medium transition-[transform,background-image,color] active:translate-y-px",
                active ? "beacon-selected" : "text-white/50 hover:text-white/80"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              {tab.id === "alerts" && alertCount > 0 && (
                <span className="absolute right-[20%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-campus-gold px-1 text-[9px] font-bold text-campus-ink">
                  {alertCount}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
