import { GlassCard, PageHeader, ScoreBar } from "@/components/statgyan/ui-bits";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPETENCIES, COMPETENCY_MAP, proficiencyLevel } from "@/lib/statgyan/data";
import { useStatgyan } from "@/lib/statgyan/store";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Competencies() {
  const { competencies, profile, roleTitle } = useStatgyan();
  const [selected, setSelected] = useState(competencies[0]?.competencyId ?? "sf-desc");
  const lc = competencies.find((c) => c.competencyId === selected);
  const comp = COMPETENCY_MAP[selected];

  const historyData = (lc?.history ?? []).map((h) => ({
    label: h.label,
    score: h.score,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Competency Digital Twin"
        title="My Competencies"
        subtitle={`A live model of what you can do — ${roleTitle}, ${profile.experienceYears} years experience. Every score carries its evidence and an AI confidence level.`}
        actions={
          <Badge variant="outline" className="gap-1.5 border-emerald-300/60 bg-emerald-50/70 py-1 text-emerald-700">
            <ShieldCheck className="size-3.5" /> Capability Score {profile.capabilityScore}%
          </Badge>
        }
      />

      {/* All competencies grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {competencies.map((item) => {
          const c = COMPETENCY_MAP[item.competencyId];
          if (!c) return null;
          const gap = item.target - item.score;
          return (
            <button
              key={item.competencyId}
              onClick={() => setSelected(item.competencyId)}
              aria-pressed={selected === item.competencyId}
              className={`glass glass-hover rounded-xl p-4 text-left transition ${
                selected === item.competencyId ? "ring-2 ring-indigo-400" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.domain}</p>
                </div>
                <span className="text-lg font-bold tabular-nums">{item.score}%</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <ScoreBar value={item.score} className="flex-1" />
                <span className="text-[10px] tabular-nums text-muted-foreground">target {item.target}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">{proficiencyLevel(item.score)}</Badge>
                {gap <= 0 ? (
                  <span className="text-[10px] font-semibold text-emerald-600">✓ at/above target</span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-600">−{gap} to target</span>
                )}
                <span className="text-[10px] text-muted-foreground">confidence {item.confidence}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {lc && (
        <GlassCard className="p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="size-4 text-primary" /> {comp.name}
              </CardTitle>
              <CardDescription className="mt-1">{comp.description}</CardDescription>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="glass-subtle rounded-lg p-2.5">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</dt>
                  <dd className="text-xl font-bold tabular-nums">{lc.score}%</dd>
                  <dd className="text-[10px] text-muted-foreground">{proficiencyLevel(lc.score)}</dd>
                </div>
                <div className="glass-subtle rounded-lg p-2.5">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</dt>
                  <dd className="text-xl font-bold tabular-nums">{lc.target}%</dd>
                </div>
                <div className="glass-subtle rounded-lg p-2.5">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">AI confidence</dt>
                  <dd className="text-xl font-bold tabular-nums">{lc.confidence}%</dd>
                </div>
              </dl>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Evidence</h3>
              <ul className="mt-1.5 space-y-1.5">
                {lc.evidence.map((e, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Progression</h3>
              <div className="mt-2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid stroke="#94a3b833" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.92)",
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="h-8 w-56 text-xs" aria-label="Choose competency">
                    <SelectValue placeholder="Choose competency" />
                  </SelectTrigger>
                  <SelectContent>
                    {competencies.map((item) => (
                      <SelectItem key={item.competencyId} value={item.competencyId}>
                        {COMPETENCY_MAP[item.competencyId]?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>Assessment evidence updates this curve automatically</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Milestones */}
      <Card className="border-white/70 bg-white/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base">Competency Milestones</CardTitle>
          <CardDescription>Professional progression markers — mastery, not badges.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          {competencies.slice(0, 9).map((item) => {
            const c = COMPETENCY_MAP[item.competencyId];
            const lvl = proficiencyLevel(item.score);
            const mastered = item.score >= 85;
            return (
              <div key={item.competencyId} className="glass-subtle flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{c?.name}</span>
                <Badge variant={mastered ? "default" : "outline"} className="text-[10px]">
                  {lvl}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
