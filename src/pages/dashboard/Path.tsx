import { AiLabel, GlassCard, PageHeader, PriorityBadge } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import { motion } from "framer-motion";
import { BookOpenCheck, Clock, Route as RouteIcon, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function Path() {
  const { learningPath, skillGaps } = useStatgyan();
  const totalMinutes = learningPath.reduce((s, m) => s + m.minutes, 0);
  const totalGain = learningPath.reduce((s, m) => s + m.expectedImprovement, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personalized Learning Path"
        title="Your AI Learning Path"
        subtitle={`Sequenced by the recommendation engine from your ${skillGaps.filter((g) => g.gap > 8).length} significant gaps — each step explains itself before you commit time.`}
        actions={
          <Button asChild className="gap-2">
            <Link to="/dashboard/igot"><BookOpenCheck className="size-4" /> Find courses on iGOT</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Modules</p>
          <p className="text-2xl font-bold tabular-nums">{learningPath.length}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Estimated time</p>
          <p className="text-2xl font-bold tabular-nums">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Projected gain</p>
          <p className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums text-emerald-600">
            +{totalGain}<TrendingUp className="size-4" />
          </p>
        </GlassCard>
      </div>

      {/* Pipeline */}
      <ol className="relative space-y-4 pl-6">
        <span aria-hidden className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent" />
        {learningPath.map((m, idx) => (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="relative"
          >
            <span className="absolute -left-6 top-5 flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 shadow-md ring-1 ring-indigo-200" aria-hidden>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="glass glass-hover rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">{m.title}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {m.minutes} min · targets {COMPETENCY_MAP[m.competencyId]?.name}
                  </p>
                </div>
                <PriorityBadge priority={m.priority} />
              </div>
              <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                <div className="glass-subtle rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Why this module</p>
                  <p className="mt-1 leading-relaxed text-slate-700">{m.why}</p>
                </div>
                <div className="glass-subtle rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gap it solves</p>
                  <p className="mt-1 font-medium text-slate-700">{m.gapSolved}</p>
                </div>
                <div className="glass-subtle rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expected improvement</p>
                  <p className="mt-1 font-medium text-emerald-700">≈ +{m.expectedImprovement} pts · AI estimate</p>
                </div>
              </div>
              {m.courseId && (
                <Button asChild variant="ghost" size="sm" className="mt-3 gap-1 px-2 text-primary">
                  <Link to={`/dashboard/igot?course=${m.courseId}`}>
                    View matched course <RouteIcon className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      <AiLabel>Path regenerated automatically after every assessment — new evidence reshapes your route</AiLabel>
    </div>
  );
}
