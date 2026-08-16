import { Search, X } from "lucide-react";
import type { InputHTMLAttributes, KeyboardEvent } from "react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Where do you need to go?",
  autoFocus,
  expanded,
  activeDescendant,
  listboxId,
  onKeyDown,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Combobox pattern (mirrors Beacon Airport's SearchBar): set these three
   *  when results are shown below, to get full ArrowUp/Down/Enter/Escape nav. */
  expanded?: boolean;
  activeDescendant?: string;
  listboxId?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder" | "onKeyDown">) {
  const isCombobox = listboxId !== undefined;
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
      <input
        {...rest}
        type="search"
        role={isCombobox ? "combobox" : "searchbox"}
        aria-label="Search Beacon Campus"
        aria-autocomplete={isCombobox ? "list" : undefined}
        aria-expanded={isCombobox ? Boolean(expanded) : undefined}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-[var(--radius-pill)] border border-white/10 bg-campus-surface py-2.5 pl-10 pr-10 text-[15px] text-white placeholder:text-white/40 focus:border-campus-gold/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
