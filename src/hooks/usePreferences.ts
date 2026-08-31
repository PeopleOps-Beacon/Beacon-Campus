import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type CampusPreferences } from "../types/campus";

const STORAGE_KEY = "beacon-campus-preferences-v1";
const EXPIRY_KEY = "beacon-campus-preference-expiry-v1";

/** Preset durations a preference can be set for, instead of only "always on." */
export const PREFERENCE_DURATIONS = [
  { id: "always", label: "Always", ms: null },
  { id: "today", label: "Today only", ms: 24 * 60 * 60 * 1000 },
  { id: "1week", label: "1 week", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "6weeks", label: "6 weeks", ms: 42 * 24 * 60 * 60 * 1000 }
] as const;

type Expiry = Partial<Record<keyof CampusPreferences, number>>;

function loadPreferences(): CampusPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadExpiry(): Expiry {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(EXPIRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Drops any expiry entries that have already passed, resetting that preference to off. */
function applyExpiry(preferences: CampusPreferences, expiry: Expiry): { preferences: CampusPreferences; expiry: Expiry } {
  const now = Date.now();
  let changed = false;
  const nextPreferences = { ...preferences };
  const nextExpiry = { ...expiry };
  for (const key of Object.keys(nextExpiry) as (keyof CampusPreferences)[]) {
    const expiresAt = nextExpiry[key];
    if (typeof expiresAt === "number" && expiresAt <= now) {
      nextPreferences[key] = false;
      delete nextExpiry[key];
      changed = true;
    }
  }
  return changed ? { preferences: nextPreferences, expiry: nextExpiry } : { preferences, expiry };
}

/**
 * A preference set this way isn't necessarily permanent — someone recovering
 * from a temporary injury or navigating one high-stimulation event doesn't
 * want to remember to turn "step-free" back off in six weeks. Preferences can
 * carry an optional expiry; on load (and periodically while the app stays
 * open) anything past its expiry is quietly reset to off.
 */
export function usePreferences() {
  const [state, setState] = useState<{ preferences: CampusPreferences; expiry: Expiry }>(() =>
    applyExpiry(loadPreferences(), loadExpiry())
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.preferences));
    window.localStorage.setItem(EXPIRY_KEY, JSON.stringify(state.expiry));
    document.documentElement.classList.toggle("large-text", state.preferences.largerText);
    document.documentElement.classList.toggle("high-contrast", state.preferences.highContrast);
  }, [state]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((prev) => applyExpiry(prev.preferences, prev.expiry));
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const setPreference = useCallback(<K extends keyof CampusPreferences>(key: K, value: CampusPreferences[K]) => {
    setState((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  }, []);

  const togglePreference = useCallback((key: keyof CampusPreferences) => {
    setState((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: !prev.preferences[key] } }));
  }, []);

  /** Toggles a preference on/off; when turning on, `durationMs` (null = always) sets or clears its expiry. */
  const setPreferenceWithDuration = useCallback((key: keyof CampusPreferences, enabled: boolean, durationMs: number | null) => {
    setState((prev) => {
      const nextExpiry = { ...prev.expiry };
      if (enabled && durationMs !== null) nextExpiry[key] = Date.now() + durationMs;
      else delete nextExpiry[key];
      return { preferences: { ...prev.preferences, [key]: enabled }, expiry: nextExpiry };
    });
  }, []);

  return {
    preferences: state.preferences,
    expiry: state.expiry,
    setPreference,
    togglePreference,
    setPreferenceWithDuration
  };
}
