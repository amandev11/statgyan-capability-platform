import { PageContainer, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";

export default function Leaderboard() {
  const rows = useQuery(api.quiza.leaderboard);
  const { user } = useAuth();
  const myId = user?._id;

  return (
    <PageContainer width="default">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Leaderboard</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          The company you keep.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Ranked by average accuracy across all completed rounds. Consistency
          beats a single lucky perfect score.
        </p>
      </div>

      {rows === undefined ? (
        <div className="mt-10 space-y-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-14 rounded-2xl border hairline-faint border-dashed px-6 py-16 text-center">
          <Medal className="mx-auto size-6 text-muted-qz" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-medium text-secondary">
            No rounds recorded yet — the first entry could be yours.
          </p>
        </div>
      ) : (
        <>
          {/* Podium — top three */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {rows.slice(0, 3).map((row, i) => (
              <motion.div
                key={row.userId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-5",
                  i === 0
                    ? "border-[var(--qz-accent)]/30 bg-gradient-to-b from-[var(--qz-accent)]/[0.09] to-[var(--qz-surface-1)]"
                    : "hairline bg-[var(--qz-surface-1)]",
                  row.userId === myId && "ring-1 ring-[var(--qz-accent)]/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="num text-xs text-muted-qz">#{i + 1}</span>
                  {i === 0 ? (
                    <Crown className="size-4 text-[var(--qz-accent)]" strokeWidth={1.8} />
                  ) : (
                    <span className="num grid size-5 place-items-center rounded-md border hairline-faint bg-white/[0.03] text-[10px] font-semibold text-muted-qz">
                      {i + 1}
                    </span>
                  )}
                </div>
                <p className="mt-4 truncate text-sm font-semibold text-[var(--qz-text)]">
                  {row.name}
                  {row.userId === myId && (
                    <span className="ml-2 rounded-md bg-[var(--qz-accent)]/[0.15] px-1.5 py-0.5 text-[10px] font-medium text-[var(--qz-accent)]">
                      You
                    </span>
                  )}
                </p>
                <div className="num mt-3 flex items-baseline gap-4">
                  <span className="text-2xl font-semibold tracking-tight">
                    {row.avgAccuracy}%
                  </span>
                  <span className="text-xs text-muted-qz">{row.taken} rounds</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Remaining ranks */}
          {rows.length > 3 && (
            <ul className="mt-6 divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
              {rows.slice(3).map((row, idx) => {
                const rank = idx + 4;
                const mine = row.userId === myId;
                return (
                  <li
                    key={row.userId}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5",
                      mine && "bg-[var(--qz-accent)]/[0.06]",
                    )}
                  >
                    <span className="num w-7 shrink-0 text-sm tabular-nums text-muted-qz">
                      {rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--qz-text)]">
                      {row.name}
                      {mine && (
                        <span className="ml-2 rounded-md bg-[var(--qz-accent)]/[0.15] px-1.5 py-0.5 text-[10px] font-medium text-[var(--qz-accent)]">
                          You
                        </span>
                      )}
                    </span>
                    <span className="num hidden w-20 text-right text-xs text-muted-qz sm:block">
                      best {row.bestScore}%
                    </span>
                    <span className="num hidden w-24 text-right text-xs text-muted-qz sm:block">
                      {row.taken} rounds
                    </span>
                    <span className="num w-12 text-right text-sm font-semibold">
                      {row.avgAccuracy}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </PageContainer>
  );
}
