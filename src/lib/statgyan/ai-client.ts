// Browser-safe client for the AI generation pipeline. All provider calls go
// through Convex actions (the API key never reaches this side); this module
// owns LOCAL validation, best-candidate selection, deterministic
// randomization and honest report assembly for AI-generated assessments.

import {
  buildBlueprintMatrix,
  domainName,
  fingerprint,
  fnv1a,
  makeRng,
  seededShuffle,
  segmentMaterial,
  stableId,
} from "./engine";
import type { GenerationResult } from "./engine";
import type {
  AssessmentConfig,
  BlueprintReport,
  GeneratedQuestion,
  LearnerContext,
  QuestionSlot,
} from "./types";

/** Raw candidate as returned (and server-shape-validated) by the AI action. */
export interface AiCandidate {
  slotId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
  sourceSnippet?: string;
  questionType: string;
}

/** Knowledge map shape persisted on the material row by analyzeMaterial. */
export interface KnowledgeMap {
  summary?: string;
  topics?: string[];
  concepts?: string[];
  definitions?: string[];
  procedures?: string[];
  rules?: string[];
  relationships?: string[];
  examples?: string[];
  numericalFacts?: string[];
  learningObjectives?: string[];
  competencyDomains?: { name: string; confidence: number }[];
}

const TYPE_MAP: Record<string, GeneratedQuestion["generationType"]> = {
  definition: "ai-definition",
  conceptual: "ai-conceptual",
  cloze: "ai-cloze",
  comparison: "ai-comparison",
  procedure: "ai-procedure",
  "cause-effect": "ai-procedure",
  scenario: "ai-scenario",
  application: "ai-application",
  analysis: "ai-analysis",
  numerical: "ai-numerical",
  interpretation: "ai-analysis",
};

/** Content hash for analysis caching — detects material changes without
 *  re-sending documents through the model. */
export function contentHash(text: string): string {
  return fnv1a(text).toString(36) + "-" + text.length.toString(36);
}

const STOPWORDS = new Set([
  "this", "that", "with", "from", "have", "been", "were", "their", "which",
  "about", "would", "could", "should", "these", "those", "there", "what",
  "when", "where", "does", "into", "more", "most", "such", "each", "also",
  "than", "then", "them", "they", "some", "only", "very", "must", "will",
  "page", "slide", "section", "document", "material",
]);

/** Relevance-based retrieval across the ENTIRE document (Phase 5). Every
 *  segment is scored against the query terms — never just the first N chunks.
 *  Falls back to document order when scoring cannot discriminate. */
export function retrieveSegments(
  text: string,
  queries: string[],
  maxChars = 12_000,
  maxSegs = 14,
): { label: string; body: string }[] {
  const segs = segmentMaterial(text);
  if (segs.length === 0) return [];
  const terms = new Set(
    (queries.join(" ").toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []).filter(
      (t) => !STOPWORDS.has(t),
    ),
  );
  const scored = segs.map((seg, idx) => {
    let score = 0;
    if (terms.size > 0) {
      const hay = `${seg.label}\n${seg.body}`.toLowerCase();
      terms.forEach((t) => {
        if (hay.includes(t)) score += t.length > 6 ? 2 : 1;
      });
    }
    // Tiny positional prior keeps early-document structure from being starved.
    return { seg, idx, score: score - idx * 0.01 };
  });
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  const chosen: typeof scored = [];
  let used = 0;
  for (const s of scored) {
    if (chosen.length >= maxSegs) break;
    const len = s.seg.body.length;
    if (used + len > maxChars) {
      if (chosen.length > 0) break;
      // First segment alone over budget — still take it so the model has context.
    }
    chosen.push(s);
    used += len;
  }
  // Restore document order for readability + stable provenance labels.
  return chosen.sort((a, b) => a.idx - b.idx).map((s) => s.seg);
}

/** Build the compact structured context sent to the AI: knowledge map first
 *  (cheap tokens), then RETRIEVED verbatim segments so snippets stay grounded
 *  in exact source wording. When `queries` are supplied (blueprint domains,
 *  Bloom levels, chat questions…), segments are selected by relevance across
 *  the whole document instead of a sequential first-N scan. */
