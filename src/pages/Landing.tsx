import { TopNav } from "@/components/quiza/nav";
import {
  PageContainer,
  SkeletonBlock,
  prefersReducedMotion,
} from "@/components/quiza/primitives";
import { QuizCard } from "@/components/quiza/quiz-card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, LineChart, Timer } from "lucide-react";
import { Link } from "react-router";

// ---------------------------------------------------------------------------
// Hero visual — a quiet, composed question card. No decoration for its own sake.
// ---------------------------------------------------------------------------

function HeroPreview() {
  const options = [
    "Mitochondrion",
    "Ribosome",
    "Golgi apparatus",
    "Lysosome",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* depth layer */}
      <div
        aria-hidden
        className="absolute -inset-x-6 -bottom-5 top-8 rounded-2xl border hairline-faint bg-[var(--qz-bg-raised)] opacity-70"
        style={{ transform: "perspective(1200px) rotateX(6deg)" }}
      />
      <div className="relative rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Question 03 · Biology</span>
          <span className="num text-xs text-muted-qz">02:14</span>
        </div>
        {/* progress segments */}
        <div className="mt-4 flex gap-1" aria-hidden>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full ${
                i < 2 ? "bg-[var(--qz-accent)]" : i === 2 ? "bg-white/40" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
        <p className="mt-5 text-[15px] font-medium leading-relaxed text-[var(--qz-text)]">
          Which organelle is known as the powerhouse of the cell?
        </p>
        <div className="mt-4 space-y-2">
          {options.map((opt, i) => (
            <div
              key={opt}
              className={
                i === 0
                  ? "flex items-center gap-3 rounded-lg border border-emerald-300/25 bg-emerald-400/[0.07] px-3.5 py-2.5"
                  : "flex items-center gap-3 rounded-lg border hairline-faint bg-white/[0.02] px-3.5 py-2.5"
              }
            >
              <span
                className={`num grid size-5 place-items-center rounded-md border text-[10px] font-semibold ${
                  i === 0
                    ? "border-emerald-300/40 text-emerald-300"
                    : "hairline text-muted-qz"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-[13px] ${i === 0 ? "text-emerald-100" : "text-secondary"}`}>
                {opt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: BrainCircuit,
    title: "Pick your subject",
    body: "Eight curated subjects, from physics to film. Every quiz is written to teach something, not just to be survived.",
  },
  {
    icon: Timer,
    title: "Play the round",
    body: "One question at a time, instant feedback with an explanation on every answer. Keyboard-first, distraction-free.",
  },
  {
    icon: LineChart,
    title: "Watch yourself improve",
    body: "Accuracy, pace and subject coverage compound into a record you can actually see moving.",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const quizzes = useQuery(api.quiza.listQuizzes);
  const reduced = prefersReducedMotion();

  const loading = quizzes === undefined;
  const featured = (quizzes ?? []).slice(0, 3);
  const categories = [...new Set((quizzes ?? []).map((q) => q.category))];
  const totalQuestions = (quizzes ?? []).reduce((s, q) => s + (q.questionCount ?? 0), 0);

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* ---------------------------------------------------------- Hero */}
      <section className="studio-light relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <PageContainer width="wide">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="eyebrow flex items-center gap-3"
              >
                <span className="h-px w-8 bg-[var(--qz-accent)]/60" />
                Quiza · Intelligent quiz platform
              </motion.p>

              <motion.h1
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-balance text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--qz-text)] sm:text-6xl lg:text-[4.2rem]"
              >
                Test what you know.
                <br />
                <span className="text-muted-qz">Discover what you don't.</span>
              </motion.h1>

              <motion.p
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-md text-pretty text-base leading-relaxed text-secondary"
              >
                A quietly luxurious quiz platform — hand-crafted questions, instant
                explanations and a performance record that rewards curiosity.
              </motion.p>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <Link
                  to={isAuthenticated ? "/explore" : "/auth"}
                  data-cursor="hover"
                  className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                >
                  Start a quiz
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#subjects"
                  className="inline-flex h-11 items-center rounded-xl border hairline bg-white/[0.02] px-6 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-white/[0.05] hover:text-[var(--qz-text)]"
                >
                  Explore subjects
                </a>
              </motion.div>

              {!loading && (
                <p className="num mt-10 text-xs tracking-wide text-muted-qz">
                  {quizzes!.length} quizzes · {totalQuestions} questions ·{" "}
                  {categories.length} subjects
                </p>
              )}
            </div>

            <HeroPreview />
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------ Subjects */}
      <section id="subjects" className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Subjects</p>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Find your territory
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((category, i) => {
                const count = quizzes!.filter((q) => q.category === category).length;
                return (
                  <motion.div
                    key={category}
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={`/explore?category=${encodeURIComponent(category)}`}
                      data-cursor="hover"
                      className="group flex h-full min-h-20 flex-col justify-between rounded-xl border hairline bg-[var(--qz-surface-1)] p-4 transition-all duration-300 hover:border-white/[0.14] hover:bg-[var(--qz-surface-2)]"
                    >
                      <span className="text-sm font-medium text-[var(--qz-text)]">
                        {category}
                      </span>
                      <span className="num mt-3 text-xs text-muted-qz group-hover:text-secondary">
                        {count} quiz{count === 1 ? "" : "zes"}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </PageContainer>
      </section>

      {/* ------------------------------------------------------ Featured */}
      <section className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Editor's picks</p>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Start anywhere. Start well.
              </h2>
            </div>
            <Link
              to="/explore"
              className="hidden items-center gap-1.5 text-sm font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80 sm:inline-flex"
            >
              All quizzes <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-44" />)
              : featured.map((quiz) => <QuizCard key={quiz._id} quiz={quiz} />)}
          </div>
        </PageContainer>
      </section>

      {/* ----------------------------------------------------- How it works */}
      <section className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <p className="eyebrow mb-2">Method</p>
          <h2 className="mb-12 max-w-md text-xl font-semibold tracking-tight sm:text-2xl">
            Three steps. No noise.
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3">
                  <span className="num text-xs text-muted-qz">0{i + 1}</span>
                  <span className="h-px flex-1 bg-white/[0.07]" />
                  <step.icon className="size-4 text-[var(--qz-accent)]" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 text-[15px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-secondary">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="border-t hairline-faint py-24">
        <PageContainer width="narrow">
          <div className="text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              The next question is waiting.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-secondary">
              Free to start, no card, no ceremony — just you and six questions.
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="btn-specular mt-8 inline-flex h-11 items-center gap-2 rounded-xl px-7 text-sm font-semibold"
            >
              Begin <ArrowRight className="size-4" />
            </Link>
          </div>
        </PageContainer>
      </section>

      <footer className="border-t hairline-faint py-10 pb-28 md:pb-10">
        <PageContainer width="wide">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-qz">
              QUIZA — test what you know, discover what you don't.
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-qz">
              <Link to="/leaderboard" className="transition-colors hover:text-secondary">
                Leaderboard
              </Link>
              <Link to="/profile" className="transition-colors hover:text-secondary">
                Profile
              </Link>
              <a href="#subjects" className="transition-colors hover:text-secondary">
                Subjects
              </a>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
