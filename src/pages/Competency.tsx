import {
  PageContainer,
  SectionHeader,
  SkeletonBlock,
} from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { analyseGaps, DOMAINS } from "@/lib/statgyan/engine";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router";

function band(score: number, target: number) {
  if (score >= target - 5) return { label: "Strong", cls: "text-emerald-300", bar: "bg-emerald-400/80" };
  if (score >= target - 18) return { label: "Developing", cls: "text-amber-200", bar: "bg-amber-300/80" };
  return { label: "Needs attention", cls: "text-rose-300", bar: "bg-rose-400/80" };
}

const SEVERITY_CLS: Record<string, string> = {
  Critical: "border-rose-300/30 bg-rose-400/[0.09] text-rose-300",
  High: "border-amber-300/30 bg-amber-400/[0.08] text-amber-200",
  Moderate: "border-[var(--qz-accent)]/30 bg-[var(--qz-accent)]/[0.09] text-[var(--qz-accent)]",
};

export default function Competency() {
  const profile = useQuery(api.quiza.myProfile);
  const attempts = useQuery(api.quiza.myAttempts);

  if (profile === undefined) {
    return (
      <PageContainer width="default">
        <SkeletonBlock className="h-8 w-56" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <SkeletonBlock className="h-80 rounded-2xl" />
          <SkeletonBlock className="h-80 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }
  if (!profile?.onboarded) {
    return (
      <PageContainer width="narrow" className="pt-24 text-center">
        <h1 className="text-lg font-semibold">No competency profile yet</h1>
        <Link to="/onboarding" className="btn-specular mt-6 inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold">
          Build your profile
        </Link>
      </PageContainer>
    );
  }

  const gaps = analyseGaps(profile.competencies, {
    primaryDomain: profile.primaryDomain,
    secondaryDomains: profile.secondaryDomains,
  });
  const significant = gaps.filter((g) => g.gap >= 6);
  const overall = Math.round(
    profile.competencies.reduce((s, c) => s + c.score, 0) / Math.max(profile.competencies.length, 1),
  );
  const shortfalls = significant.reduce((s, g) => s + g.gap, 0);
  const radarData = DOMAINS.map((d) => {
    const comp = profile.competencies.find((c) => c.id === d.id);
    return { domain: d.name.split(" ")[0], score: comp?.score ?? 0, target: comp?.target ?? 80 };
  });

  const top = significant[0];

  return (
    <PageContainer width="wide">
      {/* --------------------------------------------------------- Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <p className="eyebrow">Competency profile · {profile.roleTitle}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Statistical capability map
        </h1>
        <p className="num mt-2 text-sm text-secondary">
          Overall readiness{" "}
          <span className="font-semibold text-[var(--qz-text)]">{overall}%</span> ·{" "}
          {significant.length} open gap{significant.length === 1 ? "" : "s"} totalling{" "}
          <span className="font-semibold text-rose-300">{shortfalls} points</span>
        </p>
        {attempts !== undefined && attempts.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-qz">
            <History className="size-3" />
            Trend computed from <span className="num font-medium text-secondary">{attempts.length}</span> completed assessment{attempts.length === 1 ? "" : "s"} — every round refines this map.
          </p>
        )}
      </motion.div>

      {/* --------------------------------------------------- Map + bars */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.25fr]"
      >
        {/* Radar */}
        <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6" aria-label="Competency radar chart">
          <p className="eyebrow mb-4">Capability radar</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: "#68717d", fontSize: 10 }}
                />
                <Radar name="Target" dataKey="target" stroke="rgba(255,255,255,0.25)" fill="rgba(255,255,255,0.05)" fillOpacity={0.3} strokeDasharray="4 4" />
                <Radar
                  name="You"
                  dataKey="score"
                  stroke="#6c8cff"
                  fill="#6c8cff"
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    background: "#151a21",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-[11px] text-muted-qz">
            Solid ring: you · dashed: role target
          </p>
        </div>

        {/* Bars */}
        <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
          <p className="eyebrow mb-5">Dimension detail</p>
          <div className="space-y-4">
            {profile.competencies.map((c) => {
              const meta = DOMAINS.find((d) => d.id === c.id);
              const b = band(c.score, c.target);
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium">{meta?.name ?? c.id}</span>
                    <span className="num flex items-baseline gap-2 text-xs text-muted-qz">
                      <span className={`text-sm font-semibold ${b.cls}`}>{c.score}%</span>
                      / {c.target}%
                      <span className={`ml-1 text-[10px] font-medium ${b.cls}`}>{b.label}</span>
                    </span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.07]" role="img" aria-label={`${meta?.name}: ${c.score} of target ${c.target}`}>
                    <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${Math.min(100, c.score)}%` }} />
                    {/* target marker */}
                    <span className="absolute top-[-3px] h-[calc(100%+6px)] w-px bg-white/40" style={{ left: `${Math.min(100, c.target)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ------------------------------------------------------ Gap report */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="mt-12 pb-10"
      >
        <SectionHeader eyebrow="AI analysis" title="Competency gap report" />

        {top ? (
          <div className="edge-glow mb-4 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
            <p className="text-sm leading-relaxed text-secondary">
              “Your profile shows strong capability in{" "}
              {[...gaps].reverse().find((g) => g.gap <= 0)?.name.toLowerCase() ?? "several dimensions"}
              , but a measurable gap in{" "}
              <span className="font-medium text-[var(--qz-text)]">{top.name.toLowerCase()}</span>
              {" "}— {top.reasoning.split(";")[1]?.trim().replace(/\.$/, "") ?? `currently ${top.current}% against a ${top.target}% standard`}.
              {" "}Closing it is the highest-leverage move for a {(profile.roleTitle ?? "statistical officer").toLowerCase()}.”
            </p>
            <p className="eyebrow mt-3">StatGyan gap engine · heuristic analysis of your assessment evidence</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {significant.length === 0 ? (
            <div className="rounded-2xl border hairline-faint border-dashed px-6 py-14 text-center">
              <p className="text-sm font-medium text-secondary">No significant gaps detected.</p>
              <p className="mt-1 text-xs text-muted-qz">Take another assessment to keep the evidence current.</p>
            </div>
          ) : (
            significant.map((gap) => (
              <details key={gap.id} className="edge-glow group rounded-xl border hairline bg-[var(--qz-surface-1)] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center gap-4 p-5">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${SEVERITY_CLS[gap.severity] ?? SEVERITY_CLS.Moderate}`}>
                    {gap.severity}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{gap.name}</span>
                  <span className="num hidden text-xs text-muted-qz sm:block">
                    current {gap.current} · target {gap.target}
                  </span>
                  <span className="num text-sm font-semibold text-rose-300">−{gap.gap}</span>
                </summary>
                <div className="border-t hairline-faint px-5 pb-5 pt-4">
                  <p className="text-[13px] leading-relaxed text-secondary">
                    <span className="font-medium text-[var(--qz-text)]">Why it matters: </span>
                    {gap.reasoning}
                  </p>
                  <div className="mt-4">
                    <p className="eyebrow mb-2">Recommended action</p>
                    <ol className="space-y-1.5 text-[13px]">
                      <li className="flex gap-2 text-secondary"><span className="num text-muted-qz">01</span><Link to="/learning" className="hover:text-[var(--qz-accent)]">{gap.name} learning module — see your learning path</Link></li>
                      <li className="flex gap-2 text-secondary"><span className="num text-muted-qz">02</span><Link to="/igot" className="hover:text-[var(--qz-accent)]">Matching iGOT Karmayogi course</Link></li>
                      <li className="flex gap-2 text-secondary"><span className="num text-muted-qz">03</span><Link to="/assess" className="hover:text-[var(--qz-accent)]">Practice assessment in this domain</Link></li>
                    </ol>
                  </div>
                </div>
              </details>
            ))
          )}
        </div>
      </motion.section>
    </PageContainer>
  );
}
