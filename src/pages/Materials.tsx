import { PageContainer, SectionHeader, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { extractPdf } from "@/lib/statgyan/extract-pdf";
import { extractDocx, extractPptx } from "@/lib/statgyan/extract-office";
import { analyzeDocument } from "@/lib/statgyan/engine";
import { cn } from "@/lib/utils";
import type { DocAnalysis } from "@/lib/statgyan/types";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileText,
  FileUp,
  Info,
  Wand2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

const PIPELINE = [
  "Extracting content",
  "Identifying topics",
  "Mapping competency domains",
  "Deriving learning objectives",
  "Estimating question opportunities",
];

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.pptx,.txt,.csv,.md,.json";

/**
 * Structured CSV representation — instead of dumping raw rows, summarise
 * headers, shape and sample values so analysis works from real structure.
 */
function summarizeCsv(text: string): string {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return text;
  const split = (line: string) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);
  const sample = rows.slice(0, 5);
  const colSummary = headers.map((h, i) => {
    const values = sample.map((r) => r[i]).filter(Boolean).slice(0, 3);
    return `${h || `Column ${i + 1}`}: ${values.join(", ")}`;
  });
  return [
    `Statistical dataset with ${headers.length} columns and ${rows.length} data rows.`,
    `Columns: ${headers.filter(Boolean).join(" | ")}`,`Sample values per column:`,
    ...colSummary,
    `Full dataset available for question construction on these measures.`,
  ].join("\n");
}

