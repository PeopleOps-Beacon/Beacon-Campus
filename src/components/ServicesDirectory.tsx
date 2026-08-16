import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import type { Campus, CampusService } from "../types/campus";
import { EmptyState, IconTile } from "./ui/Primitives";
import { SearchBar } from "./SearchBar";

export function ServicesDirectory({
  campus,
  onSelectService,
  initialQuery = ""
}: {
  campus: Campus;
  onSelectService: (service: CampusService) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campus.services;
    return campus.services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.replace(/-/g, " ").includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [campus.services, query]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">Beacon University</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Student Services</h1>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Search services" />

      {filtered.length === 0 ? (
        <EmptyState title="No services found" message="Try a different search term, like 'financial aid' or 'health.'" />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filtered.map((service) => {
            const building = campus.buildings.find((b) => b.id === service.buildingId);
            return (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-2.5 py-2.5 text-left hover:bg-white/[0.06]"
                >
                  <IconTile>
                    <Briefcase size={16} aria-hidden="true" />
                  </IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">{service.name}</span>
                    <span className="block truncate text-xs text-white/55">
                      {building?.name}
                      {service.appointmentRequired ? " · Appointment recommended" : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
