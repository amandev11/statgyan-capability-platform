import { AiLabel, GlassCard, PageHeader } from "@/components/statgyan/ui-bits";
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
import { Switch } from "@/components/ui/switch";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { ai } from "@/lib/statgyan/ai";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { BloomLevel, Difficulty, QuestionType, QuizConfig } from "@/lib/statgyan/types";

const TYPES: QuestionType[] = [
  "MCQ",
  "True/False",
  "Scenario-based",
  "Assertion/Reason",
  "Case-based",
  "Numerical",
  "Conceptual",
];

export default function QuizLab() {
  const { materials, saveQuiz, quizzes, pushInsight } = useStatgyan();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const analyzed = materials.filter((m) => m.status === "analyzed");

  const [config, setConfig] = useState<QuizConfig>({
    numQuestions: 10,
    difficulty: "Adaptive",
    topic: "all",
    types: ["MCQ", "Scenario-based", "True/False"],
    bloom: "Mixed",
  });
  const [sourceMaterialId, setSourceMaterialId] = useState<string | undefined>(
    analyzed[analyzed.length - 1]?.id,
  );
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    const material = analyzed.find((m) => m.id === sourceMaterialId) ?? null;
    setTimeout(() => {
      const quiz = ai.generateQuiz({ ...config, sourceMaterialId }, material);
      saveQuiz(quiz);
      pushInsight({
        kind: "insight",
        title: "AI Insight",
        body: `Generated "${quiz.title}" with ${quiz.questions.length} grounded questions${
          material ? ` from "${material.name}"` : ""
        }. Every question carries its source reference and the competency it tests.`,
      });
      setGenerating(false);
      navigate(`/dashboard/assessments?quiz=${quiz.id}`);
    }, 1400);
  };

  // Demo-mode: ?autogen=1 or ?material=<id> triggers generation immediately
  useEffect(() => {
    const matId = params.get("material");
    const autogen = params.get("autogen") === "1";
    if (matId) setSourceMaterialId(matId);
    if (autogen || (matId && analyzed.some((m) => m.id === matId))) {
      const material = analyzed.find((m) => m.id === (matId ?? analyzed[analyzed.length - 1]?.id)) ?? null;
      setGenerating(true);
      const t = setTimeout(() => {
        const quiz = ai.generateQuiz(
          { ...config, sourceMaterialId: material?.id },
          material,
        );
        saveQuiz(quiz);
        setGenerating(false);
        navigate(`/dashboard/assessments?quiz=${quiz.id}`);
      }, 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleType = (t: QuestionType) => {
    setConfig((c) => ({
      ...c,
      types: c.types.includes(t)
        ? c.types.length > 1
          ? c.types.filter((x) => x !== t)
          : c.types
        : [...c.types, t],
    }));
  };

  const source = analyzed.find((m) => m.id === sourceMaterialId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Quiz Lab"
        title="Generate a professional assessment"
        subtitle="Configure the blueprint — the AI generates grounded questions with explanations, source references and competency tags. Adaptive mode adjusts difficulty to the learner's live performance."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="space-y-5 p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Number of questions
              </Label>
              <div className="mt-3 flex items-center gap-3">
                <Slider
                  value={[config.numQuestions]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([v]) => setConfig((c) => ({ ...c, numQuestions: v }))}
                  aria-label="Number of questions"
                />
                <span className="w-8 text-right text-sm font-bold tabular-nums">{config.numQuestions}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</Label>
              <Select
                value={config.difficulty}
                onValueChange={(v) => setConfig((c) => ({ ...c, difficulty: v as Difficulty | "Adaptive" }))}
              >
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Adaptive", "Easy", "Medium", "Hard", "Expert"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic / competency</Label>
              <Select value={config.topic} onValueChange={(v) => setConfig((c) => ({ ...c, topic: v }))}>
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mixed competencies</SelectItem>
                  {Object.values(COMPETENCY_MAP).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bloom's level</Label>
              <Select
                value={config.bloom}
                onValueChange={(v) => setConfig((c) => ({ ...c, bloom: v as BloomLevel | "Mixed" }))}
              >
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Mixed", "Remember", "Understand", "Apply", "Analyze", "Evaluate"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Question types
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  aria-pressed={config.types.includes(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    config.types.includes(t)
                      ? "border-indigo-300 bg-indigo-100/80 text-indigo-800"
                      : "border-slate-200 bg-white/60 text-slate-500 hover:bg-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/50 p-3.5">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" /> Ground in uploaded material
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {source
                  ? `Source: ${source.name} — questions cite the passages they were generated from`
                  : "No analyzed material selected — questions will come from the curated bank"}
              </p>
            </div>
            <Switch
              checked={!!sourceMaterialId}
              onCheckedChange={(v) => setSourceMaterialId(v ? analyzed[analyzed.length - 1]?.id : undefined)}
              aria-label="Ground quiz in uploaded material"
            />
          </div>

          {analyzed.length > 0 && sourceMaterialId && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source material</Label>
              <Select value={sourceMaterialId} onValueChange={setSourceMaterialId}>
                <SelectTrigger className="mt-2 bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {analyzed.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={generate} disabled={generating} size="lg" className="w-full gap-2">
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating grounded questions…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate AI Assessment
              </>
            )}
          </Button>
        </GlassCard>

        {/* Recent quizzes + explainer */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold">How grounding works</h2>
            <ol className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li><b className="text-slate-700">1.</b> Uploaded material is parsed into topics and mapped to competencies.</li>
              <li><b className="text-slate-700">2.</b> Questions are selected from the blueprint and re-anchored to the document.</li>
              <li><b className="text-slate-700">3.</b> Each item carries: source reference, competency tested, difficulty, Bloom level and learning objective.</li>
              <li><b className="text-slate-700">4.</b> Adaptive mode escalates difficulty after correct streaks and eases after misses.</li>
            </ol>
            <AiLabel>No hallucinated sources — references are shown to learners</AiLabel>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold">Recent generations</h2>
            {quizzes.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Nothing generated yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {quizzes.slice(0, 5).map((q) => (
                  <li key={q.id}>
                    <button
                      onClick={() => navigate(`/dashboard/assessments?quiz=${q.id}`)}
                      className="glass-subtle glass-hover w-full rounded-lg p-2.5 text-left"
                    >
                      <span className="block truncate text-sm font-medium">{q.title}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {q.questions.length} questions · {new Date(q.createdAt).toLocaleTimeString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>

      {generating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground">
          Mapping blueprint → drafting items → verifying against source passages…
        </motion.div>
      )}
    </div>
  );
}
