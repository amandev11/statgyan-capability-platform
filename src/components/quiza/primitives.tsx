import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function PageContainer({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide" | "reading";
}) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-[1200px]",
    reading: "max-w-2xl",
  };
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        widths[width],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-lg font-semibold tracking-tight text-[var(--qz-text)] sm:text-xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-emerald-300/90 border-emerald-300/20 bg-emerald-400/[0.06]",
  Medium: "text-amber-200/90 border-amber-300/20 bg-amber-400/[0.06]",
  Hard: "text-rose-300/90 border-rose-300/20 bg-rose-400/[0.06]",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        DIFFICULTY_STYLES[difficulty] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-current opacity-80" />
      {difficulty}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border hairline-faint bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress ring — used for results and profile accuracy
// ---------------------------------------------------------------------------

export function ProgressRing({
  value,
  size = 168,
  strokeWidth = 6,
  label,
  sublabel,
}: {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--qz-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)",
            filter: "drop-shadow(0 0 8px rgba(108,140,255,0.35))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label}
        {sublabel}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function StatBlock({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="num text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-qz">{label}</p>
      {hint ? <p className="mt-0.5 truncate text-xs text-secondary">{hint}</p> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-lg", className)} aria-hidden />;
}

// ---------------------------------------------------------------------------
// Verdict — maps a score to calm editorial language
// ---------------------------------------------------------------------------

export function verdictFor(scorePct: number): { label: string; note: string } {
  if (scorePct >= 95) return { label: "Exceptional", note: "Near-flawless recall." };
  if (scorePct >= 85) return { label: "Excellent", note: "Strong command of the material." };
  if (scorePct >= 70) return { label: "Solid", note: "Good grasp with a few soft spots." };
  if (scorePct >= 50) return { label: "Developing", note: "The foundations are there." };
  return { label: "Room to grow", note: "A worthwhile challenge — try again." };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
