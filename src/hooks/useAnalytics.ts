import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "beacon-campus-analytics-v1";

export interface AnalyticsState {
  searchCounts: Record<string, number>;
  destinationViewCounts: Record<string, number>;
  preferenceToggleCounts: Record<string, number>;
  sessionCount: number;
}

const EMPTY_STATE: AnalyticsState = {
  searchCounts: {},
  destinationViewCounts: {},
  preferenceToggleCounts: {},
  sessionCount: 0
};

function loadState(): AnalyticsState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_STATE;
  }
}

/**
 * Real, anonymous, local-only usage tracking — no PII, no server, no
 * cross-session identity. This is genuinely computed from what this browser
 * has searched for and visited (see the spec's "no invasive individual
 * tracking" guidance), not fabricated demo numbers. It powers the Executive
 * Insights "this session" tiles; the rest of that dashboard is clearly
 * labeled illustrative campus-wide data since Beacon Campus has no backend.
 */
export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>(loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    setState((prev) => ({ ...prev, sessionCount: prev.sessionCount + 1 }));
  }, []);

  const trackSearch = useCallback((query: string) => {
    const key = query.trim().toLowerCase();
    if (!key) return;
    setState((prev) => ({ ...prev, searchCounts: { ...prev.searchCounts, [key]: (prev.searchCounts[key] ?? 0) + 1 } }));
  }, []);

  const trackDestinationView = useCallback((buildingId: string) => {
    setState((prev) => ({
      ...prev,
      destinationViewCounts: { ...prev.destinationViewCounts, [buildingId]: (prev.destinationViewCounts[buildingId] ?? 0) + 1 }
    }));
  }, []);

  const trackPreferenceToggle = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      preferenceToggleCounts: { ...prev.preferenceToggleCounts, [key]: (prev.preferenceToggleCounts[key] ?? 0) + 1 }
    }));
  }, []);

  const resetAnalytics = useCallback(() => setState(EMPTY_STATE), []);

  const topEntries = useCallback((record: Record<string, number>, limit = 5) => {
    return Object.entries(record)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }, []);

  return { state, trackSearch, trackDestinationView, trackPreferenceToggle, resetAnalytics, topEntries };
}

export type UseAnalytics = ReturnType<typeof useAnalytics>;
