import { GlassCard, PageHeader, heatColor } from "@/components/statgyan/ui-bits";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.7)",
  background: "rgba(255,255,255,0.94)",
  fontSize: 12,
};

export default function Analytics() {
  const { competencies, attempts } = useStatgyan();

  const progression = ["Nov", "Jan", "Mar", "May"].map((label, i) => {
    const row: Record<string, string | number> = { label };
    for (const key of ["sf-samp", "dm-quality", "de-python"]) {
      const lc = competencies.find((c) => c.competencyId === key);
      const hist = lc?.history ?? [];
      row[COMPETENCY_MAP[key]?.name ?? key] =
        hist[i]?.score ?? lc?.score ?? 0;
    }
    return row;
  });

  const gapData = competencies
    .map((lc) => ({
      name: COMPETENCY_MAP[lc.competencyId]?.name ?? lc.competencyId,
      gap: Math.max(0, lc.target - lc.score),
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 6);

  const accuracyData = attempts.slice(0, 6).reverse().map((a, i) => ({
    label: `#${i + 1}`,
    accuracy: Math.round(a.score),
    confidence: a.confidenceAccuracy,
  }));

  const hoursData = [
    { month: "Jan", hours: 3.5 },
    { month: "Feb", hours: 5 },
    { month: "Mar", hours: 4.2 },
    { month: "Apr", hours: 6.8 },
    { month: "May", hours: 8.1 },
  ];

  const distribution = competencies.map((lc) => ({
    name: COMPETENCY_MAP[lc.competencyId]?.name ?? "",
    score: lc.score,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capability Analytics"
        title="Evidence, not vanity metrics"
        subtitle="Every chart is derived from assessments, learning activity and the competency model — hover any element for detail."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Competency Progression</h2>
          <p className="text-xs text-muted-foreground">Selected competencies over time</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progression}>
                <CartesianGrid stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Sampling" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Data Quality" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Python" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Top Competency Gaps</h2>
          <p className="text-xs text-muted-foreground">Points below role target</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="#94a3b833" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={110} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                <Bar dataKey="gap" radius={[0, 6, 6, 0]}>
                  {gapData.map((d) => (
                    <Cell key={d.name} fill={d.gap > 25 ? "#f43f5e" : d.gap > 15 ? "#f59e0b" : "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Accuracy vs Confidence</h2>
          <p className="text-xs text-muted-foreground">Divergence reveals knowledge vs confidence gaps</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="accuracy" name="Accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="confidence" name="Confidence accuracy" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">Learning Hours</h2>
          <p className="text-xs text-muted-foreground">Monthly learning investment</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} formatter={(v) => [`${v} hrs`, "Learning"]} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Skill distribution heat strip */}
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold">Skill Distribution</h2>
        <p className="text-xs text-muted-foreground">Current proficiency across your profile</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {distribution.map((d) => (
            <div key={d.name} className="glass-subtle rounded-lg p-2.5 text-center">
              <span className={`mx-auto mb-1.5 block h-1.5 w-10 rounded-full ${heatColor(d.score)}`} />
              <p className="truncate text-[11px] font-medium">{d.name}</p>
              <p className="text-sm font-bold tabular-nums">{d.score}%</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
