import { useCallback, useState } from "react";

export type LocationPermissionStatus = "unknown" | "granted" | "denied" | "unavailable";

/**
 * Beacon Campus never requires geolocation — the app is fully usable with a
 * manually chosen starting point. This hook just tracks whether the user has
 * granted browser location access so the UI can tailor its copy.
 */
export function useLocationPermission() {
  const [status, setStatus] = useState<LocationPermissionStatus>("unknown");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setStatus("granted"),
      () => setStatus("denied"),
      { timeout: 5000 }
    );
  }, []);

  const declineLocation = useCallback(() => setStatus("denied"), []);

  return { status, requestLocation, declineLocation };
}
