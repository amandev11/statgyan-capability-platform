import { AiLabel, GlassCard, PageHeader, StatTile, heatColor } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { COURSES, DEPARTMENTS, METRIC_KEYS, ORG_METRICS } from "@/lib/statgyan/data";
import { ai } from "@/lib/statgyan/ai";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Building2, ChevronRight, FlaskConical, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

export default function Admin() {
  const [params] = useSearchParams();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(
    params.get("answer") === "1" ? params.get("q") : null,
  );

  // What-if simulator state
  const [courseTitle, setCourseTitle] = useState(COURSES[2].title);
  const [employees, setEmployees] = useState(250);
  const [metricKey, setMetricKey] = useState("Data Quality");
  const [sim, setSim] = useState<(ReturnType<typeof ai.simulateTraining> & { current: number }) | null>(null);
  const [running, setRunning] = useState(false);

  const focusDept = DEPARTMENTS.find((d) => d.department === selectedDept) ?? null;

  const brief = useMemo(() => ai.executiveBrief(ORG_METRICS), []);

  const answerFor = (q: string): string => {
    const s = q.toLowerCase();
    if (s.includes("weakest") || s.includes("biggest gap") || s.includes("biggest capability"))
      return `The weakest competencies organisation-wide are Python (${Math.round(DEPARTMENTS.reduce((a, d) => a + d.scores["Python"], 0) / DEPARTMENTS.length)}% avg), AI/ML and Data Quality. Field Operations Wing shows the deepest single gaps (Python 24%, AI/ML 22%), affecting ~470 of its 486 staff.`;
    if (s.includes("department") && (s.includes("train") || s.includes("need")))
      return `Field Operations Wing needs training most urgently: average competency ${DEPARTMENTS.find((d) => d.department === "Field Operations Wing")?.avgCompetency}% vs an organisational mean of ${ORG_METRICS.avgCompetency}%, completion rate just 36%, and three critical-gap areas. Recommended first intervention: "${DEPARTMENTS.find((d) => d.department === "Field Operations Wing")?.recommendedTraining}".`;
    if (s.includes("employee") && s.includes("learn next"))
      return `For the reference learner (Ananya Sharma, Statistical Investigator): the highest-impact next step is Data Validation, followed by Non-Response Handling — see her Skill Gaps page for the full priority-ranked list.`;
    if (s.includes("data quality") || s.includes("why is"))
      return `Data Quality is a priority because it carries the highest organizational importance weight (95%), sits 39 points below target for Survey & Data Operations staff, and directly gates release credibility under GSAM-aligned quality gates.`;
    if (s.includes("improvement"))
      return `The biggest improvement this month: Data Processing Division (+8 pts avg competency, 55% training completion). Individual leader: learners completing "Advanced Data Validation" gained on average +11 competency points per assessment cycle.`;
    if (s.includes("training plan") || s.includes("plan for survey officers"))
      return `Recommended plan for Survey Officers: (1) Reducing Non-Response in Household Surveys — 105 min; (2) Survey Sampling Techniques — 240 min; (3) Data Quality Management — 150 min. Projected divisional lift ≈ +12 pts over one quarter (AI estimate).`;
    return `Based on current evidence: strongest area is Official Statistics; largest gaps are Python, Data Quality and AI/ML across divisions. Priority intervention remains targeted Data Quality + digital-skills training in Survey & Data Operations and Field Operations Wing. Ask me about a specific department or competency for detail.`;
  };

  const runSimulation = () => {
    setRunning(true);
    setTimeout(() => {
      const currentAvg =
        DEPARTMENTS.reduce((s, d) => s + (d.scores[metricKey] ?? d.avgCompetency), 0) /
        DEPARTMENTS.length;
      setSim({ ...ai.simulateTraining(courseTitle, employees, metricKey, Math.round(currentAvg)), current: Math.round(currentAvg) });
      setRunning(false);
    }, 900);
  };

  // Auto-run once so judges see output immediately
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capability Command Center"
        title="Where should capability investment go?"
        subtitle={`Organisation-level view across ${ORG_METRICS.totalLearners.toLocaleString()} learners · demonstration data modelled on India's Official Statistical System.`}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Total Learners" value={ORG_METRICS.totalLearners.toLocaleString()} sub={`${DEPARTMENTS.length} divisions`} icon={<Building2 className="size-4" />} />
        <StatTile label="Avg Competency" value={`${ORG_METRICS.avgCompetency}%`} sub={`↑ ${ORG_METRICS.improvementRate}% / 30d`} />
        <StatTile label="Critical Gaps" value={`${ORG_METRICS.criticalGapPct}%`} sub="of role-competency pairs" />
        <StatTile label="Training Completion" value={`${ORG_METRICS.trainingCompletion}%`} sub="assigned courses finished" />
        <StatTile label="Improvement Rate" value={`+${ORG_METRICS.improvementRate}%`} sub="avg monthly gain" />
      </div>

      {/* Executive AI query answer */}
      <AnimatePresence>
        {query && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <BrainCircuit className="size-4" /> Executive AI Answer
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">“{query}”</p>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-800">{answerFor(query)}</p>
              <AiLabel>Generated from seeded demonstration data</AiLabel>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Executive brief */}
      <GlassCard className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <BrainCircuit className="size-4 text-primary" /> AI Executive Brief
        </h2>
        <p className="mt-2 max-w-4xl whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {brief.overview.replace(/\*\*/g, "")}
        </p>
        <ul className="mt-3 space-y-2">
          {brief.interventions.map((i) => (
            <li key={i.dept} className="glass-subtle flex flex-col gap-1 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <b className="text-sm">{i.dept}</b>
                <span className="block text-xs text-muted-foreground">{i.action}</span>
              </span>
              <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-700">{i.impact}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard className="overflow-x-auto p-5">
        <h2 className="text-sm font-semibold">Skill-Gap Heatmap</h2>
        <p className="text-xs text-muted-foreground">Click a division to inspect its gaps · hover cells for scores</p>
        <table className="mt-4 w-full min-w-[640px] border-separate border-spacing-1.5 text-sm">
          <thead>
            <tr>
              <th className="w-52 px-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Division</th>
              {METRIC_KEYS.map((k) => (
                <th key={k} className="px-2 pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((d) => (
              <tr
                key={d.department}
                onClick={() => setSelectedDept(selectedDept === d.department ? null : d.department)}
                className={cn(
                  "cursor-pointer transition",
                  selectedDept === d.department ? "opacity-100" : selectedDept ? "opacity-60 hover:opacity-90" : "hover:opacity-90",
                )}
                aria-pressed={selectedDept === d.department}
              >
                <td className="rounded-lg bg-white/60 px-3 py-2.5 font-medium">{d.department}</td>
                {METRIC_KEYS.map((k) => (
                  <td key={k} className="p-0">
                    <div
                      title={`${d.department} · ${k}: ${d.scores[k]}%`}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-lg font-semibold tabular-nums text-slate-800 shadow-sm transition-transform hover:scale-[1.04]",
                        heatColor(d.scores[k]),
                      )}
                    >
                      {d.scores[k]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dept drilldown */}
        <AnimatePresence>
          {focusDept && (
            <motion.div
              key={focusDept.department}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-3 rounded-xl border border-indigo-200/70 bg-indigo-50/50 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Top skill gaps · {focusDept.department}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {focusDept.topGaps.map((g) => (
                      <li key={g.area} className="flex items-center justify-between">
                        <span>{g.area}</span>
                        <span className="text-xs text-muted-foreground">severity {g.severity} · {g.affected} affected</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Recommended training</p>
                  <p className="mt-2 text-sm leading-relaxed">{focusDept.recommendedTraining}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{focusDept.headcount} employees · {focusDept.completionRate}% current completion</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Projected improvement</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-600">+{focusDept.projectedImprovement}<span className="text-base">pts</span></p>
                  <Button asChild size="sm" variant="secondary" className="mt-2 gap-1">
                    <a href="#simulator">Simulate this investment <ChevronRight className="size-3.5" /></a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Simulator */}
      <GlassCard className="scroll-mt-24 p-5" >
        <span id="simulator" />
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical className="size-4 text-violet-500" /> “What If We Train?” — AI Training Impact Simulator
        </h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Training program</Label>
              <Select value={courseTitle} onValueChange={setCourseTitle}>
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Competency targeted</Label>
              <Select value={metricKey} onValueChange={setMetricKey}>
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METRIC_KEYS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Employees trained — <b className="text-slate-800 tabular-nums">{employees}</b>
              </Label>
              <Slider
                className="mt-3"
                value={[employees]}
                min={25}
                max={1200}
                step={25}
                onValueChange={([v]) => setEmployees(v)}
                aria-label="Number of employees"
              />
            </div>
            <Button onClick={runSimulation} disabled={running} className="w-full gap-2">
              <FlaskConical className="size-4" /> {running ? "Simulating…" : "Run simulation"}
            </Button>
          </div>

          <div className="glass-subtle flex flex-col items-center justify-center rounded-xl p-6 text-center">
            <AnimatePresence mode="wait">
              {running || !sim ? (
                <motion.p key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted-foreground">
                  Modelling adoption, proficiency uplift and rollout decay…
                </motion.p>
              ) : (
                <motion.div key="out" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current avg ({metricKey})</p>
                      <p className="text-3xl font-bold tabular-nums">{sim.current}%</p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Projected</p>
                      <p className="text-3xl font-bold tabular-nums text-emerald-600">{sim.projected}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-violet-600">
                    Est. gap reduction {sim.gapReductionPct}% over {sim.months} months · {employees.toLocaleString()} employees
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-muted-foreground">{sim.narrative}</p>
                  <AiLabel>Simulation — not a guaranteed outcome</AiLabel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Projections are AI estimates produced by a transparent adoption model (uplift × completion × decay). They support planning conversations; they are not guarantees.
        </p>
      </GlassCard>
    </div>
  );
}
