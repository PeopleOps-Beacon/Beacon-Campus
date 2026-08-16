import { useState } from "react";
import { AlertTriangle, Calendar, Construction, ShieldCheck, SquareParking } from "lucide-react";
import type { AlertSeverity, Campus, CampusAlert, CampusEvent } from "../../types/campus";
import { Badge, Button, Card, IconTile, SectionHeading, Toggle, cx } from "../ui/Primitives";

type AdminActions = {
  toggleAlertActive: (id: string, current: boolean) => void;
  addAlert: (alert: CampusAlert) => void;
  removeAddedAlert: (id: string) => void;
  toggleParkingClosed: (lotId: string, current: boolean) => void;
  setBuildingHours: (buildingId: string, hours: { opens: string; closes: string }) => void;
  toggleConstructionActive: (id: string, current: boolean) => void;
  addEvent: (event: CampusEvent) => void;
  removeEvent: (id: string) => void;
  resetOverrides: () => void;
};

type Section = "alerts" | "parking" | "hours" | "construction" | "events";

const SECTIONS: { id: Section; label: string; icon: typeof AlertTriangle }[] = [
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "parking", label: "Parking", icon: SquareParking },
  { id: "hours", label: "Hours", icon: Calendar },
  { id: "construction", label: "Construction", icon: Construction },
  { id: "events", label: "Events", icon: Calendar }
];

export function AdminDashboard({
  campus,
  actions,
  hasCustomizations
}: {
  campus: Campus;
  actions: AdminActions;
  hasCustomizations: boolean;
}) {
  const [section, setSection] = useState<Section>("alerts");

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex items-start gap-3 border-campus-sky/25 bg-campus-sky/[0.06]">
        <IconTile tone="info">
          <ShieldCheck size={17} aria-hidden="true" />
        </IconTile>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Admin Preview</p>
          <p className="mt-1 text-xs text-white/60">
            This demonstrates how staff could maintain Beacon without a developer. Changes save to this browser only
            — there's no backend yet.
          </p>
        </div>
      </Card>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cx(
                "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 text-xs font-semibold",
                active ? "bg-campus-gold text-campus-ink" : "bg-white/[0.06] text-white/70"
              )}
            >
              <Icon size={13} aria-hidden="true" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "alerts" && <AlertsAdmin campus={campus} actions={actions} />}
      {section === "parking" && <ParkingAdmin campus={campus} actions={actions} />}
      {section === "hours" && <HoursAdmin campus={campus} actions={actions} />}
      {section === "construction" && <ConstructionAdmin campus={campus} actions={actions} />}
      {section === "events" && <EventsAdmin campus={campus} actions={actions} />}

      {hasCustomizations && (
        <Button tone="ghost" onClick={actions.resetOverrides} className="mt-2 text-white/50">
          Reset all admin changes
        </Button>
      )}
    </div>
  );
}

function ToggleRow({ label, sub, active, onToggle }: { label: string; sub?: string; active: boolean; onToggle: () => void }) {
  return (
    <Card className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{label}</p>
        {sub && <p className="truncate text-xs text-white/55">{sub}</p>}
      </div>
      <Toggle checked={active} onChange={onToggle} label={`Toggle ${label}`} />
    </Card>
  );
}

