import { TopNav } from "@/components/quiza/nav";
import { PageContainer, prefersReducedMotion } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileUp,
  GraduationCap,
  LineChart,
  Wand2,
} from "lucide-react";
import { Link } from "react-router";

const ease = [0.22, 1, 0.36, 1] as const;

const LOOP = [
  { label: "Assess", body: "Domain-tagged assessments measure real proficiency" },
  { label: "Analyse", body: "The gap engine explains where capability leaks" },
  { label: "Learn", body: "A personalised path maps gaps to iGOT training" },
  { label: "Improve", body: "Every result updates the competency profile" },
];

const MODULES = [
  {
    icon: BrainCircuit,
    title: "AI competency analysis",
    body: "Eight statistical dimensions scored against role targets, with explainable priority scoring — never a bare percentage.",
  },
  {
    icon: Wand2,
    title: "MCQ & quiz generation",
    body: "Upload a handbook; receive source-traced multiple-choice assessments with quality auditing and difficulty control.",
  },
  {
    icon: GraduationCap,
    title: "iGOT Karmayogi integration",
    body: "An adapter layer maps every gap to ecosystem courses — architecture ready for live government APIs.",
  },
  {
    icon: FileUp,
    title: "Document intelligence",
    body: "Materials become structured knowledge: topics, concepts, objectives and question opportunities.",
  },
  {
    icon: LineChart,
    title: "Adaptive learning loop",
    body: "Results feed back into recommendations automatically. Assess → analyse → learn → improve, continuously.",
  },
  {
    icon: BarChart3,
    title: "Organisational analytics",
    body: "Department × competency heatmaps show leaders exactly where training investment pays.",
  },
];

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.25 }}
      className="relative mx-auto w-full max-w-md"
    >
      <div
        aria-hidden
        className="absolute -inset-x-6 -bottom-5 top-8 rounded-2xl border hairline-faint bg-[var(--qz-bg-raised)] opacity-70"
        style={{ transform: "perspective(1200px) rotateX(6deg)" }}
      />
      <div className="edge-glow relative rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Gap report · Sampling &amp; Estimation</span>
          <span className="rounded-md border border-rose-300/30 bg-rose-400/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-rose-300">
            Critical
          </span>
        </div>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="num text-4xl font-semibold tracking-tight">54%</span>
          <span className="num text-xs text-muted-qz">current · target 80%</span>
          <span className="num ml-auto rounded-lg border border-rose-300/25 bg-rose-400/[0.07] px-2 py-0.5 text-xs font-semibold text-rose-300">
            −26
          </span>
        </div>
        {/* target bar */}
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full w-[54%] rounded-full bg-gradient-to-r from-[#5b76f2] to-[#7590ff]" />
          <span className="absolute top-[-3px] h-[calc(100%+6px)] w-px bg-white/40" style={{ left: "80%" }} />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-secondary">
          “Your proficiency sits well below the officer standard, and this is your primary working domain —
          the gap directly constrains survey precision.”
        </p>
        <div className="mt-4 space-y-2 border-t hairline-faint pt-4 text-xs text-muted-qz">
          <p><span className="text-emerald-300/90">Recommended:</span> Survey Sampling Techniques</p>
          <p><span className="text-secondary">Then:</span> Applied assessment · re-score profile</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const quizzes = useQuery(api.quiza.listQuizzes);
  const loading = quizzes === undefined;
  const totalQuestions = (quizzes ?? []).reduce((s, q) => s + (q.questionCount ?? 0), 0);

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* ---------------------------------------------------------- Hero */}
      <section className="studio-light relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
        <PageContainer width="wide">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.p
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="eyebrow flex items-center gap-3"
              >
                <span className="h-px w-8 bg-[var(--qz-accent)]/60" />
                StatGyan · Competency intelligence platform
              </motion.p>

              <motion.h1
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease }}
                className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--qz-text)] sm:text-6xl lg:text-[4rem]"
              >
                Understand your capabilities.
                <br />
                <span className="text-muted-qz">Build what comes next.</span>
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16, ease }}
                className="mt-6 max-w-md text-pretty text-base leading-relaxed text-secondary"
              >
                An AI-powered competency and learning platform for India's Official Statistical
                System — measure capability, build competence, strengthen the system.
              </motion.p>

              <motion.div
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24, ease }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <Link
                  to={isAuthenticated ? "/onboarding" : "/auth"}
                  data-cursor="hover"
                  className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                >
                  Assess my competency <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#loop"
                  className="inline-flex h-11 items-center rounded-xl border hairline bg-white/[0.02] px-6 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-white/[0.05] hover:text-[var(--qz-text)]"
                >
                  See how it works
                </a>
              </motion.div>

              {!loading && (
                <p className="num mt-10 text-xs tracking-wide text-muted-qz">
                  8 competency domains · {totalQuestions} calibrated questions · iGOT-ready
                </p>
              )}
            </div>

            <HeroPreview />
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ Loop */}
      <section id="loop" className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <p className="eyebrow mb-2">The closed learning loop</p>
          <h2 className="mb-14 max-w-md text-xl font-semibold tracking-tight sm:text-2xl">
            Not another LMS — an intelligence layer over the learning ecosystem.
          </h2>
          <ol className="grid gap-8 md:grid-cols-4">
            {LOOP.map((step, i) => (
              <motion.li
                key={step.label}
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                <div className="flex items-center gap-3">
                  <span className="num grid size-7 place-items-center rounded-lg border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] text-xs font-bold text-[var(--qz-accent)]">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-white/[0.07]" />
                  {i < LOOP.length - 1 && <span className="text-xs text-muted-qz">→</span>}
                </div>
                <h3 className="mt-5 text-[15px] font-semibold tracking-tight">{step.label}</h3>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-secondary">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </PageContainer>
      </section>

      {/* --------------------------------------------------------- Modules */}
      <section className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <p className="eyebrow mb-2">Capabilities</p>
          <h2 className="mb-12 max-w-md text-xl font-semibold tracking-tight sm:text-2xl">
            Everything the problem statement demands.
          </h2>
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease }}
              >
                <m.icon className="size-5 text-[var(--qz-accent)]" strokeWidth={1.6} />
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-secondary">{m.body}</p>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="border-t hairline-faint py-24">
        <PageContainer width="narrow">
          <div className="text-center">
            <p className="eyebrow">StatGyan</p>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Measure capability. Build competence. Strengthen the statistical system.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-secondary">
              Start with a ten-minute baseline. Every assessment after that makes the
              intelligence sharper.
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              data-cursor="hover"
              className="btn-specular mt-8 inline-flex h-11 items-center gap-2 rounded-xl px-7 text-sm font-semibold"
            >
              Begin the loop <ArrowRight className="size-4" />
            </Link>
          </div>
        </PageContainer>
      </section>

      <footer className="border-t hairline-faint pb-28 py-10 md:pb-10">
        <PageContainer width="wide">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-qz">
              STATGYAN — AI-powered capacity building for India's Official Statistical System.
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-qz">
              <Link to="/igot" className="transition-colors hover:text-secondary">iGOT Karmayogi</Link>
              <Link to="/admin" className="transition-colors hover:text-secondary">Admin analytics</Link>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
