import type { ReactNode } from "react";
import { ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import { BeaconLogo } from "../ui/BeaconLogo";
import { TabNavigator, type TabId } from "./TabNavigator";

export function MobileAppShell({
  activeTab,
  onTabChange,
  alertCount = 0,
  hideTabs = false,
  hideHeader = false,
  fullBleed = false,
  title,
  subtitle,
  onBack,
  onAssistant,
  onAdmin,
  children
}: {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  alertCount?: number;
  hideTabs?: boolean;
  /** Hides the top header bar entirely — for the full-bleed map, which has its own floating controls. */
  hideHeader?: boolean;
  /** Removes main's padding/scroll so a screen (the map) can render truly edge-to-edge and manage its own layout. */
  fullBleed?: boolean;
  title?: string;
  subtitle: string;
  onBack?: () => void;
  onAssistant: () => void;
  onAdmin: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-1 flex-col bg-campus-ink">
      {!hideHeader && (
        <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.08] hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <BeaconLogo size={30} />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">{title ?? "Beacon Campus"}</p>
              {!title && <p className="truncate text-xs leading-tight text-white/50">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onAssistant}
              aria-label="Ask Beacon"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.08] hover:text-campus-gold"
            >
              <Sparkles size={18} />
            </button>
            <button
              type="button"
              onClick={onAdmin}
              aria-label="Admin preview"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.08] hover:text-campus-sky"
            >
              <ShieldCheck size={18} />
            </button>
          </div>
        </header>
      )}

      <main className={fullBleed ? "relative flex-1 overflow-hidden" : "no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-4"}>{children}</main>

      {!hideTabs && <TabNavigator activeTab={activeTab} onChange={onTabChange} alertCount={alertCount} />}
    </div>
  );
}
