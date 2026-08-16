import { useCallback, useEffect, useMemo, useState } from "react";
import { BEACON_UNIVERSITY } from "../data/beaconUniversity";
import type { BuildingHours, Campus, CampusAlert, CampusEvent } from "../types/campus";

const STORAGE_KEY = "beacon-campus-admin-overrides-v1";

interface AdminOverrides {
  alertActive: Record<string, boolean>;
  addedAlerts: CampusAlert[];
  parkingClosed: Record<string, boolean>;
  buildingHours: Record<string, BuildingHours>;
  constructionActive: Record<string, boolean>;
  addedEvents: CampusEvent[];
  removedEventIds: string[];
}

const EMPTY_OVERRIDES: AdminOverrides = {
  alertActive: {},
  addedAlerts: [],
  parkingClosed: {},
  buildingHours: {},
  constructionActive: {},
  addedEvents: [],
  removedEventIds: []
};

function loadOverrides(): AdminOverrides {
  if (typeof window === "undefined") return EMPTY_OVERRIDES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_OVERRIDES;
    return { ...EMPTY_OVERRIDES, ...JSON.parse(raw) };
  } catch {
    return EMPTY_OVERRIDES;
  }
}

/**
 * This is Beacon Campus's local-only "admin" layer: edits made in the admin
 * preview console are persisted to localStorage and merged over the base
 * fixture data on every read, so changes are immediately visible in the live
 * app within the same browser session. There is no backend.
 */
export function useCampusData() {
  const [overrides, setOverrides] = useState<AdminOverrides>(loadOverrides);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const campus: Campus = useMemo(() => {
    const alerts = [
      ...BEACON_UNIVERSITY.alerts.map((a) => ({
        ...a,
        active: overrides.alertActive[a.id] ?? a.active
      })),
      ...overrides.addedAlerts
    ];

    const parkingLots = BEACON_UNIVERSITY.parkingLots.map((lot) => ({
      ...lot,
      closed: overrides.parkingClosed[lot.id] ?? lot.closed
    }));

    const buildings = BEACON_UNIVERSITY.buildings.map((b) => ({
      ...b,
      hours: overrides.buildingHours[b.id] ?? b.hours
    }));

    const construction = BEACON_UNIVERSITY.construction.map((c) => ({
      ...c,
      active: overrides.constructionActive[c.id] ?? c.active
    }));

    const events = [
      ...BEACON_UNIVERSITY.events.filter((e) => !overrides.removedEventIds.includes(e.id)),
      ...overrides.addedEvents
    ];

    return { ...BEACON_UNIVERSITY, alerts, parkingLots, buildings, construction, events };
  }, [overrides]);

  const toggleAlertActive = useCallback((id: string, current: boolean) => {
    setOverrides((prev) => ({ ...prev, alertActive: { ...prev.alertActive, [id]: !current } }));
  }, []);

  const addAlert = useCallback((alert: CampusAlert) => {
    setOverrides((prev) => ({ ...prev, addedAlerts: [alert, ...prev.addedAlerts] }));
  }, []);

  const removeAddedAlert = useCallback((id: string) => {
    setOverrides((prev) => ({ ...prev, addedAlerts: prev.addedAlerts.filter((a) => a.id !== id) }));
  }, []);

  const toggleParkingClosed = useCallback((lotId: string, current: boolean) => {
    setOverrides((prev) => ({ ...prev, parkingClosed: { ...prev.parkingClosed, [lotId]: !current } }));
  }, []);

  const setBuildingHours = useCallback((buildingId: string, hours: BuildingHours) => {
    setOverrides((prev) => ({ ...prev, buildingHours: { ...prev.buildingHours, [buildingId]: hours } }));
  }, []);

  const toggleConstructionActive = useCallback((id: string, current: boolean) => {
    setOverrides((prev) => ({ ...prev, constructionActive: { ...prev.constructionActive, [id]: !current } }));
  }, []);

  const addEvent = useCallback((event: CampusEvent) => {
    setOverrides((prev) => ({ ...prev, addedEvents: [event, ...prev.addedEvents] }));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setOverrides((prev) => ({
      ...prev,
      addedEvents: prev.addedEvents.filter((e) => e.id !== id),
      removedEventIds: prev.removedEventIds.includes(id) ? prev.removedEventIds : [...prev.removedEventIds, id]
    }));
  }, []);

  const resetOverrides = useCallback(() => setOverrides(EMPTY_OVERRIDES), []);

  return {
    campus,
    hasCustomizations: JSON.stringify(overrides) !== JSON.stringify(EMPTY_OVERRIDES),
    actions: {
      toggleAlertActive,
      addAlert,
      removeAddedAlert,
      toggleParkingClosed,
      setBuildingHours,
      toggleConstructionActive,
      addEvent,
      removeEvent,
      resetOverrides
    }
  };
}
