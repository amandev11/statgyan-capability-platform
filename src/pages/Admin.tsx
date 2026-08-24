import { PageContainer, SectionHeader } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { DOMAINS } from "@/lib/statgyan/engine";
import { ORG_DEMO, ORG_NOTE } from "@/lib/statgyan/igot";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

function heatClass(score: number): string {
  if (score >= 70) return "bg-emerald-400/[0.16] text-emerald-200";
  if (score >= 55) return "bg-amber-300/[0.14] text-amber-100";
  return "bg-rose-400/[0.16] text-rose-200";
}

export default function Admin() {
  const [selected, setSelected] = useState<string | null>(null);

  // AI provider status — names/models only; keys never leave the server.
  const checkAiStatus = useAction(api.ai.aiStatus);
  const [ai, setAi] = useState<{
    documentProvider: string | null;
    generationProvider: string | null;
    providers: { gemini: string | null; openrouter: string | null };
  } | null>(null);
  useEffect(() => {
    let live = true;
    void checkAiStatus()
      .then((s) => live && setAi({ documentProvider: s.documentProvider ?? null, generationProvider: s.generationProvider ?? null, providers: s.providers }))
      .catch(() => live && setAi(null));
    return () => {
      live = false;
    };
  }, [checkAiStatus]);

  const totals = useMemo(() => {
    const learners = ORG_DEMO.reduce((s, d) => s + d.headcount, 0);
    const avgByDomain = Object.fromEntries(
      DOMAINS.map((d) => [
        d.id,
        Math.round(
          ORG_DEMO.reduce((s, dept) => s + dept.scores[d.id] * dept.headcount, 0) / learners,
        ),
      ]),
    );
    const weakest = Object.entries(avgByDomain).sort((a, b) => a[1] - b[1]).slice(0, 3);
    const strongest = Object.entries(avgByDomain).sort((a, b) => b[1] - a[1])[0];
    const orgAvg = Math.round(
      Object.values(avgByDomain).reduce((s, v) => s + v, 0) / DOMAINS.length,
    );
    const completion = Math.round(
      ORG_DEMO.reduce((s, d) => s + d.completionPct * d.headcount, 0) / learners,
    );
    const priority = [...ORG_DEMO].sort((a, b) => a.scores["data-quality"] - b.scores["data-quality"])[0];
    return { learners, avgByDomain, weakest, strongest, orgAvg, completion, priority };
  }, []);

  const dept = selected ? ORG_DEMO.find((x) => x.name === selected) : null;

  return (
    <PageContainer width="wide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="eyebrow mb-2">Capability Command Center</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Organisational competency
          </h1>
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-qz">
            <span className="mt-[5px] size-1 shrink-0 rounded-full bg-amber-300" />
            {ORG_NOTE}
          </p>
        </div>
        <span className="rounded-full border border-amber-300/30 bg-amber-400/[0.08] px-3 py-1 text-[11px] font-medium text-amber-200">
          Demonstration data
        </span>
      </div>

      {/* -------------------------------------------------------------- KPIs */}
      <section className="edge-glow mt-8 grid grid-cols-2 gap-x-6 gap-y-8 rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-7 sm:grid-cols-4" aria-label="Organisation KPIs">
        <Kpi label="Learners" value={totals.learners.toLocaleString()} />
        <Kpi label="Avg competency" value={`${totals.orgAvg}%`} />
        <Kpi label="Learning completion" value={`${totals.completion}%`} />
        <Kpi label="Critical-gap domains" value={String(totals.weakest.length)} />
      </section>

      {/* -------------------------------------------------- AI engine status */}
      <section className="edge-glow mt-4 rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-5" aria-label="AI provider status">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs">
          <p className="eyebrow">AI intelligence layer</p>
          <StatusRow label="Document understanding" value={ai?.documentProvider ?? "checking…"} />
          <StatusRow label="Generation provider" value={ai?.generationProvider ?? "checking…"} />
          <StatusRow
            label="Fallback"
            value="StatGyan local engine"
            muted={ai !== null}
          />
          <span className="ml-auto text-[10px] text-muted-qz">
            Keys are server-side only — never exposed to the browser.
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ Heatmap */}
      <section className="mt-12">
        <SectionHeader eyebrow="Heatmap" title="Departments × competencies" />
        <div className="edge-glow overflow-x-auto rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5">
          <table className="w-full min-w-[760px] border-separate border-spacing-[3px] text-left">
            <thead>
              <tr>
                <th className="pb-2 pl-2 pr-4 text-xs font-medium text-muted-qz">Department</th>
                {DOMAINS.map((d) => (
                  <th key={d.id} className="px-2 pb-2 text-center text-[10px] font-medium leading-tight text-muted-qz">
                    {d.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORG_DEMO.map((row) => (
                <tr key={row.name}>
                  <td className="max-w-44 truncate py-1 pl-2 pr-4 text-[13px] font-medium">{row.name}</td>
                  {DOMAINS.map((d) => {
                    const score = row.scores[d.id];
                    const active = selected === row.name;
                    return (
                      <td key={d.id} className="p-0">
                        <button
                          onClick={() => setSelected(active ? null : row.name)}
                          aria-label={`${row.name}, ${d.name}: ${score}`}
                          aria-pressed={active}
                          title={`${row.name} · ${d.name}: ${score}`}
                          className={cn(
                            "num h-9 w-full rounded-md text-center text-[11px] font-semibold transition-transform duration-150 hover:scale-[1.06]",
                            heatClass(score),
                            active && "ring-2 ring-[var(--qz-accent)]",
                          )}
                        >
                          {score}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-4 pl-2 text-[10px] text-muted-qz">
            <Legend cls="bg-emerald-400/[0.25]" label="Strong ≥70" />
            <Legend cls="bg-amber-300/[0.22]" label="Developing 55–69" />
            <Legend cls="bg-rose-400/[0.25]" label="Critical <55" />
            <span className="ml-auto hidden sm:block">Click a row to drill down</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Drilldown */}
      {dept && (
        <section className="edge-glow mt-6 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6" aria-label={`Details for ${dept.name}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight">{dept.name}</h3>
            <span className="num text-xs text-muted-qz">
              {dept.headcount} learners · completion {dept.completionPct}%
            </span>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[...DOMAINS]
              .sort((a, b) => dept.scores[a.id] - dept.scores[b.id])
              .slice(0, 4)
              .map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] text-secondary">{d.name}</span>
                  <span className={cn("num shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold", heatClass(dept.scores[d.id]))}>
                    {dept.scores[d.id]}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t hairline-faint pt-4">
            <p className="text-[13px] text-secondary">
              <span className="font-medium text-[var(--qz-text)]">Recommended intervention: </span>
              {dept.recommendedTraining}
            </p>
            <span className="num rounded-lg border border-emerald-300/25 bg-emerald-400/[0.07] px-2.5 py-1 text-xs font-semibold text-emerald-300">
              Projected +{dept.projectedImprovement} pts
            </span>
          </div>
        </section>
      )}

      {/* --------------------------------------------------- Executive brief */}
      <section className="mt-12 pb-10">
        <SectionHeader eyebrow="AI executive brief" title="Where to invest next" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
            <p className="text-sm leading-relaxed text-secondary">
              “The organisation shows its strongest capability in{" "}
              <span className="font-medium text-[var(--qz-text)]">{totals.strongest[0].replace("-", " ")}</span>{" "}
              ({totals.strongest[1]}%). The largest systemic gaps are{" "}
              {totals.weakest.map(([k, v]) => (
                <span key={k} className="whitespace-nowrap">
                  <span className="font-medium text-[var(--qz-text)]">{k.replace("-", " ")}</span> ({v}%)
                  {"; "}
                </span>
              ))}
              the highest-leverage intervention is{" "}
              <span className="font-medium text-[var(--qz-text)]">{totals.priority.recommendedTraining.toLowerCase()}</span>{" "}
              for {totals.priority.name} — projected to lift the organisational average by ~
              {totals.priority.projectedImprovement} points this quarter.”
            </p>
            <p className="eyebrow mt-4">Heuristic analysis of demonstration data</p>
          </div>
          <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
            <p className="eyebrow mb-3">Domain averages</p>
            <div className="space-y-2.5">
              {DOMAINS.map((d) => (
                <div key={d.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-secondary">{d.name}</span>
                    <span className="num font-medium">{totals.avgByDomain[d.id]}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className={cn("h-full rounded-full", totals.avgByDomain[d.id] >= 70 ? "bg-emerald-400/80" : totals.avgByDomain[d.id] >= 55 ? "bg-amber-300/80" : "bg-rose-400/80")}
                      style={{ width: `${totals.avgByDomain[d.id]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/leaderboard" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--qz-accent)] transition-opacity hover:opacity-80">
              View learner leaderboard →
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

function StatusRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-muted-qz">{label}:</span>
      <span className={cn("num font-medium", muted ? "text-muted-qz" : value === "checking…" ? "text-muted-qz" : "text-secondary")}>
        {value}
      </span>
    </span>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="num text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-qz">{label}</p>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", cls)} /> {label}
    </span>
  );
}
