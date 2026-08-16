// Small time helpers shared across screens. Beacon is deliberately calm in its
// language — see formatLeaveBy for the "no alarming language" rule from the spec.

export function parseHHMM(value: string, referenceDate: Date = new Date()): Date {
  const [hours, minutes] = value.split(":").map(Number);
  const d = new Date(referenceDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function formatClockTime(value: string): string {
  const d = parseHHMM(value);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 60000);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 1) return "1 minute";
  return `${minutes} minutes`;
}

export function formatWalk(minutes: number): string {
  return `${minutes} minute walk`;
}

export interface LeaveByInfo {
  minutesUntilStart: number;
  leaveByTime: Date;
  minutesUntilLeaveBy: number;
  message: string;
  tone: "comfortable" | "soon" | "now" | "past";
}

/**
 * Calm, non-alarming "leave by" guidance. Never says things like "YOU WILL BE LATE" —
 * see the spec's Emotional Intelligence section.
 */
export function getLeaveByInfo(startTime: string, walkMinutes: number, now: Date = new Date()): LeaveByInfo {
  const start = parseHHMM(startTime, now);
  const minutesUntilStart = minutesBetween(now, start);
  const bufferMinutes = 3;
  const leaveByTime = addMinutes(start, -(walkMinutes + bufferMinutes));
  const minutesUntilLeaveBy = minutesBetween(now, leaveByTime);

  let tone: LeaveByInfo["tone"];
  let message: string;

  if (minutesUntilStart < 0) {
    tone = "past";
    message = "This class has already started.";
  } else if (minutesUntilLeaveBy <= 0) {
    tone = "now";
    message = `Heading out now should get you there close to the start time.`;
  } else if (minutesUntilLeaveBy <= 10) {
    tone = "soon";
    message = `Leaving within the next ${formatMinutes(minutesUntilLeaveBy)} will give you a comfortable arrival.`;
  } else {
    tone = "comfortable";
    message = `You have enough time. Leaving by ${leaveByTime.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    })} keeps things relaxed.`;
  }

  return { minutesUntilStart, leaveByTime, minutesUntilLeaveBy, message, tone };
}

export function isWithinHours(opens: string, closes: string, now: Date = new Date()): boolean {
  const open = parseHHMM(opens, now);
  let close = parseHHMM(closes, now);
  if (close <= open) close = addMinutes(close, 24 * 60);
  return now >= open && now <= close;
}
