import { Bell, Calendar, Home as HomeIcon, MoreHorizontal, Search } from "lucide-react";
import { cx } from "../ui/Primitives";

export type TabId = "home" | "search" | "schedule" | "alerts" | "more";

const TABS: { id: TabId; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "search", label: "Search", icon: Search },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "more", label: "More", icon: MoreHorizontal }
];

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
    <nav
      aria-label="Primary"
      className="grid grid-cols-5 border-t border-white/[0.06] bg-campus-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
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
              "relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
              active ? "text-campus-gold" : "text-white/50 hover:text-white/80"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
            {tab.id === "alerts" && alertCount > 0 && (
              <span className="absolute right-[28%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-campus-gold px-1 text-[9px] font-bold text-campus-ink">
                {alertCount}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
