import { GlassCard, PageHeader, PriorityBadge, ScoreBar } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, ChevronRight, Info } from "lucide-react";
import { Fragment, useState } from "react";
import { Link } from "react-router";

export default function Gaps() {
  const { skillGaps, courseMatches } = useStatgyan();
  const [openId, setOpenId] = useState<string | null>(
    skillGaps[0]?.competencyId ?? null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Skill-Gap Detection"
        title="Where the highest-impact gaps are"
        subtitle="Gaps are ranked by a Competency Priority Score — gap magnitude weighted by role relevance, competency importance, assessment confidence and organizational priority. Not a raw score sort."
      />

      {/* Priority score formula */}
      <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <BrainCircuit className="size-4" /> Priority Score model
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-semibold text-slate-700">40%</span> proficiency gap
          <span>·</span>
          <span className="font-semibold text-slate-700">25%</span> role relevance
          <span>·</span>
          <span className="font-semibold text-slate-700">15%</span> competency importance
          <span>·</span>
          <span className="font-semibold text-slate-700">10%</span> confidence deficit
          <span>·</span>
          <span className="font-semibold text-slate-700">10%</span> org priority
          <Info className="size-3.5" aria-label="Explainable weighting model" />
        </div>
      </GlassCard>

      {/* Gap table */}
      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Competency</th>
              <th className="hidden px-2 py-3 text-right font-semibold sm:table-cell">Current</th>
              <th className="hidden px-2 py-3 text-right font-semibold sm:table-cell">Target</th>
              <th className="px-2 py-3 text-right font-semibold">Gap</th>
              <th className="px-2 py-3 text-center font-semibold">Priority</th>
              <th className="px-4 py-3 text-right font-semibold">Score</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {skillGaps.map((g) => {
              const comp = COMPETENCY_MAP[g.competencyId];
              const open = openId === g.competencyId;
              return (
                <Fragment key={g.competencyId}>
                  <tr
                    onClick={() => setOpenId(open ? null : g.competencyId)}
                    className={cn(
                      "cursor-pointer border-b border-white/50 transition-colors hover:bg-white/60",
                      open && "bg-white/70",
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{comp?.name}</td>
                    <td className="hidden px-2 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{g.current}</td>
                    <td className="hidden px-2 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{g.target}</td>
                    <td className={cn("px-2 py-3 text-right font-semibold tabular-nums", g.gap > 0 ? "text-rose-600" : "text-emerald-600")}>
                      {g.gap > 0 ? `−${g.gap}` : `+${Math.abs(g.gap)}`}
                    </td>
                    <td className="px-2 py-3 text-center"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{g.priorityScore}</td>
                    <td className="pr-3">
                      <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-white/60 bg-white/55">
                      <td colSpan={7} className="px-4 pb-4 pt-1">
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                          <p className="max-w-3xl text-[13px] leading-relaxed text-slate-700">
                            {g.reasoning}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                            <div className="glass-subtle rounded-lg p-2">
                              Role relevance <b className="block text-sm text-slate-800">{Math.round(g.roleRelevance * 100)}%</b>
                            </div>
                            <div className="glass-subtle rounded-lg p-2">
                              Importance <b className="block text-sm text-slate-800">{Math.round(g.importance * 100)}%</b>
                            </div>
                            <div className="glass-subtle rounded-lg p-2">
                              Org priority <b className="block text-sm text-slate-800">{Math.round(g.orgPriority * 100)}%</b>
                            </div>
                            <div className="glass-subtle rounded-lg p-2">
                              Evidence confidence <b className="block text-sm text-slate-800">{g.confidence}%</b>
                            </div>
                          </div>
                          <div className="mt-3 max-w-xs">
                            <ScoreBar value={g.current} />
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      {courseMatches[0] && (
        <GlassCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Recommendation · AI-generated</p>
            <p className="mt-1 text-sm text-slate-700">
              Highest-impact intervention: <b>{courseMatches[0].course.title}</b> — {courseMatches[0].why}
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5">
            <Link to="/dashboard/path">Build my learning path <ChevronRight className="size-4" /></Link>
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
