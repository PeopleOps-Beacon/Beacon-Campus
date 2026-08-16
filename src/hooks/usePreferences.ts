import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type CampusPreferences } from "../types/campus";

const STORAGE_KEY = "beacon-campus-preferences-v1";

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

export function usePreferences() {
  const [preferences, setPreferences] = useState<CampusPreferences>(loadPreferences);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.classList.toggle("large-text", preferences.largerText);
  }, [preferences]);

  const setPreference = useCallback(<K extends keyof CampusPreferences>(key: K, value: CampusPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const togglePreference = useCallback((key: keyof CampusPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { preferences, setPreference, togglePreference };
}
