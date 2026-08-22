import { GlassCard, PageHeader } from "@/components/statgyan/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, FileCheck2, Fingerprint, GitBranch, Lock, ShieldCheck, Users2 } from "lucide-react";
import { Link } from "react-router";

const LAYERS = [
  { name: "Learner / Officer", detail: "Role-aware experience: profile, assessments, tutor, learning path" },
  { name: "Assessment Engine", detail: "Adaptive item selection · confidence capture · timing telemetry" },
  { name: "Competency AI", detail: "Evidence fusion → competency scores with confidence intervals" },
  { name: "Skill Gap Engine", detail: "Priority Score = gap × role relevance × importance × confidence × org priority" },
  { name: "AI Content Engine", detail: "Document understanding · competency mapping · grounded quiz generation" },
  { name: "Recommendation Engine", detail: "Semantic competency→course matching · learning path sequencing" },
  { name: "iGOT Adapter", detail: "Catalogue adapter + deep-link placeholders; swap in the live API without UI changes" },
];

const RESPONSIBLE = [
  { icon: FileCheck2, title: "AI-generated content labelling", body: "Every AI output in the product carries an explicit label. Learners always know what was machine-generated." },
  { icon: Eye, title: "Source grounding & traceability", body: "Generated questions cite the exact material and passage family they were produced from. Recommendations cite the evidence behind them." },
  { icon: GitBranch, title: "Explainable recommendations", body: "The Priority Score model is published in-product with its exact weights — no black-box rankings." },
  { icon: Users2, title: "Human oversight", body: "Validation flags are adjudicated by humans; automation scales detection, people make decisions." },
  { icon: Lock, title: "Privacy by design", body: "No respondent or personal microdata is processed. The demo runs on synthetic seed data stored locally." },
  { icon: ShieldCheck, title: "No fabricated integrations", body: "The iGOT catalogue is clearly marked as demo data behind an adapter until real API credentials exist." },
  { icon: Fingerprint, title: "Auditability & role-based access", body: "Score changes keep an evidence trail (assessments, courses). Manager views are role-scoped." },
  { icon: Lock, title: "Secure boundaries", body: "File uploads are size- and MIME-validated; secrets stay server-side via environment variables." },
];

export default function Architecture() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5 text-muted-foreground">
        <Link to="/"><ArrowLeft className="size-4" /> Back to home</Link>
      </Button>
      <PageHeader
        eyebrow="Transparency"
        title="System Architecture & Responsible AI"
        subtitle="How STATGYAN AI is put together — and the commitments that make it fit for a government-facing platform."
      />

      {/* Layer stack */}
      <GlassCard className="mt-8 p-5">
        <h2 className="text-sm font-semibold">Platform layers</h2>
        <ol className="mt-4 space-y-2">
          {LAYERS.map((l, i) => (
            <li key={l.name} className="glass-subtle relative rounded-lg p-3.5 pl-12">
              <span className="absolute left-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm font-semibold">{l.name}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{l.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl border border-white/70 bg-white/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <b className="text-slate-700">Modularity:</b> every AI capability sits behind the{" "}
          <code className="rounded bg-slate-900/5 px-1 py-0.5 font-mono text-[11px]">AIService</code>{" "}
          interface (<code className="rounded bg-slate-900/5 px-1 py-0.5 font-mono text-[11px]">generateQuiz</code>,{" "}
          <code className="rounded bg-slate-900/5 px-1 py-0.5 font-mono text-[11px]">analyzeDocument</code>,{" "}
          <code className="rounded bg-slate-900/5 px-1 py-0.5 font-mono text-[11px]">detectSkillGaps</code>, …).
          Today it is served by a deterministic, fully client-side provider; connecting a hosted LLM
          or iGOT API means implementing one adapter — no UI changes.
        </div>
      </GlassCard>

      {/* Responsible AI */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {RESPONSIBLE.map((r) => (
          <GlassCard key={r.title} className="p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-emerald-100/80 p-1.5 text-emerald-700"><r.icon className="size-4" /></span>
              <div>
                <h3 className="text-sm font-semibold">{r.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="bg-white/60">Demonstration build</Badge>
        <Badge variant="outline" className="bg-white/60">Synthetic data only</Badge>
        <Badge variant="outline" className="bg-white/60">Adapter-ready integrations</Badge>
      </div>
    </div>
  );
}
