import {
  DifficultyBadge,
  PageContainer,
  SectionHeader,
  SkeletonBlock,
  StatBlock,
  prefersReducedMotion,
} from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock3, Sparkles, Target } from "lucide-react";
import { Link } from "react-router";

type Quiz = Doc<"quizzes"> & { questionCount?: number; attemptCount?: number; myBest?: number };

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(name?: string | null, email?: string | null) {
  const base = name || email?.split("@")[0] || "learner";
  return base.split(/[\s._-]+/)[0]!.replace(/^\w/, (c) => c.toUpperCase());
}

export default function DashboardHome() {
  const { user } = useAuth();
  const stats = useQuery(api.quiza.myStats);
  const attempts = useQuery(api.quiza.myAttempts);
  const quizzes = useQuery(api.quiza.listQuizzes);

  // Recommendation: prefer an unplayed quiz; otherwise the weakest personal best.
  let recommended: Quiz | undefined;
  if (quizzes) {
    recommended =
      quizzes.find((q) => q.myBest === undefined) ??
      [...quizzes].sort(
        (a, b) => (a.myBest ?? 100) - (b.myBest ?? 100),
      )[0];
  }

  const loading = stats === undefined || quizzes === undefined;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <PageContainer width="wide">
      {/* ------------------------------------------------------- Greeting */}
      <motion.div
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[2rem]">
            {greeting()}, {firstName(user?.name, user?.email)}.
          </h1>
          <p className="mt-1.5 text-sm text-secondary">
            {loading
              ? null
              : stats && stats.taken > 0
                ? `You're averaging ${stats.avgAccuracy}% across ${stats.taken} round${stats.taken === 1 ? "" : "s"}.`
                : "Your first round is one tap away."}
          </p>
        </div>
      </motion.div>

      {/* -------------------------------------------- Recommended / continue */}
      <motion.section
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease }}
        className="mt-8"
        aria-label="Recommended next quiz"
      >
        {loading || !recommended ? (
          <SkeletonBlock className="h-48 rounded-2xl" />
        ) : (
          <Link
            to={`/quiz/${recommended.slug}`}
            data-cursor="hover"
            className="group edge-glow edge-glow-hover relative block overflow-hidden rounded-2xl border hairline bg-gradient-to-b from-[var(--qz-surface-2)] to-[var(--qz-surface-1)] p-7 transition-all duration-300 hover:border-white/[0.15] sm:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(108,140,255,0.14), transparent)",
              }}
            />
            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-lg">
                <p className="eyebrow flex items-center gap-2">
                  <Sparkles className="size-3.5 text-[var(--qz-accent)]" />
                  {recommended.myBest !== undefined ? "Worth another pass" : "Recommended next"}
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                  {recommended.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-secondary">
                  {recommended.description}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <DifficultyBadge difficulty={recommended.difficulty} />
                  <span className="num inline-flex items-center gap-1.5 text-xs text-muted-qz">
                    <Clock3 className="size-3.5" />~{recommended.estMinutes} min
                  </span>
                  <span className="num text-xs text-muted-qz">
                    {recommended.questionCount ?? 6} questions
                  </span>
                </div>
              </div>
              <span className="btn-specular inline-flex h-11 shrink-0 items-center gap-2 self-end rounded-xl px-5 text-sm font-semibold">
                {recommended.myBest !== undefined ? "Play again" : "Start now"}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}
      </motion.section>

      {/* ------------------------------------------------------------ Stats */}
      <motion.section
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.14, ease }}
        className="mt-10"
      >
        <SectionHeader eyebrow="Performance" title="Your record so far" />
        <div className="edge-glow grid grid-cols-2 gap-x-6 gap-y-8 rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-7 sm:grid-cols-4">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-12" />)
          ) : (
            <>
              <StatBlock label="Rounds played" value={stats?.taken ?? 0} />
              <StatBlock label="Average accuracy" value={`${stats?.avgAccuracy ?? 0}%`} />
              <StatBlock
                label="Best score"
                value={
                  <span className={stats?.bestScore === 100 ? "text-emerald-300" : undefined}>
                    {stats?.bestScore ?? 0}%
                  </span>
                }
              />
              <StatBlock label="Subjects explored" value={stats?.categories ?? 0} />
            </>
          )}
        </div>
      </motion.section>

      {/* --------------------------------------------------- Recent activity */}
      <motion.section
        initial={prefersReducedMotion() ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease }}
        className="mt-12"
      >
        <SectionHeader
          eyebrow="History"
          title="Recent rounds"
          action={
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-qz transition-colors hover:text-secondary"
            >
              All activity <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
        {attempts === undefined ? (
          <SkeletonBlock className="h-40 rounded-2xl" />
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border hairline-faint border-dashed px-6 py-12 text-center">
            <Target className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
            <p className="mt-3 text-sm font-medium text-secondary">
              No rounds yet — your history will live here.
            </p>
            <Link
              to="/explore"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80"
            >
              Find a quiz <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <ul className="edge-glow divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
            {attempts.slice(0, 5).map((attempt) => (
              <li key={attempt._id}>
                <Link
                  to={`/results/${attempt._id}`}
                  data-cursor="hover"
                  className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
                >
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
                    <p className="truncate text-sm font-medium text-[var(--qz-text)]">
                      {attempt.quizTitle}
                    </p>
                    <p className="num mt-0.5 text-xs text-muted-qz">
                      {attempt.correctCount}/{attempt.total} ·{" "}
                      {Math.round(attempt.durationMs / 1000)}s ·{" "}
                      {new Date(attempt.completedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
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
