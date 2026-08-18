import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./Primitives";

export type SheetVariant = "peek" | "picker";

/**
 * The one Beacon Campus bottom-sheet shell. Surface, border, shadow, radius,
 * safe-area padding, handle, motion, and focus/backdrop behavior all live
 * here once — BottomSheet (peek: non-modal, map stays interactive, content
 * swaps between a collapsed peek and full detail) and AddStopSheet (picker:
 * modal, focused selection) both configure this instead of recreating it.
 *
 * "peek" renders inline where it's placed (absolutely positioned within
 * MapScreen's own relative container) so the map underneath stays visible
 * and interactive. "picker" portals to <body>, shows a backdrop, and makes
 * the rest of the app `inert` while open — inert is what gives it real
 * focus containment (Tab can never reach anything outside the sheet) without
 * a hand-rolled trap-and-wrap implementation.
 */
export function Sheet({
  variant,
  className,
  onHandleActivate,
  handleLabel,
  onClose,
  label,
  children
}: {
  variant: SheetVariant;
  /** Sheet-specific sizing/positioning (e.g. collapsed vs expanded max-height) — the primitive owns the surface, not the size. */
  className?: string;
  onHandleActivate: () => void;
  handleLabel: string;
  /** Required for "picker" — used for backdrop tap, Escape, and focus return. */
  onClose?: () => void;
  label: string;
  children: ReactNode;
}) {
  const modal = variant === "picker";
  const sheetRef = useRef<HTMLDivElement>(null);
  // Captured during render (once per mount, via the lazy initializer) rather
  // than inside the effect: capturing it in the effect reads document.activeElement
  // *after* React 18 StrictMode's dev-only double-invoke has already run this
  // effect and its cleanup once, by which point focus has already moved into
  // the dialog — so the "opener" reads back as the dialog itself. Render-phase
  // capture happens before any of that, so it's stable regardless.
  const [openerElement] = useState<Element | null>(() => (modal ? document.activeElement : null));

  useEffect(() => {
    if (!modal) return;
    sheetRef.current?.focus();
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      root?.removeAttribute("inert");
      root?.removeAttribute("aria-hidden");
      document.removeEventListener("keydown", onKeyDown);
      if (openerElement instanceof HTMLElement && openerElement.isConnected) openerElement.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  const sheet = (
    <div
      ref={sheetRef}
      role={modal ? "dialog" : "region"}
      aria-modal={modal ? true : undefined}
      aria-label={label}
      tabIndex={-1}
      className={cx(
        "sheet-surface sheet-enter z-20 flex flex-col overflow-hidden border-t border-campus-gold/[0.12] bg-campus-surface",
        // Picker needs `relative` itself (to stack above its own full-cover
        // backdrop-close button); peek's `position` comes entirely from the
        // consumer's className (BottomSheet passes `absolute`). Tailwind
        // emits `.relative` after `.absolute` in its compiled stylesheet, so
        // hardcoding `relative` here unconditionally would always beat a
        // peek consumer's `absolute` regardless of class-list order —
        // silently breaking peek's positioning.
        modal ? "relative" : null,
        // Picker sits flush against the real screen edge (top corners only);
        // peek now floats above the tab bar with a gap below it, so it needs
        // bottom rounding too or it reads as a clipped rectangle.
        modal ? "rounded-t-xl" : "rounded-xl",
        "transition-[max-height] duration-300 [transition-timing-function:var(--ease-premium)]",
        className
      )}
    >
      <button
        type="button"
        onClick={onHandleActivate}
        aria-label={handleLabel}
        className="flex min-h-[44px] w-full shrink-0 items-center justify-center transition-transform active:translate-y-px"
      >
        <span className="h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
      </button>
      {children}
    </div>
  );

  if (!modal) return sheet;

  return createPortal(
    <div className="sheet-backdrop-enter fixed inset-0 z-40 flex flex-col justify-end bg-black/60">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0" tabIndex={-1} />
      {sheet}
    </div>,
    document.body
  );
}
