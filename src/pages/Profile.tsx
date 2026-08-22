import {
  PageContainer,
  ProgressRing,
  SectionHeader,
  SkeletonBlock,
  StatBlock,
} from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Compass,
  Flame,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

function Badge({
  icon: Icon,
  title,
  body,
  earned,
}: {
  icon: typeof Award;
  title: string;
  body: string;
  earned: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-xl border p-4 transition-colors duration-300",
        earned
          ? "hairline bg-[var(--qz-surface-1)]"
          : "border-white/[0.04] bg-transparent opacity-45",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg border",
          earned
            ? "border-[var(--qz-accent)]/30 bg-[var(--qz-accent)]/[0.1] text-[var(--qz-accent)]"
            : "hairline-faint text-muted-qz",
        )}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--qz-text)]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-qz">{body}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const stats = useQuery(api.quiza.myStats);
  const attempts = useQuery(api.quiza.myAttempts);

  if (isLoading || stats == null || attempts === undefined) {
    return (
      <PageContainer width="default" className="pt-6">
        <SkeletonBlock className="h-28 rounded-2xl" />
        <SkeletonBlock className="mt-8 h-24 rounded-2xl" />
        <SkeletonBlock className="mt-8 h-48 rounded-2xl" />
      </PageContainer>
    );
  }

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "Learner";
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  const subjects = new Set(attempts.map((a) => a.category));
  const perfect = attempts.some((a) => a.scorePct === 100);
  const recent = attempts.slice(0, 10);

  const level = Math.floor(stats.avgAccuracy / 20); // 0–5

  const LEVEL_NAMES = ["Novice", "Apprentice", "Practised", "Sharp", "Expert", "Master"];

  return (
    <PageContainer width="default">
      {/* ------------------------------------------------------- Identity */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border hairline bg-gradient-to-b from-[var(--qz-surface-2)] to-[var(--qz-surface-1)] p-7 sm:p-9"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(108,140,255,0.12), transparent)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <span className="num grid size-16 place-items-center rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#7590ff] to-[#5b76f2] text-xl font-bold text-[#07090c] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              {initials}
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {displayName}
              </h1>
              {user?.email && (
                <p className="mt-0.5 truncate text-sm text-muted-qz">{user.email}</p>
              )}
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--qz-accent)]/30 bg-[var(--qz-accent)]/[0.1] px-2.5 py-0.5 text-[11px] font-medium text-[var(--qz-accent)]">
                <Sparkles className="size-3" />
                Level {level + 1} · {LEVEL_NAMES[level]}
              </span>
            </div>
          </div>

          {stats.taken > 0 ? (
            <ProgressRing
              value={stats.avgAccuracy}
              size={104}
              strokeWidth={5}
              label={
                <span className="num text-lg font-semibold">{stats.avgAccuracy}%</span>
              }
              sublabel={<span className="text-[10px] text-muted-qz">avg accuracy</span>}
            />
          ) : null}
        </div>
      </motion.section>

      {/* ---------------------------------------------------------- Stats */}
      <section className="mt-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-7 sm:grid-cols-4">
          <StatBlock label="Rounds played" value={stats.taken} />
          <StatBlock label="Average accuracy" value={`${stats.avgAccuracy}%`} />
          <StatBlock label="Best score" value={`${stats.bestScore}%`} />
          <StatBlock label="Minutes focused" value={stats.minutes} />
        </div>
      </section>

      {/* --------------------------------------------------------- Badges */}
      <section className="mt-12">
        <SectionHeader eyebrow="Milestones" title="Earned along the way" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Badge
            icon={Flame}
            title="First Steps"
            body="Complete your first quiz round."
            earned={stats.taken >= 1}
          />
          <Badge
            icon={Award}
            title="Perfect Round"
            body="Score 100% on any quiz."
            earned={perfect}
          />
          <Badge
            icon={Compass}
            title="Explorer"
            body="Play quizzes across three or more subjects."
            earned={subjects.size >= 3}
          />
          <Badge
            icon={Sparkles}
            title="Regular"
            body="Complete five rounds."
            earned={stats.taken >= 5}
          />
        </div>
      </section>

      {/* ------------------------------------------------------- Activity */}
      <section className="mt-12 pb-10">
        <SectionHeader
          eyebrow="History"
          title="All rounds"
          action={
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-qz transition-colors hover:text-secondary"
            >
              Play another <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
        {attempts.length === 0 ? (
          <div className="rounded-2xl border hairline-faint border-dashed px-6 py-14 text-center">
            <p className="text-sm font-medium text-secondary">
              Your rounds will appear here.
            </p>
            <Link
              to="/explore"
              className="btn-specular mt-5 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold"
            >
              Start your first quiz
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
            {recent.map((attempt) => (
              <li key={attempt._id}>
                <Link
                  to={`/results/${attempt._id}`}
                  data-cursor="hover"
                  className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <span
                    className={cn(
                      "num grid size-11 shrink-0 place-items-center rounded-xl border text-sm font-semibold",
                      attempt.scorePct >= 70
                        ? "border-emerald-300/25 bg-emerald-400/[0.07] text-emerald-300"
                        : attempt.scorePct >= 50
                          ? "border-amber-300/25 bg-amber-400/[0.07] text-amber-200"
                          : "border-rose-300/25 bg-rose-400/[0.07] text-rose-300",
                    )}
                  >
                    {attempt.scorePct}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{attempt.quizTitle}</p>
                    <p className="num mt-0.5 text-xs text-muted-qz">
                      {attempt.category} · {attempt.correctCount}/{attempt.total} ·{" "}
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
      </section>
    </PageContainer>
  );
}
