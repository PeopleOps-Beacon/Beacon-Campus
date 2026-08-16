import { useCallback, useEffect, useState } from "react";
import type { Campus } from "../types/campus";

const STORAGE_KEY = "beacon-campus-read-alerts-v1";

function loadRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useNotificationRead(campus: Campus) {
  const [readIds, setReadIds] = useState<string[]>(loadRead);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
  }, [readIds]);

  const activeAlertIds = campus.alerts.filter((a) => a.active).map((a) => a.id);
  const unreadCount = activeAlertIds.filter((id) => !readIds.includes(id)).length;

  const markAllRead = useCallback(() => {
    setReadIds((prev) => Array.from(new Set([...prev, ...activeAlertIds])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campus]);

  return { unreadCount, markAllRead };
}
