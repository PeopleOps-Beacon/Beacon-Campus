import { useEffect, useState, type KeyboardEvent } from "react";
import type { SearchResult } from "../types/campus";

export function optionId(result: SearchResult): string {
  return `option-${result.kind}-${result.id}`;
}

/**
 * Roving-index keyboard navigation for the search results combobox — mirrors
 * Beacon Airport's SearchBar pattern (ArrowUp/Down/Enter/Escape over
 * aria-activedescendant rather than native tab order).
 */
export function useComboboxNavigation(results: SearchResult[], onSelect: (result: SearchResult) => void) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  const activeId = activeIndex >= 0 && results[activeIndex] ? optionId(results[activeIndex]) : undefined;

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        onSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  }

  return { activeIndex, activeId, onKeyDown };
}
