import { TopNav } from "@/components/quiza/nav";
import { LoopDiagram } from "@/components/quiza/loop-diagram";
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

const HOW = [
  { label: "Assess", body: "Domain-tagged assessments measure real proficiency across eight statistical dimensions." },
  { label: "Identify gaps", body: "The gap engine compares evidence to role targets and explains every priority in plain language." },
  { label: "Personalize", body: "A learning path sequences modules by leverage — largest role-critical gap first." },
  { label: "Connect to iGOT", body: "An adapter maps each gap to Karmayogi ecosystem courses, ready for live API credentials." },
  { label: "Generate assessments", body: "Upload any handbook; receive source-traced MCQs with automated quality checks." },
  { label: "Measure improvement", body: "Results update the competency profile instantly — individuals and organisations see capability move." },
];

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
                Build stronger statistical capability,
                <br />
                <span className="text-muted-qz">one competency at a time.</span>
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

            <LoopDiagram />
          </div>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------ Loop */}
      <section id="loop" className="border-t hairline-faint py-20 sm:py-24">
        <PageContainer width="wide">
          <p className="eyebrow mb-2">How StatGyan works</p>
          <h2 className="mb-14 max-w-lg text-xl font-semibold tracking-tight sm:text-2xl">
            A closed learning loop for India's statistical workforce — not another LMS.
          </h2>
          <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {HOW.map((step, i) => (
              <motion.li
                key={step.label}
                initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease }}
              >
                <div className="flex items-center gap-3">
                  <span className="num grid size-7 place-items-center rounded-lg border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] text-xs font-bold text-[var(--qz-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-white/[0.07]" />
                  {i < HOW.length - 1 && <span aria-hidden className="text-xs text-muted-qz">→</span>}
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