function AlertsAdmin({ campus, actions }: { campus: Campus; actions: AdminActions }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("advisory");
  const [buildingId, setBuildingId] = useState(campus.buildings[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Active alerts" />
      <div className="flex flex-col gap-2">
        {campus.alerts.map((alert) => (
          <ToggleRow key={alert.id} label={alert.title} sub={alert.message} active={alert.active} onToggle={() => actions.toggleAlertActive(alert.id, alert.active)} />
        ))}
      </div>

      <SectionHeading title="Add an alert" />
      <Card className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Alert title"
          className="min-h-[40px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-sm text-white placeholder:text-white/40"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Alert message shown to users"
          rows={2}
          className="rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 py-2 text-sm text-white placeholder:text-white/40"
        />
        <div className="flex gap-2">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
            className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
          >
            <option value="info">Info</option>
            <option value="advisory">Advisory</option>
            <option value="warning">Warning</option>
          </select>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
          >
            {campus.buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          tone="primary"
          disabled={!title.trim() || !message.trim()}
          onClick={() => {
            actions.addAlert({
              id: `admin-alert-${Date.now()}`,
              severity,
              title: title.trim(),
              message: message.trim(),
              affectedBuildingIds: [buildingId],
              active: true,
              startsAt: new Date().toISOString()
            });
            setTitle("");
            setMessage("");
          }}
        >
          Publish Alert
        </Button>
      </Card>
    </div>
  );
}

function ParkingAdmin({ campus, actions }: { campus: Campus; actions: AdminActions }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Lot status" />
      <div className="flex flex-col gap-2">
        {campus.parkingLots.map((lot) => (
          <ToggleRow
            key={lot.id}
            label={lot.name}
            sub={lot.closed ? "Currently closed" : "Currently open"}
            active={!lot.closed}
            onToggle={() => actions.toggleParkingClosed(lot.id, lot.closed ?? false)}
          />
        ))}
      </div>
    </div>
  );
}

const HOUR_PRESETS = ["06:00", "07:00", "08:00", "08:30", "09:00"];
const CLOSE_PRESETS = ["17:00", "18:00", "20:00", "21:00", "22:00", "23:59"];

function HoursAdmin({ campus, actions }: { campus: Campus; actions: AdminActions }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionHeading title="Building hours" />
      {campus.buildings.map((b) => (
        <Card key={b.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{b.name}</p>
          </div>
          <select
            value={b.hours.opens}
            onChange={(e) => actions.setBuildingHours(b.id, { ...b.hours, opens: e.target.value })}
            className="min-h-[36px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-xs text-white"
          >
            {HOUR_PRESETS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-white/30">–</span>
          <select
            value={b.hours.closes}
            onChange={(e) => actions.setBuildingHours(b.id, { ...b.hours, closes: e.target.value })}
            className="min-h-[36px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-xs text-white"
          >
            {CLOSE_PRESETS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Card>
      ))}
    </div>
  );
}

function ConstructionAdmin({ campus, actions }: { campus: Campus; actions: AdminActions }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionHeading title="Construction notices" />
      {campus.construction.map((c) => (
        <ToggleRow key={c.id} label={c.title} sub={c.description} active={c.active} onToggle={() => actions.toggleConstructionActive(c.id, c.active)} />
      ))}
    </div>
  );
}

function EventsAdmin({ campus, actions }: { campus: Campus; actions: AdminActions }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [venueBuildingId, setVenueBuildingId] = useState(campus.buildings[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Upcoming events" />
      <div className="flex flex-col gap-2">
        {campus.events.map((event) => (
          <Card key={event.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{event.name}</p>
              <p className="truncate text-xs text-white/55">{event.date} · {event.startTime}</p>
            </div>
            <Badge tone="neutral">
              <button type="button" onClick={() => actions.removeEvent(event.id)} className="text-white/70">
                Remove
              </button>
            </Badge>
          </Card>
        ))}
      </div>

      <SectionHeading title="Add an event" />
      <Card className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event name"
          className="min-h-[40px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-3 text-sm text-white placeholder:text-white/40"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="min-h-[40px] flex-1 rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
          />
        </div>
        <select
          value={venueBuildingId}
          onChange={(e) => setVenueBuildingId(e.target.value)}
          className="min-h-[40px] rounded-[var(--radius-control)] border border-white/10 bg-campus-ink px-2 text-sm text-white"
        >
          {campus.buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Button
          tone="primary"
          disabled={!name.trim() || !date}
          onClick={() => {
            actions.addEvent({
              id: `admin-event-${Date.now()}`,
              name: name.trim(),
              date,
              startTime,
              venueBuildingId,
              description: `${name.trim()} at ${campus.buildings.find((b) => b.id === venueBuildingId)?.name ?? "Beacon University"}.`,
              arrivalRecommendation: "Check the venue's building page for parking and entrance guidance."
            });
            setName("");
            setDate("");
          }}
        >
          Publish Event
        </Button>
      </Card>
    </div>
  );
}
