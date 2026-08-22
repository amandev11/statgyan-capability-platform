import { PageContainer, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { analyseGaps, buildLearningPath } from "@/lib/statgyan/engine";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function Learning() {
  const profile = useQuery(api.quiza.myProfile);

  if (profile === undefined) {
    return (
      <PageContainer width="default">
        <SkeletonBlock className="h-8 w-52" />
        <div className="mt-8 space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-32 rounded-2xl" />)}
        </div>
      </PageContainer>
    );
  }

  const gaps = profile
    ? analyseGaps(profile.competencies, {
        primaryDomain: profile.primaryDomain,
        secondaryDomains: profile.secondaryDomains,
      })
    : [];
  const modules = buildLearningPath(gaps);
  const totalMinutes = modules.reduce((s, m) => s + m.minutes, 0);
  const totalGain = modules.reduce((s, m) => s + m.expectedGain, 0);

  return (
    <PageContainer width="reading">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Personalised engine</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your learning path</h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Sequenced by the gap engine — each step targets your largest open gap first.
          {modules.length > 0 && (
            <span className="num"> {modules.length} steps · ~{Math.round(totalMinutes / 60 * 10) / 10} hrs · projected +{totalGain} readiness points.</span>
          )}
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="mt-12 rounded-2xl border hairline-faint border-dashed px-6 py-16 text-center">
          <Sparkles className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
          <p className="mt-4 text-sm font-medium text-secondary">
            No open gaps above threshold right now.
          </p>
          <p className="mt-1 text-xs text-muted-qz">Complete an assessment — the path rebuilds itself from fresh evidence.</p>
          <Link to="/assess" className="btn-specular mt-6 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">
            Take an assessment
          </Link>
        </div>
      ) : (
        <>
          {/* Loop explainer */}
          <div className="edge-glow mt-8 flex items-center justify-between rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-4 text-xs text-muted-qz" aria-label="How this path was built">
            <span>Assessment evidence</span><span aria-hidden>→</span>
            <span>Gap analysis</span><span aria-hidden>→</span>
            <span>This sequence</span><span aria-hidden>→</span>
            <span>Re-assess</span>
          </div>

          <ol className="mt-8 space-y-4 pb-10">
            {modules.map((m, idx) => (
              <motion.li
                key={m.order}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
              >
                <article className="edge-glow edge-glow-hover relative rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
                  <div className="flex items-start gap-5">
                    <span className="num grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] text-sm font-bold text-[var(--qz-accent)]">
                      {String(m.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[15px] font-semibold tracking-tight">{m.title}</h2>
                      <p className="num mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-qz">
                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{m.minutes} min</span>
                        <span>{m.level}</span>
                        <span className="rounded-md border hairline-faint px-1.5 py-0.5">{m.provider}</span>
                      </p>

                      <div className="edge-glow mt-4 rounded-xl border hairline-faint bg-white/[0.02] p-3.5">
                        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-secondary">
                          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--qz-accent)]" />
                          <span><span className="font-medium text-[var(--qz-text)]">Why this: </span>{m.why}</span>
                        </p>
                      </div>

                      <div className="num mt-3 flex items-baseline gap-2 text-xs text-muted-qz">
                        <TrendingUp className="size-3.5 text-emerald-300/80" />
                        Projected: {m.domainName}{" "}
                        <span className="font-semibold text-emerald-300">+{m.expectedGain} pts</span>
                        → {m.projectedAfter}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <Link
                      to={m.courseId ? "/igot" : "/assess"}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80"
                    >
                      {m.courseId ? "View on iGOT" : "Practice assessment"}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              </motion.li>
            ))}
          </ol>
        </>
      )}
    </PageContainer>
  );
}
