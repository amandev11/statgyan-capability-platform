import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  Building2,
  Clapperboard,
  FileStack,
  Gauge,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router";

const PIPELINE = [
  { step: "Assess", desc: "Adaptive diagnostics capture what a person can actually do — separating knowledge gaps from confidence gaps.", icon: Gauge },
  { step: "Diagnose", desc: "The AI maps competencies, detects skill gaps and ranks them by role impact with explainable reasoning.", icon: Target },
  { step: "Learn", desc: "A personalized pathway connects each gap to the most relevant iGOT Karmayogi training.", icon: BookOpenCheck },
  { step: "Improve", desc: "Reassessment turns learning into measurable capability movement for the person and the organization.", icon: BarChart3 },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Competency Engine",
    body: "A living model of workforce capability across statistical foundations, survey methodology, data management and emerging digital skills.",
  },
  {
    icon: Sparkles,
    title: "AI Material Lab",
    body: "Upload any training PDF or deck. The AI extracts topics, maps competencies and generates grounded assessments with source references.",
  },
  {
    icon: Target,
    title: "Explainable Skill-Gap Detection",
    body: "A priority score blends gap size, role relevance, importance and evidence confidence — with human-readable reasoning for every recommendation.",
  },
  {
    icon: BookOpenCheck,
    title: "iGOT Connect Adapter",
    body: "API-ready integration layer that matches detected gaps to iGOT Karmayogi courses via semantic competency matching.",
  },
  {
    icon: BarChart3,
    title: "Capability Command Center",
    body: "Departmental heatmaps, executive AI briefs and a training-impact simulator that shows where investment moves the needle.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible by Design",
    body: "Every AI output is labelled and traceable to its source. No fabricated integrations, no unexplained recommendations.",
  },
];

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-600/25">
              <Brain className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight">STATGYAN AI</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">From Data to Capability</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/architecture">Architecture</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/auth?returnTo=/dashboard">
                Sign in <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <Badge variant="outline" className="mx-auto mb-5 gap-1.5 border-indigo-200 bg-white/70 px-3 py-1 text-indigo-700 backdrop-blur">
          <Sparkles className="size-3.5" /> AI-Powered Competency Intelligence for India's Official Statistical System
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Turn Training Into{" "}
          <span className="text-gradient">Capability.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          STATGYAN AI continuously understands what each officer knows, detects competency
          gaps, personalizes learning pathways and connects them to the iGOT Karmayogi
          ecosystem — so capacity building becomes measurable.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-indigo-600/25">
            <Link to="/auth?returnTo=/dashboard">
              <Play className="size-4" /> Explore Demo
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="glass gap-2 bg-white/60">
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </div>

        {/* Hero visual — mini dashboard */}
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong mx-auto mt-14 max-w-4xl rounded-2xl p-4 sm:p-6"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            {PIPELINE.map((p, i) => (
              <div key={p.step} className="glass-subtle relative rounded-xl p-4 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  0{i + 1}
                </span>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                  <p.icon className="size-4 text-primary" /> {p.step}
                </p>
                <p className="mt-1 hidden text-[11px] leading-relaxed text-muted-foreground sm:block">{p.desc}</p>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight aria-hidden className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-indigo-300 sm:block" />
                )}
              </div>
            ))}
          </div>
          {/* Fake metrics strip */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              ["Overall Competency", "72%", "↑ 8% this month"],
              ["Critical Gaps", "2", "Data Quality · Python"],
              ["iGOT Match", "94%", "Survey Sampling Techniques"],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-lg bg-white/55 p-3 text-left backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-xl font-bold tabular-nums">{value}</p>
                <p className="truncate text-[10px] text-emerald-600">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="border-y border-white/50 bg-white/30 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">The problem</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            India's Official Statistical System runs on deep expertise — traditional training can't see it.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <ul className="space-y-3">
              {[
                "What does this employee already know?",
                "Which competencies are actually weak?",
                "What should they learn next?",
                "Which training is most relevant?",
              ].map((q) => (
                <li key={q} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-700 line-through decoration-slate-400/70 decoration-2">
                  <Target className="size-4 shrink-0 text-rose-400 no-underline" /> {q}
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {[
                "Has training measurably improved competency?",
                "Where are the organization's systemic skill gaps?",
                "How do we prioritize limited training budgets?",
                "How do we prove capability, not course completion?",
              ].map((q) => (
                <li key={q} className="glass flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-slate-800">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">How it works</p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Upload → Understand → Assess → Detect Gaps → Personalize → Learn → Reassess → Improve
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass glass-hover rounded-xl p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-100/80 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <FileStack className="pointer-events-none absolute -left-8 top-8 size-40 rotate-[-12deg] text-indigo-100" />
          <Building2 className="pointer-events-none absolute -right-8 bottom-8 size-36 rotate-[8deg] text-sky-100" />
          <h2 className="relative mx-auto max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            From Training Completion to Measurable Capability.
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Experience the full journey in under two minutes — upload a training PDF, watch the
            AI understand it, take an adaptive assessment and see capability move.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-indigo-600/25">
              <Link to="/auth?returnTo=/dashboard">
                Run AI Capability Demo <Clapperboard className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/architecture">System architecture & responsible AI</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/50 bg-white/40 py-8 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p><b>STATGYAN AI</b> — From Data to Capability.</p>
          <p>Demonstration build. The iGOT Karmayogi catalogue shown is a demo dataset behind an API-ready adapter; all AI outputs are labelled and grounded in seeded demonstration data.</p>
        </div>
      </footer>
    </motion.div>
  );
}