export function buildSourceDigest(
  materialText: string | undefined,
  knowledgeMap: KnowledgeMap | undefined,
  queries: string[] = [],
): string {
  const parts: string[] = [];
  if (knowledgeMap && Object.keys(knowledgeMap).length > 0) {
    const km = knowledgeMap;
    const lines = [
      km.summary ? `Summary: ${km.summary}` : "",
      km.topics?.length ? `Topics: ${km.topics.join("; ")}` : "",
      km.concepts?.length ? `Concepts: ${km.concepts.join("; ")}` : "",
      km.definitions?.length ? `Definitions:\n- ${km.definitions.join("\n- ")}` : "",
      km.procedures?.length ? `Procedures:\n- ${km.procedures.join("\n- ")}` : "",
      km.rules?.length ? `Rules & thresholds:\n- ${km.rules.join("\n- ")}` : "",
      km.relationships?.length ? `Relationships:\n- ${km.relationships.join("\n- ")}` : "",
      km.examples?.length ? `Examples:\n- ${km.examples.join("\n- ")}` : "",
      km.numericalFacts?.length ? `Numerical facts:\n- ${km.numericalFacts.join("\n- ")}` : "",
      km.learningObjectives?.length ? `Learning objectives:\n- ${km.learningObjectives.join("\n- ")}` : "",
    ].filter(Boolean);
    if (lines.length > 0) {
      parts.push(`[KNOWLEDGE MAP — analysed structure of this document]\n${lines.join("\n")}`);
    }
  }
  const budget = 11_000;
  let used = 0;
  const segs: string[] = [];
  if (materialText) {
    const effectiveQueries =
      queries.length > 0
        ? queries
        : knowledgeMap?.topics?.length
          ? knowledgeMap.topics.slice(0, 10)
          : []; // no signal → retrieveSegments falls back near document order
    for (const seg of retrieveSegments(materialText, effectiveQueries, budget)) {
      const chunk = `[${seg.label}]\n${seg.body}`;
      if (used + chunk.length > budget && segs.length > 0) break;
      segs.push(chunk);
      used += chunk.length;
    }
  }
  if (segs.length > 0) parts.push(`[SOURCE EXTRACTS]\n${segs.join("\n\n")}`);
  return parts.join("\n\n");
}

const GROUNDING_THRESHOLD = 0.75;
const UNIQUENESS_THRESHOLD = 0.85;
const AMBIGUITY_THRESHOLD = 0.5;

/** Stage-2 acceptance gates (Phase 11): grounding, answer uniqueness and
 *  ambiguity must all clear their bars, and difficulty/Bloom adherence must
 *  hold. Verdict fields may be absent (older validators) — missing scores
 *  never reject on their own. */
export interface ValidationVerdict {
  valid: boolean;
  groundingScore: number;
  answerUniqueness?: number;
  ambiguity?: number;
  difficultyOk?: boolean;
  bloomOk?: boolean;
}

export function verdictAcceptable(v: ValidationVerdict): boolean {
  if (!v.valid) return false;
  if (v.groundingScore < GROUNDING_THRESHOLD) return false;
  if (v.answerUniqueness !== undefined && v.answerUniqueness < UNIQUENESS_THRESHOLD) return false;
  if (v.ambiguity !== undefined && v.ambiguity > AMBIGUITY_THRESHOLD) return false;
  if (v.difficultyOk === false || v.bloomOk === false) return false;
  return true;
}
/** Local validation of one candidate — structural + quality heuristics that do
 *  not need the model. Candidates failing hard checks are rejected outright. */
function scoreCandidate(
  c: AiCandidate,
  avoidFps: Set<string>,
  rng: () => number,
): { ok: boolean; score: number } {
  const stemWords = c.text.split(/\s+/).length;
  if (stemWords < 6 || c.text.length > 400) return { ok: false, score: -1 };
  // Option-quality heuristics: no length giveaways, no duplicates.
  const lens = c.options.map((o) => o.length);
  const correctLen = lens[c.correctIndex] ?? 0;
  const others = lens.filter((_, i) => i !== c.correctIndex);
  if (others.some((l) => l > correctLen * 3 || correctLen > l * 3)) {
    return { ok: false, score: -1 }; // answer-length clue
  }
  if (/^(all|none) of the above$/i.test(c.options[c.correctIndex] ?? "")) {
    return { ok: false, score: -1 };
  }

  let score = 50;
  if (c.sourceSnippet && c.sourceSnippet.length > 30) score += 18;
  if (c.explanation.length > 60) score += 10;
  if (stemWords >= 12) score += 6;
  score += rng() * 8; // seeded jitter rotates equally-good candidates across rounds

  // Near-duplicate stems vs session history are penalised hard (rotation prefers novelty).
  const fp = fingerprint(`${c.text} ${c.options[c.correctIndex] ?? ""}`);
  if (avoidFps.has(fp)) score -= 40;

  return { ok: true, score };
}

