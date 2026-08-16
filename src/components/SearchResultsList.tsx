import { Briefcase, Building2, CalendarDays, DoorOpen, Info, SquareParking, Users } from "lucide-react";
import { optionId } from "../hooks/useComboboxNavigation";
import type { SearchResult, SearchResultKind } from "../types/campus";
import { EmptyState, IconTile, cx } from "./ui/Primitives";

const KIND_META: Record<SearchResultKind, { label: string; icon: typeof Building2 }> = {
  building: { label: "Buildings", icon: Building2 },
  room: { label: "Rooms & Classes", icon: DoorOpen },
  department: { label: "Departments", icon: Users },
  service: { label: "Services", icon: Briefcase },
  amenity: { label: "Nearby", icon: Info },
  event: { label: "Events", icon: CalendarDays },
  parking: { label: "Parking", icon: SquareParking }
};

export function SearchResultsList({
  results,
  query,
  onSelect,
  listboxId,
  activeId
}: {
  results: SearchResult[];
  query: string;
  onSelect: (result: SearchResult) => void;
  listboxId?: string;
  activeId?: string;
}) {
  if (!query.trim()) return null;

  if (results.length === 0) {
    return (
      <EmptyState
        title="No matches yet"
        message={`We couldn't find anything for "${query}". Try a building name, room number, or service like "Financial Aid."`}
      />
    );
  }

  const groups = new Map<SearchResultKind, SearchResult[]>();
  for (const result of results) {
    if (!groups.has(result.kind)) groups.set(result.kind, []);
    groups.get(result.kind)!.push(result);
  }

  return (
    <div id={listboxId} className="flex flex-col gap-5" role="listbox" aria-label="Search results">
      {Array.from(groups.entries()).map(([kind, items]) => {
        const meta = KIND_META[kind];
        const Icon = meta.icon;
        return (
          <div key={kind}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">{meta.label}</p>
            <ul className="flex flex-col gap-1.5">
              {items.map((item) => {
                const id = optionId(item);
                const active = id === activeId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      id={id}
                      role="option"
                      aria-selected={active}
                      onClick={() => onSelect(item)}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-[var(--radius-control)] px-2.5 py-2.5 text-left hover:bg-white/[0.06]",
                        active && "bg-white/[0.09] ring-1 ring-inset ring-campus-gold/40"
                      )}
                    >
                      <IconTile>
                        <Icon size={17} aria-hidden="true" />
                      </IconTile>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{item.title}</span>
                        {item.subtitle && <span className="block truncate text-xs text-white/50">{item.subtitle}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
