import { GlassCard, InsightCard, PageHeader, PriorityBadge, ScoreBar, StatTile } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { COMPETENCY_MAP, ROLE_MAP } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import { proficiencyLevel } from "@/lib/statgyan/data";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  Flame,
  Route as RouteIcon,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

const SHORT: Record<string, string> = {
  "sf-desc": "Descriptive Stats",
  "sf-samp": "Sampling",
  "sf-inf": "Inference",
  "sm-design": "Survey Design",
  "sm-nonresp": "Non-Response",
  "sm-field": "Field Ops",
  "dm-clean": "Cleaning",
  "dm-valid": "Validation",
  "dm-quality": "Data Quality",
  "de-python": "Python",
  "da-viz": "Visualization",
  "os-standards": "Standards",
};

export default function Overview() {
  const { profile, competencies, skillGaps, courseMatches, learningPath, attempts, insights, roleTitle } =
    useStatgyan();
  const role = ROLE_MAP[profile.role];
  const critical = skillGaps.filter((g) => g.gap > 10).slice(0, 4);
  const prevScore = Math.max(
    ...competencies.map((c) => c.history[0]?.score ?? c.score),
    profile.capabilityScore - 8,
  );
  const monthGain = profile.capabilityScore - prevScore > 0 ? 8 : 3;

  const radarData = competencies.map((lc) => ({
    subject: SHORT[lc.competencyId] ?? lc.competencyId,
    current: lc.score,
    target: lc.target,
  }));

  const summary = `You demonstrate strong statistical foundations (${proficiencyLevel(
    competencies.find((c) => c.competencyId === "sf-desc")?.score ?? 70,
  )} in Descriptive Statistics, ${competencies.find((c) => c.competencyId === "sm-field")?.score ?? 80}% in Field Operations) but have emerging proficiency in data quality and Python automation. Your highest-impact next step is ${critical[0] ? COMPETENCY_MAP[critical[0].competencyId].name : "Data Validation"}, followed by ${critical[1] ? COMPETENCY_MAP[critical[1].competencyId].name.toLowerCase() : "Python-based workflow automation"}.`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capability Overview"
        title={`Good morning, ${profile.name.split(" ")[0]}.`}
        subtitle={`${roleTitle} · ${role.domain} · Your capability journey is progressing.`}
        actions={
          <Button asChild className="gap-2">
            <Link to="/dashboard/assessments">
              <Activity className="size-4" /> Take a diagnostic
            </Link>
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Overall Competency"
          value={`${profile.capabilityScore}%`}
          sub={`↑ ${monthGain}% this month · AI-computed`}
          icon={<TrendingUp className="size-4" />}
        />
        <StatTile
          label="Critical Gaps"
          value={String(skillGaps.filter((g) => g.priority === "CRITICAL").length)}
          sub={`${skillGaps.filter((g) => g.priority === "HIGH").length} high-priority areas`}
          icon={<Target className="size-4" />}
        />
        <StatTile
          label="Learning Streak"
          value={`${profile.streakDays} days`}
          sub={`${profile.completedCourses.length} courses completed`}
          icon={<Flame className="size-4" />}
        />
        <StatTile
          label="Assessments"
          value={String(attempts.length)}
          sub={attempts[0] ? `Last: ${Math.round(attempts[0].score)}%` : "No attempts yet"}
          icon={<CalendarCheck className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Radar */}
        <GlassCard className="p-5 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Competency Radar</h2>
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-indigo-500 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-slate-300 inline-block" /> Role target</span>
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#94a3b855" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#475569" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                    fontSize: 12,
                  }}
                />
                <Radar name="Role target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeDasharray="4 3" />
                <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Critical gaps + AI summary */}
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold">Critical Gaps</h2>
            <ul className="mt-3 space-y-3">
              {critical.length === 0 && (
                <li className="text-sm text-muted-foreground">No significant gaps — well done.</li>
              )}
              {critical.map((g) => (
                <li key={g.competencyId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{COMPETENCY_MAP[g.competencyId].name}</span>
                    <span className="text-xs tabular-nums text-rose-600">{g.gap} pts below target</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <ScoreBar value={g.current} className="flex-1" />
                    <span className="w-9 text-right text-xs font-semibold tabular-nums">{g.current}%</span>
                    <PriorityBadge priority={g.priority} />
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-3 gap-1 px-2 text-primary">
              <Link to="/dashboard/gaps">
                View full analysis <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </GlassCard>

          <InsightCard kind="insight" title="AI Competency Summary" body={summary} />
        </div>
      </div>

      {/* Recommended learning + recent assessments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recommended Next Steps</h2>
            <RouteIcon className="size-4 text-primary/70" />
          </div>
          <ol className="space-y-2.5">
            {learningPath.slice(0, 4).map((m) => (
              <li key={m.id} className="glass-subtle flex items-center justify-between rounded-lg p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.minutes} min · expected +{m.expectedImprovement} pts
                  </p>
                </div>
                <PriorityBadge priority={m.priority} />
              </li>
            ))}
          </ol>
          <Button asChild variant="ghost" size="sm" className="mt-3 gap-1 px-2 text-primary">
            <Link to="/dashboard/path">Open learning path <ArrowUpRight className="size-3.5" /></Link>
          </Button>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold">Recent Assessments</h2>
            {attempts.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No assessments yet. A diagnostic will establish your baseline evidence.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {attempts.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate pr-2 font-medium">{a.quizTitle}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {a.correctCount}/{a.totalQuestions} · {Math.round(a.score)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 gap-1 px-2 text-primary">
              <Link to="/dashboard/assessments">All assessments <ArrowUpRight className="size-3.5" /></Link>
            </Button>
          </GlassCard>

          {courseMatches[0] && (
            <InsightCard
              kind="recommendation"
              body={`Completing "${courseMatches[0].course.title}" could address ${courseMatches[0].skillCoverage}% of your identified gap mass (match score ${courseMatches[0].matchScore}%).`}
              action={
                <Button asChild size="sm" variant="secondary" className="gap-1.5">
                  <Link to="/dashboard/igot">
                    <BookOpenCheck className="size-3.5" /> View on iGOT Connect
                  </Link>
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Insight feed */}
      {insights.length > 0 && (
        <section aria-label="AI insight feed" className="grid gap-3 md:grid-cols-2">
          {insights.slice(0, 4).map((i) => (
            <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />
          ))}
        </section>
      )}
    </div>
  );
}
