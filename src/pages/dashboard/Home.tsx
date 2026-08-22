import {
  PageContainer,
  ProgressRing,
  SectionHeader,
  SkeletonBlock,
} from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { analyseGaps, buildLearningPath, domainName } from "@/lib/statgyan/engine";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  FileUp,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { Link } from "react-router";

function firstName(name?: string | null, email?: string | null) {
  const base = name || email?.split("@")[0] || "learner";
  return base.split(/[\s._-]+/)[0]!.replace(/^\w/, (c) => c.toUpperCase());
}

const LOOP = [
  { label: "Assess", to: "/assess" },
  { label: "Analyse", to: "/competency" },
  { label: "Learn", to: "/learning" },
  { label: "Improve", to: "/assess" },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const profile = useQuery(api.quiza.myProfile);
  const attempts = useQuery(api.quiza.myAttempts);
  const quizzes = useQuery(api.quiza.listQuizzes);

  const loading =
    profile === undefined || attempts === undefined || quizzes === undefined;

  const gaps = profile
    ? analyseGaps(profile.competencies, {
        primaryDomain: profile.primaryDomain,
        secondaryDomains: profile.secondaryDomains,
      })
    : [];
  const critical = gaps.filter((g) => g.gap >= 6).slice(0, 3);
  const path = buildLearningPath(gaps);
  const readinessScore = profile
    ? Math.round(
        profile.competencies.reduce((s, c) => s + c.score, 0) /
          Math.max(profile.competencies.length, 1),
      )
    : 0;
  const ease = [0.22, 1, 0.36, 1] as const;

  // Next best action logic
  let nextAction: React.ReactNode;
  if (loading) {
    nextAction = <SkeletonBlock className="h-40 rounded-2xl" />;
  } else if (!profile) {
    nextAction = null;
  } else if (attempts.length === 0) {
    nextAction = (
      <NextCard
        eyebrow="First step"
        icon={Target}
        title="Take your first competency assessment"
        body="A short statistical round replaces your self-assessed baseline with evidence-based scores and unlocks gap analysis."
        cta="Browse assessments"
        to="/assess"
      />
    );
  } else if (critical.length > 0 && path.length > 0) {
    nextAction = (
      <NextCard
        eyebrow={`Priority · ${critical[0].name}`}
        icon={Sparkles}
        title={path[0].title}
        body={`${critical[0].reasoning.split(";")[0]} — this module is projected to lift ${domainName(path[0].domainId)} from ${path[0].projectedAfter - path[0].expectedGain}% toward ${path[0].projectedAfter}%.`}
        cta="Open learning path"
        to="/learning"
      />
    );
  } else {
    const unplayed = quizzes?.find((q) => q.myBest === undefined);
    nextAction = (
      <NextCard
        eyebrow="Keep the loop turning"
        icon={Target}
        title={unplayed ? unplayed.title : "Re-assess your strongest domains"}
        body="Fresh evidence keeps recommendations accurate — each round refines your competency profile."
        cta="Start now"
        to={`/quiz/${unplayed?.slug ?? "survey-design-fundamentals"}`}
      />
    );
  }

  return (
    <PageContainer width="wide">
      {/* ------------------------------------------------------- Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div className="max-w-lg">
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {profile?.department ?? "Official Statistical System"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[2rem]">
            {firstName(user?.name, user?.email)}, here's your capability position.
          </h1>
          {/* Loop strip */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-qz" aria-label="Learning loop">
            {LOOP.map((l, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <Link to={l.to} className="rounded-full border hairline-faint bg-white/[0.03] px-2.5 py-1 font-medium transition-colors hover:border-[var(--qz-accent)]/40 hover:text-secondary">
                  {l.label}
                </Link>
                {i < LOOP.length - 1 && <span aria-hidden>→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Readiness ring */}
        {!loading && profile && (
          <ProgressRing
            value={readinessScore}
            size={120}
            strokeWidth={5}
            label={<span className="num text-2xl font-semibold">{readinessScore}%</span>}
            sublabel={<span className="text-[10px] text-muted-qz">overall readiness</span>}
          />
        )}
      </motion.div>

      {/* -------------------------------------------------- Next best action */}
      <section className="mt-9" aria-label="Recommended next action">
        <SectionHeader eyebrow="Adaptive loop" title="Your next move" />
        {nextAction}
      </section>

      {/* ---------------------------------------------------- Critical gaps */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease }}
        className="mt-12"
      >
        <SectionHeader
          eyebrow="Gap analysis"
          title="Where capability is leaking"
          action={
            <Link to="/competency" className="inline-flex items-center gap-1 text-sm font-medium text-muted-qz transition-colors hover:text-secondary">
              Full report <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
        {loading ? (
          <SkeletonBlock className="h-32 rounded-2xl" />
        ) : critical.length === 0 ? (
          <div className="rounded-2xl border hairline-faint bg-[var(--qz-surface-1)] p-8 text-center">
            <BrainCircuit className="mx-auto size-5 text-[var(--qz-accent)]" strokeWidth={1.6} />
            <p className="mt-3 text-sm text-secondary">
              No significant gaps right now — take an assessment to keep evidence fresh.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {critical.map((gap) => (
              <Link
                key={gap.id}
                to="/competency"
                data-cursor="hover"
                className="edge-glow edge-glow-hover rounded-xl border hairline bg-[var(--qz-surface-1)] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{gap.name}</span>
                  <span
                    className={
                      gap.severity === "Critical"
                        ? "rounded-md border border-rose-300/25 bg-rose-400/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-rose-300"
                        : gap.severity === "High"
                          ? "rounded-md border border-amber-300/25 bg-amber-400/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-amber-200"
                          : "rounded-md border hairline-faint px-1.5 py-0.5 text-[10px] font-medium text-muted-qz"
                    }
                  >
                    {gap.severity}
                  </span>
                </div>
                <div className="num mt-3 flex items-baseline gap-2 text-xs text-muted-qz">
                  <span className="text-lg font-semibold text-[var(--qz-text)]">{gap.current}%</span>
                  <span>→ target {gap.target}%</span>
                  <span className="ml-auto font-semibold text-rose-300">−{gap.gap}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-secondary">{gap.reasoning}</p>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* --------------------------------------------------- Quick modules */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.16, ease }}
        className="mt-12 grid gap-4 pb-8 md:grid-cols-3"
      >
        <QuickCard
          icon={Wand2}
          title="Generate an assessment"
          body="Turn any uploaded handbook into a source-traced MCQ set."
          to="/generate"
        />
        <QuickCard
          icon={FileUp}
          title="Upload material"
          body="Document intelligence extracts topics, concepts and question opportunities."
          to="/materials"
        />
        <QuickCard
          icon={BrainCircuit}
          title="Ask the AI assistant"
          body="'Why did I get this wrong?' 'What should I learn next?'"
          to="/assistant"
        />
      </motion.section>

      {/* ------------------------------------------------------- Recent rounds */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22, ease }}
        className="pb-8"
      >
        <SectionHeader eyebrow="Evidence" title="Recent assessments" />
        {attempts === undefined ? (
          <SkeletonBlock className="h-36 rounded-2xl" />
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border hairline-faint border-dashed px-6 py-12 text-center">
            <Target className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
            <p className="mt-3 text-sm text-secondary">No assessments yet — results and their competency impact will appear here.</p>
          </div>
        ) : (
          <ul className="edge-glow divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
            {attempts.slice(0, 5).map((attempt) => (
              <li key={attempt._id}>
                <Link to={`/results/${attempt._id}`} data-cursor="hover" className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]">
                  <span
                    className={`num grid size-11 shrink-0 place-items-center rounded-xl border text-sm font-semibold ${
                      attempt.scorePct >= 70
                        ? "border-emerald-300/25 bg-emerald-400/[0.07] text-emerald-300"
                        : attempt.scorePct >= 50
                          ? "border-amber-300/25 bg-amber-400/[0.07] text-amber-200"
                          : "border-rose-300/25 bg-rose-400/[0.07] text-rose-300"
                    }`}
                  >
                    {attempt.scorePct}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{attempt.quizTitle}</p>
                    <p className="num mt-0.5 text-xs text-muted-qz">
                      {attempt.category} · {attempt.correctCount}/{attempt.total} ·{" "}
                      {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-qz" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------

function NextCard({
  eyebrow,
  icon: Icon,
  title,
  body,
  cta,
  to,
}: {
  eyebrow: string;
  icon: typeof Target;
  title: string;
  body: string;
  cta: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      data-cursor="hover"
      className="group edge-glow edge-glow-hover relative block overflow-hidden rounded-2xl border hairline bg-gradient-to-b from-[var(--qz-surface-2)] to-[var(--qz-surface-1)] p-7 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(108,140,255,0.14), transparent)" }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <p className="eyebrow flex items-center gap-2">
            <Icon className="size-3.5 text-[var(--qz-accent)]" />
            {eyebrow}
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{body}</p>
        </div>
        <span className="btn-specular inline-flex h-11 shrink-0 items-center gap-2 self-end rounded-xl px-5 text-sm font-semibold">
          {cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function QuickCard({
  icon: Icon,
  title,
  body,
  to,
}: {
  icon: typeof Target;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      data-cursor="hover"
      className="edge-glow edge-glow-hover group rounded-xl border hairline bg-[var(--qz-surface-1)] p-5"
    >
      <Icon className="size-4 text-[var(--qz-accent)]" strokeWidth={1.8} />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-secondary">{body}</p>
    </Link>
  );
}
