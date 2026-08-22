import { PageContainer, SectionHeader, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { DOMAINS, domainName } from "@/lib/statgyan/engine";
import { igot, ORG_NOTE } from "@/lib/statgyan/igot";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Info,
  RefreshCw,
} from "lucide-react";

export default function Igot() {
  const profile = useQuery(api.quiza.myProfile);

  const gaps = profile
    ? igot.recommend(
        analyse(
          profile.competencies,
          profile.primaryDomain,
          profile.secondaryDomains,
        ),
      )
    : undefined;

  return (
    <PageContainer width="default">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Integration</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          iGOT Karmayogi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          StatGyan maps your competency gaps to training on the iGOT ecosystem through a
          dedicated adapter layer.
        </p>
      </div>

      {/* ------------------------------------------------- Connection status */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="edge-glow mt-8 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/50" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-300" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                iGOT Integration — {igot.label}
              </p>
              <p className="text-xs text-muted-qz">{igot.identityMapping}</p>
            </div>
          </div>
          <span className="num inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/[0.08] px-3 py-1 text-[11px] font-medium text-amber-200">
            <CircleDashed className="size-3.5" />
            Simulated connection · not a live government API
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Adapter status">
          <StatusRow label="Catalogue adapter" value="Ready (demo data)" ok />
          <StatusRow label="Competency → course mapping" value="Active" ok />
          <StatusRow label="Completion sync" value="Awaiting live credentials" ok={false} />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border hairline-faint bg-white/[0.02] p-3.5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted-qz" />
          <p className="text-xs leading-relaxed text-secondary">{igot.statusNote}</p>
        </div>
      </motion.section>

      {/* --------------------------------------------------- Recommendations */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-12"
      >
        <SectionHeader eyebrow="For you" title="Mapped to your open gaps" />
        {gaps === undefined ? (
          <SkeletonBlock className="h-40 rounded-2xl" />
        ) : gaps.length === 0 ? (
          <div className="rounded-2xl border hairline-faint border-dashed px-6 py-12 text-center">
            <p className="text-sm text-secondary">No gaps to map yet — complete an assessment first.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {gaps.slice(0, 4).map((rec, i) => (
              <article key={rec.course.id} className={`edge-glow edge-glow-hover rounded-xl border hairline bg-[var(--qz-surface-1)] p-5 ${i === 0 ? "" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{rec.course.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-qz">
                      {rec.course.provider} · {rec.course.level} ·{" "}
                      <span className="num">{rec.course.durationMin} min</span>
                    </p>
                  </div>
                  <span className="num grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] text-sm font-bold text-[var(--qz-accent)]">
                    {rec.matchScore}%
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-secondary">{rec.why}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="num text-xs text-emerald-300/90">est. +{rec.estimatedGain} pts</span>
                  {/* Deep-link placeholder — replaced by real iGOT URL in live mode */}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    aria-disabled
                    title="Deep link activates with the live iGOT integration"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-qz"
                  >
                    Course link (pending live API) <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>

      {/* -------------------------------------------------- Domain catalogue */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 pb-10"
      >
        <SectionHeader eyebrow="Catalogue" title="Domain coverage map" />
        <div className="edge-glow overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b hairline-faint text-xs text-muted-qz">
                <th className="px-5 py-3 font-medium">Competency domain</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Courses</th>
                <th className="px-5 py-3 text-right font-medium">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {DOMAINS.map((d) => {
                const courses = igot.searchByDomain(d.id);
                const best = Math.max(0, ...courses.map((c) => c.domainCoverage[d.id] ?? 0));
                return (
                  <tr key={d.id}>
                    <td className="px-5 py-3 text-[13px]">{domainName(d.id)}</td>
                    <td className="num hidden px-5 py-3 text-[13px] text-muted-qz sm:table-cell">{courses.length}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className="h-full rounded-full bg-[var(--qz-accent)]" style={{ width: `${best * 100}%` }} />
                        </div>
                        <span className="num w-9 text-right text-xs text-muted-qz">{Math.round(best * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-qz">
          <RefreshCw className="mt-0.5 size-3 shrink-0" />
          Adapter contract: searchByDomain / recommend / syncCompletion. {ORG_NOTE}
        </p>
      </motion.section>
    </PageContainer>
  );
}

// Local import-free gap analysis wrapper (avoids circular page imports)
import type { CompetencyState } from "@/lib/statgyan/types";
import { analyseGaps } from "@/lib/statgyan/engine";
function analyse(comps: CompetencyState[], primary?: string, secondary?: string[]) {
  return analyseGaps(comps, { primaryDomain: primary, secondaryDomains: secondary });
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-xl border hairline-faint bg-white/[0.02] px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-qz">
        {ok ? <CheckCircle2 className="size-3 text-emerald-300/80" /> : <CircleDashed className="size-3" />}
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-[var(--qz-text)]">{value}</p>
    </div>
  );
}
