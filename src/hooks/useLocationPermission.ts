import { useCallback, useState } from "react";

export type LocationPermissionStatus = "unknown" | "granted" | "denied" | "unavailable";

/**
 * Clemson's campus center, per public coordinate references (see the audit's
 * geolocation finding). Beacon Campus's own map is an illustrative, non-surveyed
 * layout — not a to-scale geographic projection — so real GPS coordinates can't
 * be mapped onto it precisely. Rather than fake that precision, this hook uses
 * a real position for exactly one honest, low-precision purpose: confirming
 * whether the device is actually near campus at all, via a straight-line
 * distance check. It never picks a specific building or path node.
 */
const CAMPUS_CENTER = { lat: 34.6834, lng: -82.8374 };
const NEAR_CAMPUS_RADIUS_MILES = 2;

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useLocationPermission() {
  const [status, setStatus] = useState<LocationPermissionStatus>("unknown");
  const [nearCampus, setNearCampus] = useState<boolean | null>(null);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = haversineMiles(CAMPUS_CENTER, { lat: position.coords.latitude, lng: position.coords.longitude });
        setNearCampus(distance <= NEAR_CAMPUS_RADIUS_MILES);
        setStatus("granted");
      },
      () => setStatus("denied"),
      { timeout: 5000 }
    );
  }, []);

  const declineLocation = useCallback(() => setStatus("denied"), []);

  return { status, nearCampus, requestLocation, declineLocation };
}