export default function Materials() {
  const save = useMutation(api.quiza.saveMaterial);
  const materials = useQuery(api.quiza.myMaterials);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(-1); // pipeline animation index
  const [analysis, setAnalysis] = useState<(DocAnalysis & { fileName: string; fileType: string; pages?: number }) | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    setSavedId(null);
    setAnalysis(null);
    if (file.size > MAX_BYTES) {
      setError("File exceeds the 8 MB limit.");
      return;
    }
    // Real text extraction for every format we can genuinely parse:
    //  · PDF  → pdf.js page-aware parsing (embeds [Page N] markers)
    //  · DOCX → fflate ZIP inflate + OOXML paragraphs ([Section: heading] markers)
    //  · PPTX → slide-by-slide text with [Slide N] provenance
    //  · TXT/CSV/MD/JSON → direct read
    let text = "";
    let pages: number | undefined;
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".pdf")) {
        const pdf = await extractPdf(file);
        text = pdf.text;
        pages = pdf.pages;
      } else if (name.endsWith(".docx")) {
        const doc = await extractDocx(file);
        text = doc.text;
        pages = doc.units; // section count — used as structural unit count
      } else if (name.endsWith(".pptx")) {
        const deck = await extractPptx(file);
        text = deck.text;
        pages = deck.units; // slide count
      } else if (!name.endsWith(".doc") && !name.endsWith(".ppt")) {
        const raw = await file.text();
        text = name.endsWith(".csv") ? summarizeCsv(raw) : raw;
      }
    } catch (e) {
      console.warn("Extraction failed", e);
      setError(`Unable to extract readable text from this ${file.name.split(".").pop()?.toUpperCase()} file — it may be corrupted or password-protected. Try a supported format (PDF, DOCX, PPTX, TXT, CSV).`);
      return;
    }
    // Legacy binary .doc/.ppt and scanned files yield no parseable text — be honest.
    if (text.trim().split(/\s+/).length < 40) {
      setError(name.endsWith(".doc") || name.endsWith(".ppt")
        ? "Legacy .doc/.ppt formats aren't supported — re-save as .docx / .pptx or export to PDF."
        : "This document contains no extractable text (likely scanned images or empty). StatGyan only analyses text-based documents.");
      return;
    }

    // Animated pipeline
    for (let i = 0; i < PIPELINE.length; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 420));
    }
    setStage(-1);

    const result = analyzeDocument({ fileName: file.name, fileType: file.type || (file.name.split(".").pop() ?? ""), text });
    setAnalysis({ ...result, fileName: file.name, fileType: file.name.split(".").pop()?.toUpperCase() ?? "", pages });

    try {
      const id = await save({
        title: result.title,
        fileName: file.name,
        fileType: file.name.split(".").pop() ?? "",
        wordCount: result.wordCount,
        simulatedExtraction: result.simulatedExtraction,
        topics: result.topics,
        concepts: result.concepts,
        objectives: result.objectives,
        domains: result.domains,
        questionOpportunities: result.questionOpportunities,
        pages,
        text: text.slice(0, 60_000), // persisted so MCQ generation stays grounded
      });
      setSavedId(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageContainer width="default">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Document intelligence</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Upload learning material</h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Handbooks, training decks, circulars — StatGyan extracts topics, concepts and question
          opportunities, then turns them into source-traced assessments.
        </p>
      </div>

      {/* ------------------------------------------------------ Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void processFile(f);
        }}
        className={cn(
          "edge-glow mt-8 rounded-2xl border border-dashed p-10 text-center transition-colors duration-200",
          dragging ? "border-[var(--qz-accent)]/60 bg-[var(--qz-accent)]/[0.06]" : "hairline bg-white/[0.015]",
        )}
        aria-label="File upload area"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void processFile(f);
            e.target.value = "";
          }}
        />
        <FileUp className="mx-auto size-6 text-muted-qz" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium text-[var(--qz-text)]">Drop learning material here</p>
        <p className="num mt-1 text-xs text-muted-qz">
          PDF · DOCX · PPTX · TXT · CSV — up to 8 MB
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          data-cursor="hover"
          className="btn-specular mt-5 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold"
        >
          Browse files
        </button>
        {error && <p className="mt-3 text-sm text-rose-300" role="alert">{error}</p>}
      </div>

      {/* ------------------------------------------------------- Pipeline */}
      <AnimatePresence>
        {stage >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="edge-glow mt-6 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6"
            aria-live="polite"
          >
            {PIPELINE.map((label, i) => (
              <div key={label} className="flex items-center gap-3 py-1.5 text-[13px]">
                {i < stage ? (
                  <Check className="size-4 text-emerald-300/90" />
                ) : i === stage ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/15 border-t-[var(--qz-accent)]" />
                ) : (
                  <span className="size-4 rounded-full border hairline-faint" />
                )}
                <span className={i <= stage ? "text-secondary" : "text-muted-qz"}>{label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------- Analysis card */}
      {analysis && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="edge-glow mt-6 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-7"
          aria-label="Document intelligence report"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="num grid size-11 place-items-center rounded-xl border hairline-faint bg-white/[0.03] text-[10px] font-bold text-secondary">
                {analysis.fileType}
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{analysis.title}</h2>
                <p className="num text-xs text-muted-qz">
                  ~{analysis.wordCount.toLocaleString()} words · difficulty {analysis.difficulty}
                  {analysis.pages ? ` · ${analysis.pages} pages` : ""}
                </p>
              </div>
            </div>
            {analysis.simulatedExtraction ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/[0.08] px-2.5 py-1 text-[11px] font-medium text-amber-200">
                <Info className="size-3" /> Simulated extraction (binary preview unavailable in-browser)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                <Check className="size-3" /> Real text extraction — MCQs will cite exact pages
              </span>
            )}
          </div>

          {/* Intelligence stats */}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {[
              { label: "Topics detected", value: analysis.topics.length },
              { label: "Key concepts", value: analysis.concepts.length },
              { label: "Question opportunities", value: analysis.questionOpportunities },
              { label: "Competency domains", value: analysis.domains.length },
            ].map((s) => (
              <div key={s.label}>
                <p className="num text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-qz">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lists */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <ListBlock title="Detected domains" items={analysis.domains} accent />
            <ListBlock title="Key concepts" items={analysis.concepts} />
            <ListBlock title="Topics" items={analysis.topics} />
            <ListBlock title="Learning objectives" items={analysis.objectives} numbered />
          </div>

          {savedId && (
            <Link
              to={`/generate?material=${savedId}`}
              data-cursor="hover"
              className="btn-specular mt-7 inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
            >
              Generate assessment from this material <ArrowRight className="size-4" />
            </Link>
          )}
        </motion.section>
      )}

      {/* ------------------------------------------------------------ Library */}
      <section className="mt-12 pb-10">
        <SectionHeader eyebrow="Library" title="Processed materials" />
        {materials === undefined ? (
          <SkeletonBlock className="h-28 rounded-2xl" />
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border hairline-faint border-dashed px-6 py-12 text-center">
            <FileText className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
            <p className="mt-3 text-sm text-secondary">Nothing uploaded yet — your document intelligence reports will live here.</p>
          </div>
        ) : (
          <ul className="edge-glow divide-y divide-white/[0.05] overflow-hidden rounded-2xl border hairline bg-[var(--qz-surface-1)]">
            {materials.map((m) => (
              <li key={m._id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="num grid size-9 shrink-0 place-items-center rounded-lg border hairline-faint bg-white/[0.03] text-[10px] font-bold uppercase text-secondary">
                  {m.fileType}
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  <p className="num text-xs text-muted-qz">
                    {m.domains.slice(0, 2).join(" · ")} · {m.wordCount.toLocaleString()} words
                    {!m.simulatedExtraction && m.pages ? ` · ${m.pages} pp.` : ""}
                  </p>
                </div>
                <span className="num hidden text-xs text-muted-qz sm:block">{m.questionOpportunities} question opportunities</span>
                <Link
                  to={`/generate?material=${m._id}`}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border hairline px-3 text-xs font-medium text-secondary transition-colors hover:bg-white/[0.05]"
                >
                  <Wand2 className="size-3" /> Generate MCQs
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  );
}

function ListBlock({
  title,
  items,
  accent,
  numbered,
}: {
  title: string;
  items: string[];
  accent?: boolean;
  numbered?: boolean;
}) {
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-secondary">
            {numbered ? (
              <span className="num text-muted-qz">{String(i + 1).padStart(2, "0")}</span>
            ) : (
              <span className={`mt-[7px] size-1 shrink-0 rounded-full ${accent ? "bg-[var(--qz-accent)]" : "bg-white/25"}`} />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