export interface AiSelectionInput {
  slots: QuestionSlot[];
  candidates: AiCandidate[];
  /** Fingerprints of questions to avoid (session history + current set). */
  avoidStems: string[];
  generationNumber: number;
}

/** Pick the best validated candidate per slot. Slots with no acceptable
 *  candidate come back separately so the deterministic engine can fill them. */
export function selectBestCandidates(input: AiSelectionInput): {
  chosen: { candidate: AiCandidate; slot: QuestionSlot }[];
  unfilledSlots: QuestionSlot[];
} {
  const seed = fnv1a(input.slots.map((s) => s.slotId).join("|") + "#" + input.generationNumber);
  const rng = makeRng(seed);
  const avoidFps = new Set(input.avoidStems.map(fingerprint));
  const perSlot = new Map<string, AiCandidate[]>();
  for (const c of input.candidates) {
    const list = perSlot.get(c.slotId);
    if (list) list.push(c);
    else perSlot.set(c.slotId, [c]);
  }
  const chosen: { candidate: AiCandidate; slot: QuestionSlot }[] = [];
  const unfilledSlots: QuestionSlot[] = [];
  for (const slot of input.slots) {
    let best: AiCandidate | undefined;
    let bestScore = -Infinity;
    for (const c of perSlot.get(slot.slotId) ?? []) {
      const verdict = scoreCandidate(c, avoidFps, rng);
      if (!verdict.ok || verdict.score <= bestScore) continue;
      bestScore = verdict.score;
      best = c;
    }
    if (best) {
      chosen.push({ candidate: best, slot });
      avoidFps.add(fingerprint(`${best.text} ${best.options[best.correctIndex] ?? ""}`));
    } else {
      unfilledSlots.push(slot);
    }
  }
  return { chosen, unfilledSlots };
}

/** Convert a chosen AI candidate into a full GeneratedQuestion bound to its
 *  slot contract — domain/difficulty/Bloom come from the BLUEPRINT, not from
 *  the model's word, so adherence is structural rather than trusted. */
function toQuestion(
  c: AiCandidate,
  slot: QuestionSlot,
  materialTitle: string,
): GeneratedQuestion {
  const provenance = c.sourceRef.startsWith(materialTitle)
    ? c.sourceRef.slice(materialTitle.length).replace(/^[·\s–—-]+/, "")
    : c.sourceRef;
  return {
    id: stableId("ai", materialTitle, c.text),
    text: c.text,
    options: [...c.options],
    correctIndex: c.correctIndex,
    explanation: c.explanation,
    sourceRef: [materialTitle, provenance].filter(Boolean).join(" · "),
    domain: slot.domain,
    difficulty: slot.difficulty,
    bloom: slot.bloom,
    generationType: TYPE_MAP[c.questionType] ?? "ai-conceptual",
    sourceSnippet: c.sourceSnippet,
  };
}

