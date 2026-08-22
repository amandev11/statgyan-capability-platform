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
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Link, useParams } from "react-router";
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

  const { attempt, questions } = data;
  const verdict = verdictFor(attempt.scorePct);
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
        <div className="mt-9 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border hairline bg-[var(--qz-surface-1)] py-5">
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
                key={q._id}
                className={cn(
                  "rounded-xl border p-5",
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
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex items-center justify-center gap-4 rounded-2xl border hairline-faint bg-[var(--qz-surface-1)] px-6 py-5">
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
