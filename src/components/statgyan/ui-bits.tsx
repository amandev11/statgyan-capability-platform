import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { GapPriority, InsightKind } from "@/lib/statgyan/types";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="glass glass-hover rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-primary/70">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const priorityStyles: Record<GapPriority, string> = {
  CRITICAL: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  HIGH: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  MEDIUM: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  LOW: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
};

export function PriorityBadge({ priority }: { priority: GapPriority }) {
  return (
    <Badge variant="outline" className={cn("font-semibold", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}

/** Heatmap colour scale for 0–100 proficiency */
export function heatColor(score: number): string {
  if (score >= 75) return "bg-emerald-400/70";
  if (score >= 60) return "bg-lime-300/70";
  if (score >= 45) return "bg-amber-300/70";
  if (score >= 30) return "bg-orange-400/70";
  return "bg-rose-400/70";
}

export function ScoreBar({ value, className }: { value: number; className?: string }) {
  const color =
    value >= 75
      ? "bg-emerald-500"
      : value >= 60
        ? "bg-lime-500"
        : value >= 45
          ? "bg-amber-500"
          : value >= 30
            ? "bg-orange-500"
            : "bg-rose-500";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-900/10", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  );
}

const insightConfig: Record<
  InsightKind,
  { icon: typeof Lightbulb; classes: string; label: string }
> = {
  insight: {
    icon: Sparkles,
    classes: "border-indigo-300/50 bg-indigo-50/60",
    label: "AI Insight",
  },
  "priority-alert": {
    icon: AlertTriangle,
    classes: "border-amber-300/60 bg-amber-50/60",
    label: "Priority Alert",
  },
  recommendation: {
    icon: Lightbulb,
    classes: "border-emerald-300/50 bg-emerald-50/60",
    label: "Recommendation",
  },
};

export function InsightCard({
  kind,
  title,
  body,
  action,
}: {
  kind: InsightKind;
  title?: string;
  body: string;
  action?: ReactNode;
}) {
  const cfg = insightConfig[kind];
  const Icon = cfg.icon;
  return (
    <div className={cn("rounded-xl border p-4 backdrop-blur-sm", cfg.classes)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-white/80 p-1.5 shadow-sm">
          <Icon className="size-4 text-indigo-600" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {title ?? cfg.label} · AI-generated
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{body}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function AiLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
      <Sparkles className="size-3" /> {children ?? "AI-generated"}
    </span>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-xl", className)}>{children}</div>
  );
}
