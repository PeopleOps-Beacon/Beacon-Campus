import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Campus } from "../types/campus";
import { Card, IconTile } from "./ui/Primitives";

export function QuickQuestions({ campus }: { campus: Campus }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-white/50">Beacon Assistant</p>
        <h1 className="text-[var(--font-display)] font-bold text-white">Ask Beacon</h1>
        <p className="mt-1 text-sm text-white/60">
          A preview of Beacon's future concierge. Tap a question for a quick answer — natural-language search is
          coming soon.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {campus.quickQuestions.map((qq) => {
          const open = openId === qq.id;
          return (
            <Card key={qq.id} className="p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : qq.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <IconTile tone="gold">
                  <Sparkles size={15} aria-hidden="true" />
                </IconTile>
                <span className="flex-1 text-sm font-medium text-white">{qq.question}</span>
              </button>
              {open && <p className="border-t border-white/[0.06] px-4 py-3 text-sm text-white/70">{qq.answer}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
