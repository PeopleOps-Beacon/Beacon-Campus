import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "beacon-campus-accessibility-reports-v1";

export type AccessibilityIssueCategory =
  | "elevator-out"
  | "door-locked"
  | "ramp-blocked"
  | "construction"
  | "entrance-unavailable"
  | "sidewalk-obstruction"
  | "crosswalk-issue"
  | "signage-problem"
  | "restroom-issue"
  | "sensory-concern"
  | "other";

export const ACCESSIBILITY_ISSUE_CATEGORIES: { id: AccessibilityIssueCategory; label: string }[] = [
  { id: "elevator-out", label: "Elevator Out" },
  { id: "door-locked", label: "Door Locked" },
  { id: "ramp-blocked", label: "Ramp Blocked" },
  { id: "construction", label: "Construction" },
  { id: "entrance-unavailable", label: "Accessible Entrance Unavailable" },
  { id: "sidewalk-obstruction", label: "Sidewalk Obstruction" },
  { id: "crosswalk-issue", label: "Crosswalk Issue" },
  { id: "signage-problem", label: "Signage Problem" },
  { id: "restroom-issue", label: "Restroom Issue" },
  { id: "sensory-concern", label: "Sensory Concern" },
  { id: "other", label: "Other" }
];

export interface AccessibilityIssueReport {
  id: string;
  category: AccessibilityIssueCategory;
  location: string;
  description: string;
  submittedAt: string; // ISO
}

/**
 * Real, local-only issue reports — no account, no identity, nothing tied to
 * an individual's accessibility profile. Mirrors useAnalytics's storage
 * pattern exactly: genuinely persisted in this browser, never sent anywhere,
 * and only ever surfaced in aggregate (a count, a category, a location) —
 * never as "this specific person reported this."
 */
export function useAccessibilityReports() {
  const [reports, setReports] = useState<AccessibilityIssueReport[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AccessibilityIssueReport[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const submitReport = useCallback((category: AccessibilityIssueCategory, location: string, description: string) => {
    const report: AccessibilityIssueReport = {
      id: `report-${Date.now()}`,
      category,
      location: location.trim(),
      description: description.trim(),
      submittedAt: new Date().toISOString()
    };
    setReports((prev) => [report, ...prev]);
    return report;
  }, []);

  return { reports, submitReport };
}
