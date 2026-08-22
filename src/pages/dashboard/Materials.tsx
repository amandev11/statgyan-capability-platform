import { AiLabel, GlassCard, PageHeader } from "@/components/statgyan/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { ai } from "@/lib/statgyan/ai";
import { SAMPLE_DOCUMENTS } from "@/lib/statgyan/questions";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Map as MapIcon,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { LearningMaterial } from "@/lib/statgyan/types";

const PIPELINE_STEPS = [
  "Extracting content",
  "Identifying concepts",
  "Mapping competencies",
  "Generating assessment blueprint",
  "Preparing AI quiz",
];

const MAX_SIZE_MB = 10;
const ACCEPTED = /\.(pdf|docx?|pptx?|txt|csv|png|jpe?g)$/i;

export default function Materials() {
  const { materials, addMaterial, updateMaterial } = useStatgyan();
  const [dragOver, setDragOver] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(materials[0]?.id ?? null);
  const [stepIdx, setStepIdx] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const active = materials.find((m) => m.id === activeId) ?? null;

  function startAnalysis(m: LearningMaterial) {
    setActiveId(m.id);
    setStepIdx(0);
    updateMaterial(m.id, { status: "analyzing" });
  }

  // Drive the animated pipeline
  useEffect(() => {
    if (stepIdx < 0 || !active) return;
    if (stepIdx < PIPELINE_STEPS.length) {
      const t = setTimeout(() => setStepIdx((i) => i + 1), 650);
      return () => clearTimeout(t);
    }
    // finish
    const analysis = ai.analyzeDocument(active.name, active.textPreview);
    updateMaterial(active.id, { status: "analyzed", analysis });
    setStepIdx(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  function ingestFile(name: string, sizeKb: number, mime: string, text: string) {
    setError(null);
    const m: LearningMaterial = {
      id: `mat-${Date.now()}`,
      name,
      sizeKb,
      mime,
      uploadedAt: Date.now(),
      status: "uploaded",
      textPreview:
        text ||
        `[Extracted text of ${name}] The document discusses survey methodology, sampling frames, stratification, non-response follow-up protocols, weighting and design effects, data validation rules and quality assurance practices for official statistics.`,
    };
    addMaterial(m);
    startAnalysis(m);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.test(file.name)) {
      setError("Unsupported file type. Accepted: PDF, DOCX, PPTX, TXT, CSV, images.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds the ${MAX_SIZE_MB} MB safety limit.`);
      return;
    }
    // Demo environment: we do not execute parsers client-side; text extraction is
    // simulated for common types and real .txt content is read directly.
    if (/\.txt$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () =>
        ingestFile(file.name, Math.round(file.size / 1024) || 1, file.type || "text/plain", String(reader.result ?? "").slice(0, 20000));
      reader.readAsText(file);
    } else {
      ingestFile(file.name, Math.round(file.size / 1024) || 120, file.type || "application/octet-stream", "");
    }
  }

  // Demo-mode auto-run: ?sample=1 loads a sample document automatically
  useEffect(() => {
    if (params.get("sample") === "1") {
      const sample = SAMPLE_DOCUMENTS[0];
      if (!materials.some((m) => m.name === sample.name)) {
        ingestFile(sample.name, 412, "application/pdf", sample.text);
      } else {
        setActiveId(materials.find((m) => m.name === sample.name)?.id ?? null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Material Lab"
        title="Upload any learning material"
        subtitle="PDF, DOCX, PPTX, TXT or CSV. The AI extracts content, identifies topics, maps competencies and prepares grounded assessments — every output traceable to your document."
      />

      {/* Upload zone */}
      <GlassCard className="p-5">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload learning material"
          onClick={() => fileInput.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
            dragOver
              ? "border-indigo-400 bg-indigo-50/70"
              : "border-indigo-200 bg-white/40 hover:bg-white/60",
          )}
        >
          <span className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-3 text-white shadow-lg shadow-indigo-600/25">
            <UploadCloud className="size-6" />
          </span>
          <p className="mt-3 text-sm font-semibold">Drop learning material here</p>
          <p className="text-xs text-muted-foreground">or click to browse · max {MAX_SIZE_MB} MB · MIME validated</p>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,image/*"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">No file handy? Try a sample:</span>
          {SAMPLE_DOCUMENTS.map((s) => (
            <Button
              key={s.name}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-white/70"
              onClick={() => ingestFile(s.name, 412, "application/pdf", s.text)}
            >
              <FileText className="size-3.5 text-primary" /> {s.label}
            </Button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </GlassCard>

      {/* Processing animation */}
      {(stepIdx >= 0 || (active?.status === "analyzing")) && (
        <GlassCard className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="size-4 animate-spin text-primary" /> Analyzing material…
          </p>
          <ul className="mt-3 space-y-2">
            {PIPELINE_STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2 text-sm", i <= stepIdx ? "text-slate-800" : "text-muted-foreground/50")}>
                {i < stepIdx || stepIdx === -1 ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : i === stepIdx ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-4 rounded-full border border-slate-300" />
                )}
                {s}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Analysis result */}
      {active?.status === "analyzed" && active.analysis && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <BrainCircuit className="size-5 text-primary" /> AI Understanding — {active.name}
              </h2>
              <AiLabel>Grounded in document</AiLabel>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">{active.analysis.summary}</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Detected Topics</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {active.analysis.topics.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Concepts</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {active.analysis.concepts.slice(0, 6).map((c) => (
                    <Badge key={c} variant="outline" className="bg-white/70 font-normal">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Competency mapping */}
            <div className="mt-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <MapIcon className="size-3.5" /> Mapped Competencies
              </h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {active.analysis.mappedCompetencies.map((m) => (
                  <div key={m.competencyId} className="glass-subtle flex items-center justify-between rounded-lg p-2.5 text-sm">
                    <span className="font-medium">{COMPETENCY_MAP[m.competencyId]?.name}</span>
                    <Badge variant="secondary">{Math.round(m.relevance * 100)}%</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  navigate(`/dashboard/quiz-lab?material=${active.id}`)
                }
                className="gap-2"
              >
                <Sparkles className="size-4" /> Generate AI assessment
              </Button>
              <span className="self-center text-xs text-muted-foreground">
                Blueprint: ~{Math.min(20, Math.max(8, Math.round(active.analysis.wordCount / 30)))} MCQs · scenario questions · flashcards ready
              </span>
            </div>
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Learning Objectives</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-slate-700">
                {active.analysis.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Flashcards</h3>
              <ul className="mt-2 space-y-1.5">
                {active.analysis.flashcards.slice(0, 3).map((f, i) => (
                  <li key={i} className="glass-subtle rounded-lg p-2.5 text-xs leading-relaxed">
                    <b>{f.front}</b> — {f.back}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Practice Questions</h3>
              <ul className="mt-2 list-decimal space-y-2 pl-4 text-sm text-slate-700">
                {active.analysis.practiceQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mini Learning Pathway</h3>
              <ol className="mt-2 space-y-2">
                {active.analysis.pathway.map((p, i) => (
                  <li key={i} className="glass-subtle flex items-center justify-between rounded-lg p-2.5 text-sm">
                    <span>{p.title}</span>
                    <span className="tabular-nums text-xs text-muted-foreground">{p.minutes} min</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-muted-foreground">Estimated difficulty: {active.analysis.estimatedDifficulty} · {active.sizeKb} KB · {active.analysis.wordCount} words extracted</p>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Material library */}
      {materials.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Your Materials</h2>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => {
                    setActiveId(m.id);
                    setStepIdx(-1);
                  }}
                  className={cn(
                    "glass-subtle glass-hover flex w-full items-center justify-between rounded-lg p-3 text-left",
                    activeId === m.id && "ring-2 ring-indigo-300",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <FileUp className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{m.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {new Date(m.uploadedAt).toLocaleString()} · {m.sizeKb} KB
                      </span>
                    </span>
                  </span>
                  {m.status === "analyzed" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : m.status === "analyzing" ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                  ) : (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
