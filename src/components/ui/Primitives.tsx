import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-card)] border border-white/[0.06] bg-campus-surface p-4 shadow-[var(--shadow-card)]",
        "transition-shadow duration-200 [transition-timing-function:var(--ease-premium)]",
        "[button:hover>&]:shadow-[var(--shadow-card-hover)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  tone = "secondary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const toneClasses: Record<ButtonTone, string> = {
    primary: "bg-campus-gold text-campus-ink hover:brightness-95 active:brightness-90",
    secondary: "bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/10",
    ghost: "bg-transparent text-white hover:bg-white/[0.06]",
    danger: "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
  };
  return (
    <button
      className={cx(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-semibold transition-all duration-150 [transition-timing-function:var(--ease-premium)] active:scale-[0.97]",
        "disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100",
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type BadgeTone = "neutral" | "info" | "warning" | "success" | "danger" | "gold";

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  const toneClasses: Record<BadgeTone, string> = {
    neutral: "bg-white/[0.08] text-white/80",
    info: "bg-campus-sky/15 text-campus-sky",
    warning: "bg-campus-gold/15 text-campus-amber",
    success: "bg-campus-green/15 text-campus-green",
    danger: "bg-red-500/15 text-red-300",
    gold: "bg-campus-gold text-campus-ink"
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  title,
  action,
  id
}: {
  title: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 id={id} className="text-[var(--font-title)] font-semibold text-white">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-white/10 px-6 py-10 text-center">
      {icon && <div className="text-white/40">{icon}</div>}
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="max-w-xs text-sm text-white/60">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-red-300">{title}</p>
      <p className="max-w-xs text-sm text-white/60">{message}</p>
      {action}
    </div>
  );
}

export function IconTile({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  const toneClasses: Record<BadgeTone, string> = {
    neutral: "bg-white/[0.08] text-white",
    info: "bg-campus-sky/15 text-campus-sky",
    warning: "bg-campus-gold/15 text-campus-amber",
    success: "bg-campus-green/15 text-campus-green",
    danger: "bg-red-500/15 text-red-300",
    gold: "bg-campus-gold text-campus-ink"
  };
  return (
    <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>{children}</div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors [transition-timing-function:var(--ease-premium)]",
        checked ? "bg-campus-gold" : "bg-white/15"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform [transition-timing-function:var(--ease-premium)]",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-[var(--radius-control)] bg-white/[0.06]", className)} />;
}
