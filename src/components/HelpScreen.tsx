import { useState } from "react";
import {
  Accessibility,
  Bell,
  Compass,
  HelpCircle,
  Mail,
  Navigation,
  Search,
  ShieldCheck
} from "lucide-react";
import type { Campus } from "../types/campus";
import { Card, IconTile } from "./ui/Primitives";

interface HelpTopic {
  id: string;
  question: string;
  answer: string;
  icon: typeof HelpCircle;
}

const TOPICS: HelpTopic[] = [
  {
    id: "search",
    question: "How do I find a place on campus?",
    icon: Search,
    answer:
      "Type into the search bar on the Home screen — a building name, room number, department, class, or common phrase like \"financial aid\" or \"closest bathroom\" all work. Results are grouped by type so you can quickly spot buildings, rooms, services, and events."
  },
  {
    id: "routes",
    question: "What's the difference between Fastest, Calm, Mobility, and Custom routes?",
    icon: Navigation,
    answer:
      "When you start a route, Beacon shows four ways to get there. Fastest is the shortest path with no detours. Calm favors quieter, less crowded walkways even if it takes a little longer. Mobility always uses ramps, elevators, and accessible entrances. Custom uses whatever you've set on the Accessibility & Preferences screen, including comfort settings like extra time or simplified directions."
  },
  {
    id: "accessibility",
    question: "How do accessibility preferences work?",
    icon: Accessibility,
    answer:
      "Open Accessibility & Preferences (from the More menu) to turn on step-free routing, crowd avoidance, a calmer path, a restroom stop along the way, extra time, larger text, simplified directions, reassurance messages, or spoken directions. These aren't cosmetic — they change the actual route Beacon calculates."
  },
  {
    id: "notifications",
    question: "How do I know about closures or construction?",
    icon: Bell,
    answer:
      "Active alerts appear on the Home screen, in the Alerts tab, and directly on the destination card or route if they affect where you're going — for example, an entrance closure automatically reroutes you and explains why. Affected buildings also show a marker on the campus map."
  },
  {
    id: "admin",
    question: "What is the Admin Preview?",
    icon: ShieldCheck,
    answer:
      "The shield icon in the top right opens a local preview of how campus staff could manage Beacon without a developer — toggling alerts, parking closures, building hours, construction notices, and events. Changes save only to this browser and don't affect anyone else."
  },
  {
    id: "assistant",
    question: "What is Ask Beacon?",
    icon: Compass,
    answer:
      "Ask Beacon (the sparkle icon) is a preview of quick answers to common questions, like where your next class is or where to park. It's a preview of a future natural-language assistant — for now it answers a curated set of questions."
  }
];

export function HelpScreen({ campus }: { campus: Campus }) {
  const [openId, setOpenId] = useState<string | null>(TOPICS[0].id);
  const itHelpDesk = campus.services.find((s) => s.category === "it-help-desk");
  const itBuilding = itHelpDesk ? campus.buildings.find((b) => b.id === itHelpDesk.buildingId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-white/50">Beacon Campus</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Help</h1>
        <p className="mt-1 text-sm text-white/60">Answers to common questions about using Beacon.</p>
      </div>

      <div className="flex flex-col gap-2">
        {TOPICS.map((topic) => {
          const open = openId === topic.id;
          const Icon = topic.icon;
          return (
            <Card key={topic.id} className="p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : topic.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <IconTile tone={open ? "gold" : "neutral"}>
                  <Icon size={16} aria-hidden="true" />
                </IconTile>
                <span className="flex-1 text-sm font-medium text-white">{topic.question}</span>
              </button>
              {open && <p className="border-t border-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white/70">{topic.answer}</p>}
            </Card>
          );
        })}
      </div>

      {itHelpDesk && (
        <Card className="flex items-start gap-3">
          <IconTile tone="info">
            <Mail size={16} aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-white">Still need help?</p>
            <p className="mt-1 text-sm text-white/65">
              The {itHelpDesk.name} in {itBuilding?.name} can help with anything Beacon-related, in person or by
              stopping by their desk.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
