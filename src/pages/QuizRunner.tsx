import { DifficultyBadge, SkeletonBlock, prefersReducedMotion } from "@/components/quiza/primitives";
import { Wordmark } from "@/components/quiza/nav";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Phase = "intro" | "playing";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function QuizRunner() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const data = useQuery(api.quiza.getQuizBySlug, { slug });
  const submitAttempt = useMutation(api.quiza.submitAttempt);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(0);

  const quiz = data?.quiz;
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const total = questions.length;
  const current = questions[index];
  const selected = answers[index];
  const revealed = phase === "playing" && selected !== undefined && selected !== null;
  const isLast = index === total - 1;

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    startRef.current = Date.now() - elapsed;
    const t = window.setInterval(
      () => setElapsed(Date.now() - startRef.current),
      500,
    );
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const beginRound = useCallback(() => {
    startRef.current = Date.now();
    setAnswers(new Array(total).fill(null));
    setIndex(0);
    setPhase("playing");
  }, [total]);

  const finish = useCallback(
    async (finalAnswers: number[], durationMs: number) => {
      setSubmitting(true);
      setError(null);
      try {
        const attemptId = await submitAttempt({
          quizSlug: slug,
          answers: finalAnswers.map((a) => a ?? -1),
          durationMs,
        });
        navigate(`/results/${attemptId}`, { replace: true });
      } catch (e) {
        setSubmitting(false);
        setError(
          e instanceof Error ? e.message : "Could not save your round. Try again.",
        );
      }
    },
    [navigate, slug, submitAttempt],
  );

  const selectOption = useCallback(
    (optionIndex: number) => {
      if (revealed || submitting) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = optionIndex;
        return next;
      });
    },
    [index, revealed, submitting],
  );

  const goNext = useCallback(() => {
    if (!revealed || submitting) return;
    if (isLast) {
      void finish(answers, Date.now() - startRef.current);
    } else {
      setIndex((i) => i + 1);
    }
  }, [answers, finish, isLast, revealed, submitting]);

  // Keyboard: 1–4 / A–D to answer, Enter to continue
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const numIdx = ["1", "2", "3", "4"].indexOf(k);
      const letterIdx = ["a", "b", "c", "d"].indexOf(k);
      if (numIdx >= 0 && numIdx < (current?.options.length ?? 0)) {
        selectOption(numIdx);
      } else if (letterIdx >= 0 && letterIdx < (current?.options.length ?? 0)) {
        selectOption(letterIdx);
      } else if (k === "enter") {
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, current, selectOption, goNext]);

  // ------------------------------------------------------------------ Loading
  if (data === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-24">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="mt-6 h-64 rounded-2xl" />
      </div>
    );
  }

  if (!quiz || total === 0) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <div className="max-w-sm text-center">
          <AlertTriangle className="mx-auto size-6 text-muted-qz" strokeWidth={1.5} />
          <h1 className="mt-4 text-lg font-semibold">Quiz not found</h1>
          <p className="mt-2 text-sm text-secondary">
            This round may have been moved or retired.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progressPct = ((index + (revealed ? 1 : 0)) / total) * 100;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ------------------------------------------------------- Minimal header */}
      <header className="sticky top-0 z-40 glass-bar border-x-0 border-t-0">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-qz transition-colors hover:bg-white/[0.05] hover:text-secondary"
                aria-label="Exit quiz"
              >
                <ArrowLeft className="size-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave this round?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your answers so far won't be saved. You can restart the quiz any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep playing</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Link to="/explore">Leave</Link>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Wordmark />

          <span className="num min-w-12 text-right text-sm tabular-nums text-secondary">
            {formatTime(elapsed)}
          </span>
        </div>
        {/* Progress line */}
        <div className="h-[2px] w-full bg-white/[0.05]">
          <div
            className="h-full bg-[var(--qz-accent)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${phase === "intro" ? 0 : Math.max(progressPct, 2)}%` }}
          />
        </div>
      </header>

      {/* ------------------------------------------------------------- Intro */}
      {phase === "intro" ? (
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16"
        >
          <p className="eyebrow">{quiz.category}</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-secondary">
            {quiz.description}
          </p>

          <div className="num mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-qz">
            <DifficultyBadge difficulty={quiz.difficulty} />
            <span>{total} questions</span>
            <span>~{quiz.estMinutes} minutes</span>
            <span className="hidden sm:inline">Keys 1–4 answer · Enter continues</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={beginRound}
              data-cursor="hover"
              className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-7 text-sm font-semibold"
            >
              Begin round <ArrowRight className="size-4" />
            </button>
            <Button asChild variant="ghost" className="text-muted-qz hover:text-secondary">
              <Link to="/explore">Not now</Link>
            </Button>
          </div>
        </motion.main>
      ) : (
        /* --------------------------------------------------------- Playing */
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-28 pt-10 sm:pt-14">
          {/* Question counter */}
          <div className="flex items-baseline justify-between" aria-live="polite">
            <p className="eyebrow">
              Question{" "}
              <span className="num text-[var(--qz-text)]">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              <span className="num">/ {String(total).padStart(2, "0")}</span>
            </p>
            <p className="eyebrow">{quiz.category}</p>
          </div>

          {/* Segmented progress */}
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {questions.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-[3px] flex-1 rounded-full transition-colors duration-500",
                  i < index
                    ? answers[i] === questions[i].correctIndex
                      ? "bg-emerald-400/70"
                      : "bg-rose-400/60"
                    : i === index
                      ? "bg-white/45"
                      : "bg-white/[0.07]",
                )}
              />
            ))}
          </div>

          {/* Question + options */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={prefersReducedMotion() ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion() ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-8 text-balance text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
                {current.text}
              </h1>

              <div className="mt-7 space-y-2.5" role="listbox" aria-label="Answer options">
                {current.options.map((opt, i) => {
                  const isCorrect = i === current.correctIndex;
                  const isChosen = selected === i;
                  return (
                    <button
                      key={i}
                      role="option"
                      aria-selected={isChosen}
                      disabled={revealed}
                      onClick={() => selectOption(i)}
                      className={cn(
                        "group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left",
                        "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        !revealed &&
                          "hairline-faint bg-white/[0.02] hover:-translate-y-px hover:border-white/[0.16] hover:bg-white/[0.05]",
                        revealed && isCorrect &&
                          "border-emerald-300/30 bg-emerald-400/[0.08]",
                        revealed && isChosen && !isCorrect &&
                          "border-rose-300/35 bg-rose-400/[0.08]",
                        revealed && !isCorrect && !isChosen && "opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "num grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold transition-colors",
                          !revealed &&
                            "hairline text-muted-qz group-hover:border-white/25 group-hover:text-secondary",
                          revealed && isCorrect && "border-emerald-300/50 bg-emerald-400/15 text-emerald-300",
                          revealed && isChosen && !isCorrect && "border-rose-300/50 bg-rose-400/15 text-rose-300",
                          revealed && !isCorrect && !isChosen && "hairline text-muted-qz",
                        )}
                      >
                        {revealed && isCorrect ? (
                          <Check className="size-3.5" />
                        ) : revealed && isChosen && !isCorrect ? (
                          <X className="size-3.5" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[15px] leading-snug",
                          revealed && isCorrect
                            ? "text-emerald-100"
                            : revealed && isChosen
                              ? "text-rose-100"
                              : "text-[var(--qz-text)]",
                        )}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "mt-6 rounded-xl border p-5",
                      selected === current.correctIndex
                        ? "border-emerald-300/20 bg-emerald-400/[0.05]"
                        : "border-rose-300/25 bg-rose-400/[0.05]",
                    )}
                  >
                    <p
                      className={cn(
                        "flex items-center gap-2 text-[13px] font-semibold",
                        selected === current.correctIndex ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {selected === current.correctIndex ? (
                        <>
                          <Check className="size-4" /> Correct
                        </>
                      ) : (
                        <>
                          <X className="size-4" /> Not quite
                        </>
                      )}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-secondary">
                      {current.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* -------------------------------------------------------- Bottom bar */}
      {phase === "playing" && (
        <footer className="glass-bar fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <p className="hidden text-xs text-muted-qz sm:block">
              Press <kbd className="rounded border hairline-faint bg-white/[0.04] px-1 py-0.5 font-sans text-[10px]">Enter</kbd>{" "}
              to continue
            </p>
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              {error && <p className="mr-auto text-xs text-rose-300">{error}</p>}
              <button
                onClick={goNext}
                disabled={!revealed || submitting}
                data-cursor="hover"
                className={cn(
                  "btn-specular inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold",
                  (!revealed || submitting) && "pointer-events-none opacity-40",
                )}
              >
                {submitting
                  ? "Saving…"
                  : isLast
                    ? "See results"
                    : "Continue"}
                {!submitting && <ArrowRight className="size-4" />}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
