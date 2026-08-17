// Real Vibration API usage — a no-op everywhere it isn't supported (most
// desktop browsers, iOS Safari). Used sparingly, only at moments a native
// nav app would actually pulse: a step advancing, a route starting, arrival.

export function pulse(ms: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(ms);
  } catch {
    // Some browsers throw if called outside a user gesture — safe to ignore.
  }
}
