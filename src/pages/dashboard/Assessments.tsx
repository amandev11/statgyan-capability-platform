import { AiLabel, GlassCard, PageHeader, PriorityBadge } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { ai } from "@/lib/statgyan/ai";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Flag,
  ListChecks,
  Play,
  Timer,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type {
  AssessmentAttempt,
  ConfidenceRating,
  Question,
  QuestionType,
} from "@/lib/statgyan/types";

const CONFIDENCE_OPTIONS: { value: ConfidenceRating; label: string }[] = [
  { value: "not-sure", label: "Not Sure" },
  { value: "somewhat", label: "Somewhat Confident" },
  { value: "very", label: "Very Confident" },
];

// ---------------------------------------------------------------------------

function Runner({ quizId }: { quizId: string }) {
  const { quizzes, recordAttempt, skillGaps, pushInsight } = useStatgyan();
  const navigate = useNavigate();
  const quiz = quizzes.find((q) => q.id === quizId);
  const [pool, setPool] = useState<Question[]>(() => quiz?.questions ?? []);
  const [current, setCurrent] = useState<Question | null>(() => quiz?.questions[0] ?? null);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceRating>("somewhat");
  const [confirmed, setConfirmed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [records, setRecords] = useState<
    { q: Question; selected: number | null; correct: boolean; confidence: ConfidenceRating; timeMs: number }[]
  >([]);
  const [showFeedback, setShowFeedback] = useState(true);
  const startedAt = useRef(Date.now());
  const questionStart = useRef(Date.now());
  const recordedRef = useRef(false);

  useEffect(() => {
    if (quiz) {
      setPool(quiz.questions.slice(1));
      setCurrent(quiz.questions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  const finish = useCallback(
    (allRecords: typeof records) => {
      if (!quiz || recordedRef.current) return;
      recordedRef.current = true;
      const total = allRecords.length || 1;
      const correctCount = allRecords.filter((r) => r.correct).length;
      const score = Math.round((correctCount / total) * 100);

      // Confidence vs correctness analytics
      let confidenceGaps = 0, knowledgeGaps = 0, carelessErrors = 0;
      for (const r of allRecords) {
        if (!r.correct && r.confidence === "not-sure") knowledgeGaps++;
        else if (!r.correct && r.confidence === "very") carelessErrors++;
        else if (r.correct && r.confidence === "not-sure") confidenceGaps++;
      }
      const confidentCorrect = allRecords.filter(
        (r) => r.correct && r.confidence !== "not-sure",
      ).length;
      const confidenceAccuracy = Math.round(
        ((confidentCorrect +
          allRecords.filter((r) => !r.correct && r.confidence !== "very").length * 0) /
          total) *
          100,
      );

      // Competency deltas
      const byComp: Record<string, { correct: number; total: number }> = {};
      for (const r of allRecords) {
        byComp[r.q.competencyId] ??= { correct: 0, total: 0 };
        byComp[r.q.competencyId].total++;
        if (r.correct) byComp[r.q.competencyId].correct++;
      }
      const competencyDeltas: Record<string, number> = {};
      for (const [cid, s] of Object.entries(byComp)) {
        const acc = s.correct / s.total;
        const delta = Math.max(-5, Math.min(12, Math.round((acc - 0.5) * 22)));
        if (delta !== 0) competencyDeltas[cid] = delta;
      }

      // Misconception: repeated confident misses in one topic
      const topicMisses: Record<string, number> = {};
      for (const r of allRecords) {
        if (!r.correct && r.confidence === "very")
          topicMisses[r.q.topic] = (topicMisses[r.q.topic] ?? 0) + 1;
      }
      const misconceptionTopic =
        Object.entries(topicMisses).find(([, n]) => n >= 2)?.[0];

      const attemptBase = {
        id: `att-${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        completedAt: Date.now(),
        score,
        correctCount,
        totalQuestions: allRecords.length,
        confidenceAccuracy,
        knowledgeGaps,
        confidenceGaps,
        carelessErrors,
        competencyDeltas,
        diagnosis: "",
        misconception: misconceptionTopic,
      };
      const attempt: AssessmentAttempt = {
        ...attemptBase,
        diagnosis: ai.diagnoseAttempt(attemptBase, skillGaps.length),
      };
      recordAttempt(attempt);
      pushInsight({
        kind: "insight",
        title: "AI Insight",
        body: `Assessment complete: ${score}% on "${quiz.title}". The attempt became new evidence — competency scores updated${
          Object.keys(competencyDeltas).length
            ? ` (${Object.keys(competencyDeltas)
                .map((c) => COMPETENCY_MAP[c]?.name ?? c)
                .join(", ")})`
            : ""
        }.`,
      });
      navigate(`/dashboard/assessments?result=${attempt.id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz, recordAttempt, skillGaps.length],
  );

  const confirmAndNext = () => {
    if (!current || selectedIndex === null) return;
    const now = Date.now();
    const correct = selectedIndex === current.correctIndex;
    const rec = {
      q: current,
      selected: selectedIndex,
      correct,
      confidence,
      timeMs: now - questionStart.current,
    };
    const all = [...records, rec];
    setRecords(all);
    setConfirmed(true);

    setTimeout(() => {
      const remainingPool = pool.filter((q) => q.id !== current.id);
      const answeredCount = answered + 1;
      setAnswered(answeredCount);
      setStreak(correct ? streak + 1 : 0);

      if (answeredCount >= (quiz?.questions.length ?? 0)) {
        finish(all);
        return;
      }
      // Adaptive engine picks the next question by live performance
      let next: Question | undefined;
      try {
        next = ai.pickNextQuestion(remainingPool, correct ? streak + 1 : 0);
      } catch {
        next = remainingPool[0];
      }
      if (!next) next = quiz?.questions.find((q) => !all.some((r) => r.q.id === q.id));
      setPool(remainingPool);
      setCurrent(next ?? null);
      setSelectedIndex(null);
      setConfidence("somewhat");
      setConfirmed(false);
      setBookmarked(false);
      questionStart.current = Date.now();
    }, showFeedback ? 1600 : 250);
  };

  // Keyboard shortcuts: 1–4 select, A–D select, Enter confirm
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      const keyMap: Record<string, number> = {
        "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3,
      };
      const k = e.key.toLowerCase();
      if (!confirmed && k in keyMap && keyMap[k] < current.options.length) {
        setSelectedIndex(keyMap[k]);
      } else if (e.key === "Enter" && !confirmed) {
        confirmAndNext();
      } else if (k === "f") {
        setBookmarked((b) => !b);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, confirmed, selectedIndex, confidence]);

  if (!quiz || !current) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-muted-foreground">This assessment could not be loaded.</p>
        <Button asChild variant="outline" className="mt-3">
          <Link to="/dashboard/assessments">Back to Assessments</Link>
        </Button>
      </GlassCard>
    );
  }

  const progress = ((answered + (confirmed ? 1 : 0)) / quiz.questions.length) * 100;
  const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
  const isCorrect = confirmed && selectedIndex === current.correctIndex;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Progress header */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{quiz.title}</span>
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Timer className="size-3.5" /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
            <span className="tabular-nums">{answered + (confirmed ? 1 : answered)} / {quiz.questions.length}</span>
            {quiz.config.difficulty === "Adaptive" && (
              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 font-semibold text-indigo-700">Adaptive</span>
            )}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-900/10">
          <motion.div className="h-full rounded-full bg-indigo-500" animate={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Keyboard: 1–4 or A–D select · Enter submit · F bookmark</span>
          <label className="flex items-center gap-1.5">
            Instant feedback <Switch checked={showFeedback} onCheckedChange={setShowFeedback} />
          </label>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="glass-strong rounded-xl p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
              {COMPETENCY_MAP[current.competencyId]?.name}
            </span>
            <span className="rounded-md bg-slate-900/5 px-2 py-0.5 text-slate-600">{current.difficulty}</span>
            <span className="rounded-md bg-slate-900/5 px-2 py-0.5 text-slate-600">{current.bloom}</span>
            <span className="rounded-md bg-slate-900/5 px-2 py-0.5 text-slate-600">{current.type}</span>
            <button
              onClick={() => setBookmarked((b) => !b)}
              className={cn("ml-auto flex items-center gap-1 rounded-md px-2 py-0.5", bookmarked ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:text-slate-600")}
              aria-pressed={bookmarked}
            >
              <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} /> Bookmark
            </button>
          </div>

          <h2 className="mt-4 whitespace-pre-line text-base font-medium leading-relaxed sm:text-lg">
            {current.text}
          </h2>

          <fieldset className="mt-5 space-y-2">
            <legend className="sr-only">Answer options</legend>
            {current.options.map((opt, i) => {
              const selected = selectedIndex === i;
              const revealCorrect = confirmed && showFeedback && i === current.correctIndex;
              const revealWrong = confirmed && showFeedback && selected && i !== current.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelectedIndex(i)}
                  disabled={confirmed}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition",
                    revealCorrect
                      ? "border-emerald-300 bg-emerald-50/80"
                      : revealWrong
                        ? "border-rose-300 bg-rose-50/80"
                        : selected
                          ? "border-indigo-400 bg-indigo-50/80 shadow-sm"
                          : "border-white/80 bg-white/50 hover:border-indigo-200 hover:bg-white/70",
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                    selected || revealCorrect ? "border-transparent bg-indigo-600 text-white" : "border-slate-300 text-slate-500",
                    revealCorrect && "bg-emerald-600",
                    revealWrong && "bg-rose-500",
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                  {revealCorrect && <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-600" />}
                  {revealWrong && <XCircle className="ml-auto size-4 shrink-0 text-rose-500" />}
                </button>
              );
            })}
          </fieldset>

          {/* Confidence rating */}
          {!confirmed && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                How confident are you in this answer?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONFIDENCE_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setConfidence(c.value)}
                    aria-pressed={confidence === c.value}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                      confidence === c.value
                        ? "border-indigo-300 bg-indigo-100/90 text-indigo-800"
                        : "border-slate-200 bg-white/60 text-slate-500 hover:bg-white",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instant AI explanation */}
          {confirmed && showFeedback && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
              <div className={cn("rounded-lg border p-3.5 text-sm leading-relaxed", isCorrect ? "border-emerald-200 bg-emerald-50/70" : "border-rose-200 bg-rose-50/70")}>
                <b>{isCorrect ? "Correct." : "Not quite."}</b> {current.explanation}
              </div>
              <AiLabel>Source: {current.sourceRef} · Objective: {current.objective}</AiLabel>
              {quiz.config.difficulty === "Adaptive" && (
                <p className="text-[11px] italic text-muted-foreground">
                  Adaptive engine: difficulty will adjust based on this result ({isCorrect ? `↑ after ${streak + 1}-streak` : "↓ easing"}).
                </p>
              )}
            </motion.div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link to="/dashboard/assessments"><ArrowLeft className="size-4" /> Exit</Link>
            </Button>
            <Button onClick={confirmAndNext} disabled={confirmed || selectedIndex === null} className="gap-1.5">
              {confirmed ? "Next…" : answered + 1 >= quiz.questions.length ? "Submit assessment" : "Submit answer"}
              {!confirmed && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="glass flex items-start gap-2.5 rounded-xl p-4 text-xs leading-relaxed text-muted-foreground">
        <Brain className="mt-0.5 size-4 shrink-0 text-primary" />
        Your answers, timing and confidence ratings feed the competency model. High confidence with wrong answers flags potential misconceptions; correct answers with low confidence flag confidence gaps — the AI separates what you don't know from what you don't know you know.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Results({ attemptId }: { attemptId: string }) {
  const { attempts, learningPath } = useStatgyan();
  const a = attempts.find((x) => x.id === attemptId);

  if (!a) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Result not found.</p>
        <Button asChild variant="outline" className="mt-3"><Link to="/dashboard/assessments">Back</Link></Button>
      </GlassCard>
    );
  }

  const pointsGained = Object.values(a.competencyDeltas).reduce((s, d) => d + (d > 0 ? d : 0), 0);
  const nextStep = learningPath[0];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-2xl p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Assessment Complete</p>
        <p className="mt-3 text-6xl font-bold tabular-nums tracking-tight text-gradient">{a.score}%</p>
        <p className="mt-2 text-sm font-semibold text-emerald-600">
          +{pointsGained} competency points · evidence recorded
        </p>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left sm:grid-cols-4">
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Correct</p><p className="font-bold tabular-nums">{a.correctCount}/{a.totalQuestions}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Conf. accuracy</p><p className="font-bold tabular-nums">{a.confidenceAccuracy}%</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Knowledge gaps</p><p className="font-bold tabular-nums text-rose-600">{a.knowledgeGaps}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence gaps</p><p className="font-bold tabular-nums text-amber-600">{a.confidenceGaps}</p></div>
        </div>
      </motion.div>

      <GlassCard className="p-5">
        <p className="flex items-center gap-2 text-sm font-semibold"><Brain className="size-4 text-primary" /> AI Diagnosis</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{a.diagnosis}</p>
        {a.misconception && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm">
            <Flag className="mr-1 inline size-3.5 text-amber-600" />
            Recurring confident errors detected around <b>{a.misconception}</b> — flagged as a probable misconception worth targeted review.
          </p>
        )}
      </GlassCard>

      <GlassCard className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Next Step · AI-generated</p>
          <p className="mt-1 text-sm">
            Take <b>{nextStep?.title ?? "your top-priority module"}</b> — expected improvement ≈ +{nextStep?.expectedImprovement ?? 10} pts on {nextStep ? COMPETENCY_MAP[nextStep.competencyId]?.name : "priority areas"}.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0 gap-1.5">
          <Link to="/dashboard/path">Open learning path <ArrowRight className="size-4" /></Link>
        </Button>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Assessments() {
  const { quizzes, attempts } = useStatgyan();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const openQuizId = params.get("quiz");
  const resultId = params.get("result");

  const diagnostics = useMemo(
    () => [
      { id: "diag-mixed", title: "Full Diagnostic — Mixed Competencies", desc: "12 adaptive questions across your role profile", questions: 12 },
      { id: "diag-quality", title: "Data Quality Focus Diagnostic", desc: "Validation rules, quality gates, cleaning discipline", questions: 8 },
    ],
    [],
  );

  if (openQuizId) return <Runner quizId={openQuizId} />;
  if (resultId) return <Results attemptId={resultId} />;

  const startDiagnostic = (id: string) => {
    const cfg = id === "diag-quality"
      ? { numQuestions: 8, difficulty: "Adaptive" as const, topic: "dm-quality", types: ["MCQ", "Scenario-based"] as QuestionType[], bloom: "Mixed" as const }
      : { numQuestions: 12, difficulty: "Adaptive" as const, topic: "all", types: ["MCQ", "Scenario-based", "True/False"] as QuestionType[], bloom: "Mixed" as const };
    const quiz = ai.generateQuiz(cfg, null);
    // Reuse diagnostics ids so history stays tidy
    navigate(`/dashboard/assessments?quiz=${quiz.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessment Engine"
        title="Assessments"
        subtitle="Every assessment adapts to performance and captures confidence — turning a test into calibrated evidence about capability."
        actions={
          <Button asChild variant="secondary" className="gap-2">
            <Link to="/dashboard/quiz-lab"><ListChecks className="size-4" /> Create new in Quiz Lab</Link>
          </Button>
        }
      />

      {attempts.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold">History</h2>
          <ul className="space-y-2">
            {attempts.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/dashboard/assessments?result=${a.id}`}
                  className="glass-subtle glass-hover flex items-center justify-between rounded-lg p-3"
                >
                  <span>
                    <span className="block text-sm font-medium">{a.quizTitle}</span>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(a.completedAt).toLocaleString()} · conf. accuracy {a.confidenceAccuracy}%
                      {a.misconception ? ` · ⚑ ${a.misconception}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <PriorityBadge priority={a.score >= 75 ? "LOW" : a.score >= 55 ? "MEDIUM" : a.score >= 40 ? "HIGH" : "CRITICAL"} />
                    <span className="font-bold tabular-nums">{a.score}%</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Standard Diagnostics</h2>
          <ul className="mt-3 space-y-2.5">
            {diagnostics.map((d) => (
              <li key={d.id} className="glass-subtle flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => startDiagnostic(d.id)}>
                  <Play className="size-3.5" /> Start
                </Button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Generated from Materials</h2>
          {quizzes.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No material-based assessments yet. Upload a document in the{" "}
              <Link to="/dashboard/materials" className="font-medium text-primary underline">AI Material Lab</Link>{" "}
              and generate grounded MCQs in one click.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {quizzes.slice(0, 5).map((q) => (
                <li key={q.id} className="glass-subtle flex items-center justify-between rounded-lg p-3">
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-sm font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.questions.length} questions · {q.config.difficulty}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" className="gap-1.5 shrink-0" onClick={() => navigate(`/dashboard/assessments?quiz=${q.id}`)}>
                    <Play className="size-3.5" /> Start
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
        <ChevronLeft className="mt-0.5 hidden size-4" />
        <p className="leading-relaxed">
          <b className="text-slate-800">Why confidence matters:</b> a wrong answer marked “Very Confident” signals a misconception;
          a correct answer marked “Not Sure” reveals a confidence gap; quick confident misses suggest careless error. The same raw
          score can mean very different capability profiles — STATGYAN AI tells them apart.
        </p>
      </GlassCard>
    </div>
  );
}
