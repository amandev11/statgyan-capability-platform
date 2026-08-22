import { AiLabel, GlassCard, PageHeader } from "@/components/statgyan/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { COMPETENCY_MAP, COURSES } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Info, Search, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

export default function Igot() {
  const { courseMatches, skillGaps } = useStatgyan();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const focusCourseId = params.get("course");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return COURSES.filter(
      (c) =>
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.summary.toLowerCase().includes(query),
    );
  }, [q]);

  const matchesById = Object.fromEntries(courseMatches.map((m) => [m.course.id, m]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="iGOT Connect"
        title="From detected gaps to the right training"
        subtitle="The iGOT Integration Adapter maps your competency gaps onto the course catalogue using semantic competency matching — not keyword search. Deep links are adapter placeholders until live API credentials are configured."
      />

      <GlassCard className="flex items-start gap-2.5 p-4 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" />
        <p>
          <b className="text-slate-700">Integration status:</b> demo catalogue behind an API-ready adapter.
          When an official iGOT Karmayogi API/catalogue is connected, only the adapter layer changes — the
          recommendation engine and UI remain untouched. No live government API is claimed here.
        </p>
      </GlassCard>

      {/* Architecture strip */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/40 p-3 text-[11px] font-medium text-slate-500 backdrop-blur-sm">
        <span>Competency Engine</span>→<span>Recommendation Engine</span>→<span className="rounded-md bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-700">iGOT Adapter</span>→<span>Course Catalogue</span>→<span>Personalized Training</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the catalogue…"
          className="glass pl-9"
          aria-label="Search courses"
        />
      </div>

      {/* Course grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => {
          const match = matchesById[course.id];
          const isFocus = course.id === focusCourseId;
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass glass-hover flex flex-col rounded-xl p-5",
                isFocus && "ring-2 ring-indigo-400",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold leading-snug">{course.title}</h2>
                {match && (
                  <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-1 text-center">
                    <span className="block text-sm font-bold leading-none text-emerald-700 tabular-nums">{match.matchScore}%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">match</span>
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <span>{course.provider}</span>
                <Badge variant="outline" className="bg-white/70 text-[10px]">{course.level}</Badge>
                <span className="flex items-center gap-0.5"><Timer className="size-3" /> {Math.floor(course.durationMin / 60)}h {course.durationMin % 60}m</span>
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600">{course.summary}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {course.competencies.map((c) => (
                  <Badge key={c.competencyId} variant="secondary" className="text-[10px] font-normal">
                    {COMPETENCY_MAP[c.competencyId]?.name} · {Math.round(c.coverage * 100)}%
                  </Badge>
                ))}
              </div>

              {match && (
                <p className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/70 p-2.5 text-[11px] leading-relaxed text-emerald-900">
                  <b>Why:</b> {match.why} Covers {match.skillCoverage}% of your current gap mass; estimated improvement ≈ +{match.estimatedImprovement} pts.
                </p>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="mt-4 w-full gap-1.5">
                    Course details <ArrowUpRight className="size-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong max-w-md">
                  <DialogHeader>
                    <DialogTitle>{course.title}</DialogTitle>
                    <DialogDescription>
                      {course.provider} · {course.level} · {course.durationMin} min ·{" "}
                      <span className="italic">{course.source}</span>
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm leading-relaxed text-slate-700">{course.summary}</p>
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries({
                      Relevance: match ? `${match.matchScore}% match to your gaps` : "General catalogue item",
                      "Skill coverage": match ? `${match.skillCoverage}% of your gap mass` : "—",
                      "Difficulty fit": match ? `${match.difficultyFit}%` : "—",
                      "Est. improvement": match ? `≈ +${match.estimatedImprovement} pts (AI estimate)` : "—",
                      "Gaps addressed": match ? `${match.gapsCovered} of ${match.totalGaps}` : "—",
                    }).map(([k, v]) => (
                      <li key={k} className="flex justify-between border-b border-white/60 pb-1 text-xs">
                        <span className="text-muted-foreground">{k}</span>
                        <b className="text-slate-800">{v}</b>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={course.url}
                    onClick={(e) => e.preventDefault()}
                    aria-disabled
                    title="Deep-link placeholder — activates when the live iGOT catalogue is connected"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                  >
                    <ExternalLink className="size-4" /> Open on iGOT Karmayogi (placeholder)
                  </a>
                </DialogContent>
              </Dialog>
            </motion.div>
          );
        })}
      </div>

      <AiLabel>
        Match scores computed from {skillGaps.filter((g) => g.gap > 5).length} active gaps — recomputed after every assessment
      </AiLabel>
    </div>
  );
}
