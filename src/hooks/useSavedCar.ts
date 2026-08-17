import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "beacon-campus-saved-car-v1";

export interface SavedCar {
  lotId: string;
  note?: string;
  savedAt: number;
}

function load(): SavedCar | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remember My Car — a single saved parking spot, on-device only, cleared whenever the driver chooses. */
export function useSavedCar() {
  const [savedCar, setSavedCar] = useState<SavedCar | null>(load);

  useEffect(() => {
    if (savedCar) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCar));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [savedCar]);

  const rememberCar = useCallback((lotId: string, note?: string) => {
    setSavedCar({ lotId, note: note?.trim() || undefined, savedAt: Date.now() });
  }, []);

  const clearCar = useCallback(() => setSavedCar(null), []);

  return { savedCar, rememberCar, clearCar };
}
