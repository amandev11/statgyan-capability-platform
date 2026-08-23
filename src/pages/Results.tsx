import {
  DifficultyBadge,
  PageContainer,
  ProgressRing,
  SkeletonBlock,
  verdictFor,
  prefersReducedMotion,
} from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { domainName } from "@/lib/statgyan/engine";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileSearch, RotateCcw, Sparkles, X } from "lucide-react";
import { Link, useParams } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Results() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const data = useQuery(
    api.quiza.getAttempt,
    attemptId ? { id: attemptId as never } : "skip",
  );

  if (data === undefined) {
    return (
      <PageContainer width="narrow" className="pt-10">
        <SkeletonBlock className="mx-auto size-44 rounded-full" />
        <SkeletonBlock className="mx-auto mt-8 h-6 w-40" />
        <SkeletonBlock className="mt-10 h-64 rounded-2xl" />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer width="narrow" className="pt-24 text-center">
        <h1 className="text-lg font-semibold">Result not found</h1>
        <p className="mt-2 text-sm text-secondary">
          This round may have been completed in another session.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/explore">Find a quiz</Link>
        </Button>
      </PageContainer>
    );
  }
  return <ResultsBody data={data} />;
}

function ResultsBody({
  data,
}: {
  data: {
    attempt: import("@/convex/_generated/dataModel").Doc<"attempts">;
    questions: {
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      domain: string;
      difficulty: string;
      sourceRef: string;
    }[];
  };
}) {
  const profile = useQuery(api.quiza.myProfile);
  const { attempt, questions } = data;
  const verdict = verdictFor(attempt.scorePct);
  const profileLoading = profile === undefined;

  // ---- Per-domain evidence from this attempt (instant display) ----
  const perf = useMemo(() => {
    const byDomain = new Map<string, { label: string; correct: number; asked: number }>();
    questions.forEach((q, i) => {
      const dom = q.domain || attempt.category;
      const rec = byDomain.get(dom) ?? { label: domainName(dom), correct: 0, asked: 0 };
      rec.asked += 1;
      if (attempt.answers[i] === q.correctIndex) rec.correct += 1;
      byDomain.set(dom, rec);
    });
    return [...byDomain.entries()].map(([domain, r]) => ({
      domain,
      ...r,
      localDelta:
        r.correct > 0
          ? Math.min(8, Math.max(-6, r.correct * 3 - (r.asked - r.correct)))
          : -Math.min(5, r.asked),
    }));
  }, [attempt, questions]);

  // Server-authoritative impact — computed and persisted exactly once, guarded
  // by the backend so revisiting this page can never inflate scores.
  const appliedRef = useRef<string | null>(null);
  const [serverImpact, setServerImpact] = useState<{
    applied: boolean;
    deltas: { id: string; delta: number }[];
  } | null>(null);
  const applyImpact = useMutation(api.quiza.applyCompetencyImpact);
  useEffect(() => {
    if (appliedRef.current === attempt._id) return;
    appliedRef.current = attempt._id;
    void applyImpact({ attemptId: attempt._id })
      .then((r) => {
        if (r) setServerImpact(r);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt._id]);

  const impact = perf.map((p) => ({
    ...p,
    delta: serverImpact?.deltas.find((d) => d.id === p.domain)?.delta ?? p.localDelta,
  }));
  const durationSec = Math.round(attempt.durationMs / 1000);
  const ease = [0.22, 1, 0.36, 1] as const;
  // Best-in-session accuracy across the same quiz for delta context
  const incorrect = attempt.total - attempt.correctCount;

  return (
    <PageContainer width="reading">
      {/* ------------------------------------------------------------ Score */}
      <motion.section
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="pt-6 text-center"
      >
        <p className="eyebrow">Quiz complete · {attempt.quizTitle}</p>

        <div className="mt-8 flex justify-center">
          <ProgressRing
            value={attempt.scorePct}
            label={
              <span className="num text-5xl font-semibold tracking-tight">
                {attempt.scorePct}
                <span className="text-xl text-muted-qz">%</span>
              </span>
            }
            sublabel={
              <span className="mt-1 text-sm font-medium text-[var(--qz-accent)]">
                {verdict.label}
              </span>
            }
          />
        </div>

        <p className="mt-5 text-sm text-secondary">{verdict.note}</p>

        {/* Metrics row */}
        <div className="edge-glow mt-9 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border hairline bg-[var(--qz-surface-1)] py-5">
          <div>
            <p className="num text-xl font-semibold">{attempt.correctCount}/{attempt.total}</p>
            <p className="mt-1 text-xs text-muted-qz">Correct</p>
          </div>
          <div>
            <p className="num text-xl font-semibold">
              {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-muted-qz">Time</p>
          </div>
          <div>
            <p className="num text-xl font-semibold capitalize">{attempt.category}</p>
            <p className="mt-1 text-xs text-muted-qz">Subject</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
          >
            Continue learning <ArrowRight className="size-4" />
          </Link>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-white/10 bg-transparent hover:bg-white/[0.05]"
          >
            <Link to={`/quiz/${attempt.quizSlug}`}>
              <RotateCcw className="size-4" /> Try again
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-xl text-muted-qz hover:text-secondary"
          >
            <Link to="/explore">
              <ArrowLeft className="size-4" /> Explore
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* ------------------------------------------------ Competency impact */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease }}
        className="mt-14"
        aria-label="Competency impact"
      >
        <p className="eyebrow mb-2">Competency update</p>
        <h2 className="text-lg font-semibold tracking-tight">Before → after this assessment</h2>
        {profileLoading || !profile || !serverImpact ? (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {impact.slice(0, 6).map((d) => (
              <div key={d.domain} className={cn("flex items-center justify-between rounded-xl border px-4 py-3", d.delta > 0 ? "border-emerald-300/[0.16] bg-emerald-400/[0.04]" : d.delta < 0 ? "border-rose-300/[0.16] bg-rose-400/[0.04]" : "hairline-faint")}>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{d.label}</span>
                  <span className="num text-[11px] text-muted-qz">{d.correct}/{d.asked} correct</span>
                </span>
                <span className={cn("num text-sm font-semibold", d.delta > 0 ? "text-emerald-300" : d.delta < 0 ? "text-rose-300" : "text-muted-qz")}>
                  {d.delta > 0 ? `+${d.delta}` : d.delta}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {impact.slice(0, 6).map((d) => {
              const comp = profile.competencies.find((c) => c.id === d.domain);
              const after = comp?.score;
              const before = after !== undefined ? after - d.delta : undefined;
              return (
                <div key={d.domain} className={cn("rounded-xl border px-4 py-3", d.delta > 0 ? "border-emerald-300/[0.16] bg-emerald-400/[0.04]" : d.delta < 0 ? "border-rose-300/[0.16] bg-rose-400/[0.04]" : "hairline-faint bg-white/[0.02]")}>
                  <p className="truncate text-[13px] font-medium">{d.label}</p>
                  <p className="num mt-1 flex items-baseline gap-2 text-xs text-muted-qz">
                    {before !== undefined && after !== undefined ? (
                      <>
                        <span>{before}</span>
                        <span aria-hidden className="text-[var(--qz-accent)]">→</span>
                        <span className={cn("text-base font-semibold", d.delta > 0 ? "text-emerald-300" : d.delta < 0 ? "text-rose-300" : "text-secondary")}>{after}</span>
                      </>
                    ) : (
                      <span className={cn("font-semibold", d.delta > 0 ? "text-emerald-300" : "text-rose-300")}>{d.delta > 0 ? `+${d.delta}` : d.delta}</span>
                    )}
                    <span className="ml-auto">{d.correct}/{d.asked} · target {comp?.target ?? "—"}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {serverImpact?.applied ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300/80">
            <Check className="size-3" /> Your competency profile has been updated — recommendations re-ranked.
          </p>
        ) : serverImpact ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-qz">
            <Check className="size-3" /> Impact from this round was recorded when you first completed it.
          </p>
        ) : null}

        {/* AI insight */}
        <div className="edge-glow mt-6 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Sparkles className="size-3.5 text-[var(--qz-accent)]" /> AI insight
          </p>
          <p className="text-sm leading-relaxed text-secondary">
            “{impact.length > 0 && impact[0].delta > 0
              ? `You demonstrated your strongest evidence in ${impact[0].label.toLowerCase()}. `
              : "This round was demanding across all tested domains. "}
            {impact.length > 1 && impact[impact.length - 1].delta < 0
              ? `Application-level questions in ${impact[impact.length - 1].label.toLowerCase()} were the weakest signal, so your next recommended activity focuses there. `
              : ""}
            Your learning path has been re-ranked with this evidence.”
          </p>
          <Link to="/learning" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80">
            See updated recommendations <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Adaptive loop visual */}
        <div className="edge-glow mt-4 flex items-center justify-between gap-1 rounded-2xl border hairline bg-[var(--qz-surface-1)] px-5 py-4 text-[11px] text-muted-qz sm:text-xs" aria-label="Adaptive loop">
          {["Assessment", "AI analysis", "Competency update", "New recommendation"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1">
              <span className={i === 2 ? "font-medium text-[var(--qz-text)]" : undefined}>{s}</span>
              {i < arr.length - 1 && <span aria-hidden className="px-0.5 text-[var(--qz-accent)]">→</span>}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ----------------------------------------------------------- Review */}
      <motion.section
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease }}
        className="mt-14 pb-16"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Review</p>
            <h2 className="text-lg font-semibold tracking-tight">
              Every question, explained
            </h2>
          </div>
          <p className="num text-xs text-muted-qz">
            {incorrect > 0
              ? `${incorrect} to revisit`
              : "Flawless round"}
          </p>
        </div>

        <ol className="space-y-3">
          {questions.map((q, i) => {
            const chosen = (attempt as unknown as { answers?: number[] }).answers?.[i] ?? -1;
            const correct = chosen === q.correctIndex;
            return (
              <li
                key={i}
                className={cn(
                  "edge-glow rounded-xl border p-5",
                  correct
                    ? "hairline-faint bg-[var(--qz-surface-1)]"
                    : "border-rose-300/[0.16] bg-[var(--qz-surface-1)]",
                )}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      "num mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold",
                      correct
                        ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-300/40 bg-rose-400/10 text-rose-300",
                    )}
                  >
                    {correct ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-[var(--qz-text)]">
                      {q.text}
                    </p>
                    {!correct && chosen >= 0 && (
                      <p className="mt-2 text-[13px] text-rose-200/80">
                        You answered: {q.options[chosen]}
                      </p>
                    )}
                    {!correct && chosen === -1 && (
                      <p className="mt-2 text-[13px] text-muted-qz">Skipped</p>
                    )}
                    <p className="mt-1.5 text-[13px] text-emerald-200/85">
                      Answer: {q.options[q.correctIndex]}
                    </p>
                    <p className="mt-2 border-l-2 border-white/[0.08] pl-3 text-[13px] leading-relaxed text-secondary">
                      {q.explanation}
                    </p>
                    {q.sourceRef && (
                      <p className="num mt-3 inline-flex items-center gap-1.5 rounded-md border hairline-faint px-2 py-0.5 text-[10px] text-muted-qz">
                        <FileSearch className="size-3" /> Source: {q.sourceRef}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="edge-glow mt-8 flex items-center justify-center gap-4 rounded-2xl border hairline-faint bg-[var(--qz-surface-1)] px-6 py-5">
          <DifficultyBadge difficulty={attempt.category === "" ? "Easy" : "Medium"} className="hidden" />
          <p className="text-sm text-secondary">
            Ready for a different subject?
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80"
          >
            Browse quizzes <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </motion.section>
    </PageContainer>
  );
}
