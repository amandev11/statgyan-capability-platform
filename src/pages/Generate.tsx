import { PageContainer, SectionHeader, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { DOMAINS, domainName, generateAssessment } from "@/lib/statgyan/engine";
import type { AssessmentConfig, GeneratedQuestion } from "@/lib/statgyan/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Check,
  Info,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

export default function Generate() {
  const [params] = useSearchParams();
  const materialId = params.get("material");
  const material = useQuery(
    api.quiza.getMaterial,
    materialId ? { id: materialId as never } : "skip",
  );
  const saveAssessment = useMutation(api.quiza.saveAssessment);

  const [config, setConfig] = useState<AssessmentConfig>({
    count: 6,
    difficulty: "Mixed",
    bloom: "Mixed",
    domains: [],
    passingScore: 60,
    randomized: true,
  });
  const [generated, setGenerated] = useState<{
    questions: GeneratedQuestion[];
    quality: { score: number; checks: { label: string; pass: boolean; note: string }[] };
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string | null>(null);

  const sourceMaterial = useMemo(() => {
    if (material && "title" in material) {
      return {
        title: material.title,
        fileName: material.fileName,
        fileType: material.fileType,
        wordCount: material.wordCount,
        simulatedExtraction: material.simulatedExtraction,
        topics: material.topics,
        concepts: material.concepts,
        objectives: material.objectives,
        domains: material.domains,
        questionOpportunities: material.questionOpportunities,
        text: undefined as string | undefined,
      };
    }
    return null;
  }, [material]);

  const run = () => {
    setPublished(null);
    const result = generateAssessment(sourceMaterial, config);
    setGenerated(result);
  };

  const publish = async () => {
    if (!generated) return;
    setPublishing(true);
    try {
      const id = await saveAssessment({
        title: sourceMaterial
          ? `${sourceMaterial.title} — AI Assessment`
          : `Domain Assessment — ${config.domains.length ? "Selected domains" : "Mixed"}`,
        materialId: materialId ? (materialId as never) : undefined,
        sourceLabel: sourceMaterial ? sourceMaterial.title : "Domain scenario bank",
        difficulty: config.difficulty,
        qualityScore: generated.quality.score,
        questions: generated.questions,
      });
      setPublished(id);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <PageContainer width="default">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Assessment generator</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Generate MCQs</h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Configure a blueprint; the generator builds source-traced questions from your
          uploaded material and the curated scenario bank.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ------------------------------------------------------ Blueprint */}
        <section className="edge-glow h-fit rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6" aria-label="Assessment blueprint">
          <p className="eyebrow mb-5">Blueprint</p>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[13px] font-medium text-secondary">
                Source:{" "}
                {materialId
                  ? material === undefined
                    ? "loading…"
                    : material
                      ? material.title
                      : "material not found"
                  : "domain scenario bank"}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Number of questions</span>
              <div className="flex gap-2">
                {[4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setConfig((c) => ({ ...c, count: n }))}
                    aria-pressed={config.count === n}
                    className={cn(
                      "num h-9 flex-1 rounded-lg border text-[13px] font-medium transition-colors",
                      config.count === n
                        ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                        : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Difficulty</span>
              <div className="flex flex-wrap gap-2">
                {(["Easy", "Medium", "Hard", "Mixed"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                    aria-pressed={config.difficulty === d}
                    className={cn(
                      "h-9 rounded-full border px-3.5 text-xs font-medium transition-colors",
                      config.difficulty === d
                        ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                        : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">
                Cognitive level <span className="text-muted-qz">(Bloom's)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(["Recall", "Understanding", "Application", "Analysis", "Mixed"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setConfig((c) => ({ ...c, bloom: b }))}
                    aria-pressed={config.bloom === b}
                    className={cn(
                      "h-9 rounded-full border px-3.5 text-xs font-medium transition-colors",
                      config.bloom === b
                        ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                        : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Domains</span>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map((d) => {
                  const active = config.domains.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          domains: active
                            ? c.domains.filter((x) => x !== d.id)
                            : [...c.domains, d.id],
                        }))
                      }
                      aria-pressed={active}
                      className={cn(
                        "h-8 rounded-full border px-3 text-[11px] font-medium transition-colors",
                        active
                          ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                          : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                      )}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </label>

            <button
              onClick={run}
              data-cursor="hover"
              className="btn-specular inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
            >
              <Wand2 className="size-4" /> Generate questions
            </button>
          </div>
        </section>

        {/* ------------------------------------------------------- Preview */}
        <section aria-label="Generated questions preview">
          {!generated ? (
            <div className="rounded-2xl border hairline-faint border-dashed px-6 py-20 text-center">
              <Sparkles className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
              <p className="mt-4 text-sm text-secondary">
                Set a blueprint and generate — every question will carry its source reference.
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Quality indicator */}
              <div className="edge-glow mb-4 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <ShieldCheck className="size-4 text-[var(--qz-accent)]" /> Question quality
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-qz">Heuristic audit — not a scientifically validated metric</p>
                  </div>
                  <span className="num text-3xl font-semibold tracking-tight text-[var(--qz-accent)]">
                    {generated.quality.score}%
                  </span>
                </div>
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {generated.quality.checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2 text-xs text-secondary">
                      {c.pass ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300/90" />
                      ) : (
                        <X className="mt-0.5 size-3.5 shrink-0 text-rose-300/90" />
                      )}
                      <span>
                        <span className="font-medium">{c.label}</span>
                        <span className="text-muted-qz"> — {c.note}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions */}
              <ol className="space-y-3">
                {generated.questions.map((q, i) => (
                  <details key={i} className="edge-glow rounded-xl border hairline bg-[var(--qz-surface-1)] [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer p-4">
                      <span className="flex items-start gap-3">
                        <span className="num mt-0.5 text-xs font-semibold text-muted-qz">Q{i + 1}</span>
                        <span className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed">{q.text}</span>
                      </span>
                    </summary>
                    <div className="space-y-1.5 px-4 pb-4">
                      {q.options.map((opt, oi) => (
                        <p
                          key={oi}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs",
                            oi === q.correctIndex
                              ? "border-emerald-300/25 bg-emerald-400/[0.06] text-emerald-100"
                              : "hairline-faint text-secondary",
                          )}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </p>
                      ))}
                      <p className="pt-1 text-xs leading-relaxed text-secondary">{q.explanation}</p>
                      <p className="num inline-flex items-center gap-1.5 rounded-md border hairline-faint px-2 py-0.5 text-[10px] text-muted-qz">
                        <Info className="size-3" /> Source: {q.sourceRef} · {domainName(q.domain)} · {q.difficulty}
                      </p>
                    </div>
                  </details>
                ))}
              </ol>

              {/* Publish */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pb-8">
                {published && (
                  <Link
                    to={`/quiz/set-${published}`}
                    data-cursor="hover"
                    className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                  >
                    Start assessment <Sparkles className="size-4" />
                  </Link>
                )}
                {!published && (
                  <button
                    onClick={() => void publish()}
                    disabled={publishing || generated.questions.length === 0}
                    data-cursor="hover"
                    className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold disabled:opacity-60"
                  >
                    {publishing ? "Publishing…" : "Publish assessment"}
                  </button>
                )}
                {published && (
                  <span className="text-xs text-emerald-300/90">Published — ready to take.</span>
                )}
              </div>
            </motion.div>
          )}
        </section>
      </div>

      {/* -------------------------------------------------- Past generations */}
      <section className="pb-10">
        <SectionHeader eyebrow="History" title="Published assessments" />
        <PublishedList />
      </section>
    </PageContainer>
  );
}

function PublishedList() {
  const assessments = useQuery(api.quiza.myAssessments);
  if (assessments === undefined) return <SkeletonBlock className="h-20 rounded-2xl" />;
  if (assessments.length === 0) {
    return (
      <div className="rounded-2xl border hairline-faint border-dashed px-6 py-10 text-center">
        <p className="text-sm text-secondary">No published assessments yet.</p>
      </div>
    );
  }
  return (
    <ul className="edge-glow divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
      {assessments.map((a) => (
        <li key={a._id} className="flex items-center gap-4 px-5 py-3.5">
          <span className="num grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] text-xs font-bold text-[var(--qz-accent)]">
            {a.qualityScore}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{a.title}</p>
            <p className="num text-xs text-muted-qz">
              {a.questions.length} questions · {a.sourceLabel}
            </p>
          </div>
          <Link
            to={`/quiz/set-${a._id}`}
            className="inline-flex h-9 shrink-0 items-center rounded-lg border hairline px-3 text-xs font-medium text-secondary transition-colors hover:bg-white/[0.05]"
          >
            Take
          </Link>
        </li>
      ))}
    </ul>
  );
}
