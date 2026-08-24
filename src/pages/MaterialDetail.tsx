import { PageContainer, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { buildSourceDigest } from "@/lib/statgyan/ai-client";
import type { KnowledgeMap } from "@/lib/statgyan/ai-client";
import { cn } from "@/lib/utils";
import { useAction, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Layers,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";

// ---------------------------------------------------------------------------
// Local shapes for the AI payloads (server validates before returning).
// ---------------------------------------------------------------------------

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  ungrounded?: boolean;
}

interface StudyNotes {
  summary: string;
  keyConcepts: string[];
  definitions: { term: string; meaning: string }[];
  procedures: string[];
  commonMistakes: string[];
  learningObjectives: string[];
  examReadyNotes: string[];
  revisionSummary: string;
}

interface Flashcard {
  front: string;
  back: string;
  example?: string;
  confusion?: string;
  sourceRef?: string;
}

type Tab = "ask" | "notes" | "cards";

export default function MaterialDetail() {
  const { materialId } = useParams<{ materialId: string }>();
  const material = useQuery(
    api.quiza.getMaterial,
    materialId ? { id: materialId as never } : "skip",
  );
  const checkAiStatus = useAction(api.ai.aiStatus);
  const [aiReady, setAiReady] = useState<boolean | undefined>(undefined);

  // Lightweight availability probe.
  useEffect(() => {
    let live = true;
    void checkAiStatus()
      .then((s) => live && setAiReady(s.configured))
      .catch(() => live && setAiReady(false));
    return () => {
      live = false;
    };
  }, [checkAiStatus]);

  if (material === undefined) {
    return (
      <PageContainer width="reading">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="mt-8 h-64 rounded-2xl" />
      </PageContainer>
    );
  }
  if (!material) {
    return (
      <PageContainer width="reading" className="pt-24 text-center">
        <h1 className="text-lg font-semibold">Material not found</h1>
        <p className="mt-2 text-sm text-secondary">It may belong to another session.</p>
        <Link to="/materials" className="btn-specular mt-6 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">
          Back to library
        </Link>
      </PageContainer>
    );
  }

  const hasText = typeof material.text === "string" && material.text.trim().length > 200;
  const knowledgeMap = material.knowledgeMap as KnowledgeMap | undefined;

  return (
    <MaterialDetailBody
      materialId={material._id}
      title={material.title}
      fileType={material.fileType}
      wordCount={material.wordCount}
      pages={material.pages ?? undefined}
      simulated={material.simulatedExtraction}
      text={hasText ? (material.text as string) : undefined}
      knowledgeMap={knowledgeMap}
      aiReady={aiReady}
    />
  );
}

function MaterialDetailBody({
  materialId,
  title,
  fileType,
  wordCount,
  pages,
  simulated,
  text,
  knowledgeMap,
  aiReady,
}: {
  materialId: string;
  title: string;
  fileType: string;
  wordCount: number;
  pages?: number;
  simulated: boolean;
  text?: string;
  knowledgeMap?: KnowledgeMap;
  aiReady: boolean | undefined;
}) {
  const [tab, setTab] = useState<Tab>("ask");
  const hasText = text !== undefined;
  // Digest is stable per material — built once, reused by every AI tool.
  const digest = useMemo(() => buildSourceDigest(text, knowledgeMap), [text, knowledgeMap]);
  const kmSummary = knowledgeMap?.summary;
  const kmTopics = knowledgeMap?.topics ?? [];
  const kmObjectives = knowledgeMap?.learningObjectives ?? [];

  return (
    <PageContainer width="reading">
      {/* ------------------------------------------------------------ Header */}
      <Link
        to="/materials"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-qz transition-colors hover:text-secondary"
      >
        <ArrowLeft className="size-3.5" /> Library
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="num grid size-11 shrink-0 place-items-center rounded-xl border hairline-faint bg-white/[0.03] text-[10px] font-bold uppercase text-secondary">
            {fileType}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            <p className="num mt-0.5 text-xs text-muted-qz">
              ~{wordCount.toLocaleString()} words{pages ? ` · ${pages} pages` : ""} · uploaded material
            </p>
          </div>
        </div>
        <div
          role="status"
          className="inline-flex items-center gap-2 rounded-full border hairline bg-[var(--qz-surface-1)] px-3 py-1 text-[11px]"
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              aiReady === undefined ? "bg-white/30" : aiReady ? "bg-emerald-400" : "bg-amber-300",
            )}
          />
          <span className="text-muted-qz">
            {aiReady === undefined ? "checking AI…" : aiReady ? "AI connected" : "AI unavailable — tools offline"}
          </span>
        </div>
      </div>

      {!hasText && (
        <div
          role="status"
          className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-400/[0.07] px-4 py-3 text-xs leading-relaxed text-amber-100"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            This upload had no extractable full text{simulated ? " (simulated extraction)" : ""}, so grounded AI
            tools are limited to the detected structure. Re-upload a text-based PDF/DOCX/PPTX for full document
            intelligence.
          </span>
        </div>
      )}

      {/* -------------------------------------------------- Knowledge map */}
      {(kmSummary || kmTopics.length > 0) && (
        <section className="edge-glow mt-6 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6" aria-label="Document understanding">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <BrainCircuit className="size-3.5 text-[var(--qz-accent)]" /> Document understanding
            {(kmSummary || kmTopics.length > 0 || kmObjectives.length > 0) && (
              <span className="rounded-full border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08] px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--qz-accent)]">
                AI ANALYSIS
              </span>
            )}
          </p>
          {kmSummary && <p className="text-sm leading-relaxed text-secondary">{kmSummary}</p>}
          {kmTopics.length > 0 && (
            <>
              <p className="eyebrow mt-4 mb-2">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {kmTopics.slice(0, 12).map((t) => (
                  <span key={t} className="rounded-full border hairline-faint bg-white/[0.02] px-2.5 py-1 text-[11px] text-secondary">
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
          {kmObjectives.length > 0 && (
            <>
              <p className="eyebrow mt-4 mb-2">Learning objectives</p>
              <ul className="space-y-1">
                {kmObjectives.slice(0, 6).map((o, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-secondary">
                    <span className="num text-muted-qz">{String(i + 1).padStart(2, "0")}</span> {o}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------- Tabs */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="AI study tools">
        {(
          [
            { id: "ask", label: "Ask this material", icon: Send },
            { id: "notes", label: "Study notes", icon: GraduationCap },
            { id: "cards", label: "Flashcards", icon: Layers },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            disabled={!hasText || aiReady === false}
            data-cursor="hover"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors disabled:opacity-40",
              tab === t.id
                ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12] text-[var(--qz-text)]"
                : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
            )}
          >
            <t.icon className="size-3 text-[var(--qz-accent)]" /> {t.label}
          </button>
        ))}
        <Link
          to={`/generate?material=${materialId}`}
          data-cursor="hover"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--qz-accent)]/35 bg-[var(--qz-accent)]/[0.08] px-3.5 text-xs font-semibold text-[var(--qz-text)] transition-colors hover:bg-[var(--qz-accent)]/[0.14]"
        >
          Generate assessment <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="mt-4 pb-12">
        {tab === "ask" && hasText && <AskPanel title={title} digest={digest} />}
        {tab === "notes" && hasText && <NotesPanel title={title} digest={digest} />}
        {tab === "cards" && hasText && <CardsPanel title={title} digest={digest} />}
      </div>
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------
// Ask this material — grounded Q&A with sources
// ---------------------------------------------------------------------------

function AskPanel({ title, digest }: { title: string; digest: string }) {
  const ask = useAction(api.ai.chatWithMaterial);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Ask me anything about this document — a concept, a specific section, or \"what should I remember for an exam?\" Every answer is grounded in the material with its source.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setTurns((t) => [...t, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ title, digest, question: q });
      setTurns((t) => [
        ...t,
        { role: "assistant", content: res.answer, sources: res.sources, ungrounded: !res.grounded },
      ]);
    } catch {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content:
            "The AI engine is unavailable right now, so I can't answer from this material at the moment. Try again shortly — generation and assessments still work through the fallback engine.",
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="edge-glow flex min-h-[26rem] flex-col rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5"
      aria-live="polite"
    >
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {turns.map((t, i) => (
          <div key={i} className={`flex gap-3 ${t.role === "user" ? "justify-end" : ""}`}>
            {t.role === "assistant" && (
              <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08]">
                <Sparkles className="size-3.5 text-[var(--qz-accent)]" />
              </span>
            )}
            <div className={`max-w-[85%] ${t.role === "user" ? "order-first" : ""}`}>
              <p
                className={`whitespace-pre-line rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  t.role === "user"
                    ? "rounded-br-sm bg-[var(--qz-accent)]/[0.14] text-[var(--qz-text)]"
                    : "rounded-bl-sm border hairline-faint bg-white/[0.02] text-secondary"
                }`}
              >
                {t.content}
              </p>
              {t.ungrounded && (
                <p className="num mt-1 text-[10px] text-amber-300/80">Not covered in this document</p>
              )}
              {t.sources && t.sources.length > 0 && (
                <p className="num mt-1 flex flex-wrap gap-1.5">
                  {t.sources.map((s, si) => (
                    <span
                      key={si}
                      className="inline-flex items-center rounded-md border hairline-faint px-1.5 py-0.5 text-[10px] text-muted-qz"
                    >
                      Source: {s}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 pl-10 text-xs text-muted-qz">
            <Loader2 className="size-3 animate-spin" /> Reading the material…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-4 flex gap-2 border-t hairline-faint pt-4"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "Explain stratified sampling simply" · "What is on page 3?"'
          aria-label="Question about this material"
          className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none placeholder:text-muted-qz focus-visible:border-[var(--qz-accent)]/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Ask"
          data-cursor="hover"
          className="btn-specular grid size-11 place-items-center rounded-xl disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Study notes — executive summary → revision brief
// ---------------------------------------------------------------------------

function NotesPanel({ title, digest }: { title: string; digest: string }) {
  const generate = useAction(api.ai.studyNotes);
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await generate({ title, digest });
      setNotes(res.notes as StudyNotes);
    } catch {
      setError("AI generation unavailable right now — please retry.");
    } finally {
      setBusy(false);
    }
  };

  if (!notes) {
    return (
      <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-16 text-center">
        <GraduationCap className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-secondary">
          Generates an executive summary, key concepts, definitions, common mistakes, exam-ready notes and a
          tight revision brief — all strictly from this document.
        </p>
        <button
          onClick={() => void run()}
          disabled={busy}
          data-cursor="hover"
          className="btn-specular mt-6 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Writing notes…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Generate study notes
            </>
          )}
        </button>
        {error && <p role="alert" className="mt-3 text-xs text-rose-300">{error}</p>}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <section className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
          <p className="eyebrow mb-2">Executive summary</p>
          <p className="text-sm leading-relaxed text-secondary">{notes.summary}</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {notes.keyConcepts.length > 0 && (
            <ListCard label="Key concepts" items={notes.keyConcepts} />
          )}
          {notes.procedures.length > 0 && <ListCard label="Key procedures" items={notes.procedures} />}
          {notes.commonMistakes.length > 0 && (
            <ListCard label="Common mistakes" items={notes.commonMistakes} warn />
          )}
          {notes.learningObjectives.length > 0 && (
            <ListCard label="Learning objectives" items={notes.learningObjectives} numbered />
          )}
          {notes.examReadyNotes.length > 0 && (
            <ListCard label="Exam-ready notes" items={notes.examReadyNotes} accent />
          )}
          {notes.definitions.length > 0 && (
            <section className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5 sm:col-span-2">
              <p className="eyebrow mb-3">Important definitions</p>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {notes.definitions.map((d, i) => (
                  <div key={i}>
                    <dt className="text-[13px] font-semibold text-[var(--qz-text)]">{d.term}</dt>
                    <dd className="mt-0.5 text-[13px] leading-relaxed text-secondary">{d.meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {notes.revisionSummary && (
          <section className="edge-glow rounded-2xl border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.05] p-6">
            <p className="eyebrow mb-2">Revision summary · 120 seconds</p>
            <p className="text-sm leading-relaxed text-secondary">{notes.revisionSummary}</p>
          </section>
        )}

        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] text-muted-qz">Generated from this document by the StatGyan AI engine.</p>
          <button
            onClick={() => void run()}
            disabled={busy}
            data-cursor="hover"
            className="inline-flex h-8 items-center rounded-lg border hairline px-3 text-xs font-medium text-secondary transition-colors hover:bg-white/[0.05] disabled:opacity-60"
          >
            {busy ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Flashcards — flip cards grounded in the document
// ---------------------------------------------------------------------------

function CardsPanel({ title, digest }: { title: string; digest: string }) {
  const generate = useAction(api.ai.generateFlashcards);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await generate({ title, digest, count: 8 });
      setCards(res.cards as Flashcard[]);
      setFlipped(new Set());
    } catch {
      setError("AI generation unavailable right now — please retry.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (i: number) =>
    setFlipped((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (!cards) {
    return (
      <div className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] px-6 py-16 text-center">
        <Layers className="mx-auto size-5 text-muted-qz" strokeWidth={1.6} />
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-secondary">
          Flashcards with term, definition, worked example and the common confusion each card clears up — every
          back carries its page reference.
        </p>
        <button
          onClick={() => void run()}
          disabled={busy}
          data-cursor="hover"
          className="btn-specular mt-6 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Building cards…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Generate flashcards
            </>
          )}
        </button>
        {error && <p role="alert" className="mt-3 text-xs text-rose-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            aria-pressed={flipped.has(i)}
            data-cursor="hover"
            className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5 text-left transition-transform active:scale-[0.99]"
          >
            <p className="num text-[10px] font-bold tracking-wider text-muted-qz">
              CARD {String(i + 1).padStart(2, "0")} · {flipped.has(i) ? "BACK" : "FRONT"}
            </p>
            {flipped.has(i) ? (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-secondary">{c.back}</p>
                {c.example && (
                  <p className="mt-2 border-l-2 border-white/[0.08] pl-3 text-xs leading-relaxed text-muted-qz">
                    Example: {c.example}
                  </p>
                )}
                {c.confusion && (
                  <p className="mt-2 text-xs leading-relaxed text-amber-200/80">Watch out: {c.confusion}</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--qz-text)]">{c.front}</p>
            )}
            {c.sourceRef && (
              <p className="num mt-3 inline-flex rounded-md border hairline-faint px-1.5 py-0.5 text-[10px] text-muted-qz">
                Source: {c.sourceRef}
              </p>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-muted-qz">Tap a card to flip · {cards.length} cards from this document.</p>
        <button
          onClick={() => void run()}
          disabled={busy}
          data-cursor="hover"
          className="inline-flex h-8 items-center rounded-lg border hairline px-3 text-xs font-medium text-secondary transition-colors hover:bg-white/[0.05] disabled:opacity-60"
        >
          {busy ? "Regenerating…" : "New set"}
        </button>
      </div>
    </div>
  );
}

function ListCard({
  label,
  items,
  numbered,
  accent,
  warn,
}: {
  label: string;
  items: string[];
  numbered?: boolean;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <section className="edge-glow rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5">
      <p className="eyebrow mb-3">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-secondary">
            {numbered ? (
              <span className="num text-muted-qz">{String(i + 1).padStart(2, "0")}</span>
            ) : warn ? (
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-300/80" />
            ) : (
              <span
                className={`mt-[7px] size-1 shrink-0 rounded-full ${
                  accent ? "bg-[var(--qz-accent)]" : "bg-white/25"
                }`}
              />
            )}
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