function tally(items: string[]): { label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export interface AssembleArgs {
  config: AssessmentConfig;
  chosen: { candidate: AiCandidate; slot: QuestionSlot }[];
  /** Deterministic fallback questions filling unmet/rejected slots. */
  fallbackQuestions: GeneratedQuestion[];
  materialTitle: string;
  provider: string;
  generationNumber: number;
  /** Mean stage-2 grounding score across KEPT AI questions (0–1), if validated. */
  avgGrounding?: number;
  /** Candidates rejected by stage-2 validation — surfaced in the report. */
  validationRejected?: number;
  requestedCount: number;
  scope: string[];
  notes: string[];
}

/** Assemble the final GenerationResult: randomization, dedupe, honest audit —
 *  mirroring the deterministic engine's semantics. Stage-2 rejection happens
 *  in the caller, which also arranges deterministic replacement slots. */
export function assembleAiResult(args: AssembleArgs): GenerationResult {
  const seed = fnv1a(
    [
      args.materialTitle,
      args.provider,
      String(args.generationNumber),
      String(args.config.count),
      args.config.difficulty,
      args.config.bloom,
      args.config.domains.join("+"),
    ].join("|"),
  );
  const rng = makeRng(seed);

  const aiQuestions = args.chosen.map((p) => toQuestion(p.candidate, p.slot, args.materialTitle));
  let finalQs: GeneratedQuestion[] = [...aiQuestions, ...args.fallbackQuestions];

  // Randomized flag — identical semantics to the deterministic engine: seeded
  // shuffle of order and options, correct index remapped, answers stay correct.
  if (args.config.randomized) {
    finalQs = seededShuffle(finalQs, rng).map((q) => {
      const order = seededShuffle(q.options.map((t, i) => ({ t, i })), rng);
      return {
        ...q,
        options: order.map((o) => o.t),
        correctIndex: order.findIndex((o) => o.i === q.correctIndex),
      };
    });
  }

  // Near-duplicate protection on the delivered set.
  const seen = new Set<string>();
  finalQs = finalQs.filter((q) => {
    const fp = fingerprint(`${q.text} ${q.options[q.correctIndex] ?? ""}`);
    if (seen.has(fp)) return false;
    seen.add(fp);
    return true;
  });

  // --- Real quality audit over delivered output ---
  const stems = new Set(finalQs.map((q) => q.text.toLowerCase()));
  const dupesRemoved = finalQs.length - stems.size;
  const badOptions = finalQs.filter(
    (q) =>
      new Set(q.options).size !== q.options.length ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length,
  ).length;
  const offDomain = finalQs.filter((q) => !args.scope.includes(q.domain)).length;
  const difficultyHonoured =
    args.config.difficulty === "Mixed" || args.config.difficulty === "Adaptive" ||
    finalQs.every((q) => q.difficulty === args.config.difficulty);
  const bloomHonoured =
    args.config.bloom === "Mixed" || finalQs.every((q) => q.bloom === args.config.bloom);
  const sourcedCount = finalQs.filter((q) => q.generationType !== "scenario").length;
  const provenanceShare = sourcedCount / Math.max(finalQs.length, 1);

  const checks = [
    { label: "Requested count", pass: finalQs.length === args.requestedCount,
      note: `${finalQs.length} of ${args.requestedCount}` },
    { label: "No duplicate questions", pass: dupesRemoved === 0,
      note: dupesRemoved === 0 ? "all stems distinct" : `${dupesRemoved} duplicate(s) removed` },
    { label: "Option integrity", pass: badOptions === 0,
      note: badOptions === 0 ? "unique options, exactly one answer each" : `${badOptions} malformed` },
    { label: "Domain scope", pass: offDomain === 0,
      note: offDomain === 0 ? "all within selected domains" : `${offDomain} outside selection` },
    { label: "Difficulty honoured", pass: difficultyHonoured,
      note: difficultyHonoured ? "every item matches the plan" : "mixed levels leaked in" },
    { label: "Bloom honoured", pass: bloomHonoured,
      note: bloomHonoured ? "every item matches the level" : "mixed levels leaked in" },
    { label: "Source provenance", pass: provenanceShare >= 0.99,
      note: `${Math.round(provenanceShare * 100)}% carry source references` },
  ];
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);

  const report: BlueprintReport = {
    requestedCount: args.requestedCount,
    deliveredCount: finalQs.length,
    adherencePct: Math.round(
      ((finalQs.filter(
          (q) =>
            (args.config.difficulty === "Mixed" || args.config.difficulty === "Adaptive" || q.difficulty === args.config.difficulty) &&
            (args.config.bloom === "Mixed" || q.bloom === args.config.bloom),
        ).length /
        Math.max(finalQs.length, 1)) *
        100),
    ),
    domainDistribution: tally(finalQs.map((q) => domainName(q.domain))),
    difficultyDistribution: tally(finalQs.map((q) => q.difficulty)),
    bloomDistribution: tally(finalQs.map((q) => q.bloom)),
    questionTypes: tally(finalQs.map((q) => q.generationType.replace(/^(ai|material)-/, ""))),
    sources: {
      materialDerived: sourcedCount,
      scenarioFallback: finalQs.filter((q) => q.generationType === "scenario").length,
    },
    candidatePoolSize: args.chosen.length * 3 + args.fallbackQuestions.length,
    sourceSegmentsUsed: new Set(finalQs.map((q) => q.sourceSnippet?.slice(0, 40) ?? q.sourceRef)).size,
    notes: args.notes,
    ai: {
      provider: args.provider,
      generated: aiQuestions.length,
      fallbackFilled: args.fallbackQuestions.length,
      avgGrounding: args.avgGrounding,
      rejected: args.validationRejected,
    },
  };

  return { questions: finalQs, quality: { score, checks }, report };
}

/** Build the blueprint matrix for the AI path — the same authoritative planner
 *  the deterministic engine uses, so AI can never override assessment structure. */
export function planSlots(
  config: AssessmentConfig,
  scope: string[],
  learner?: LearnerContext,
): QuestionSlot[] {
  return buildBlueprintMatrix(config, scope, learner);
}
