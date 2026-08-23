// ---------------------------------------------------------------------------
// StatGyan competency engine — deterministic, explainable demo intelligence.
//
// Every function here is a local heuristic provider behind the same interface a
// production LLM service would implement. Outputs are derived from the learner's
// own evidence (scores, answers, uploaded text) rather than fabricated metrics,
// and all quality/projection figures are labelled as heuristic estimates in UI.
// ---------------------------------------------------------------------------

import { findBestCourse } from "./courses";
import type {
  AssessmentConfig,
  Bloom,
  BlueprintReport,
  CompetencyState,
  DocAnalysis,
  GeneratedQuestion,
  GenerationOptions,
  GapItem,
  LearningModule,
  MaterialRecordInput,
  RoleTemplate,
} from "./types";

export interface GenerationResult {
  questions: GeneratedQuestion[];
  quality: { score: number; checks: { label: string; pass: boolean; note: string }[] };
  report: BlueprintReport;
}

// ---------------------------------------------------------------------------
// Domains & roles
// ---------------------------------------------------------------------------

export const DOMAINS = [
  { id: "survey-methodology", name: "Survey Methodology", tagline: "Designing instruments and field operations", weight: 0.9 },
  { id: "sampling-estimation", name: "Sampling & Estimation", tagline: "Selecting units and quantifying precision", weight: 0.95 },
  { id: "data-quality", name: "Data Quality", tagline: "Validation, editing and assurance", weight: 0.95 },
  { id: "statistical-analysis", name: "Statistical Analysis", tagline: "From description to inference", weight: 0.85 },
  { id: "data-visualization", name: "Data Visualization", tagline: "Charts that carry evidence", weight: 0.7 },
  { id: "statistical-computing", name: "Statistical Computing", tagline: "Python, SQL and reproducible workflows", weight: 0.85 },
  { id: "official-statistics", name: "Official Statistics & Standards", tagline: "NSS, SDG indicators and dissemination", weight: 0.8 },
  { id: "governance-ethics", name: "Data Governance & Ethics", tagline: "Confidentiality, consent and stewardship", weight: 0.75 },
];

export const DOMAIN_MAP = new Map(DOMAINS.map((d) => [d.id, d]));
export const domainName = (id: string) => DOMAIN_MAP.get(id)?.name ?? id;

export const ROLES: RoleTemplate[] = [
  {
    id: "statistical-officer",
    title: "Statistical Officer",
    blurb: "Compiles and analyses official statistics",
    baseline: {
      "survey-methodology": 61, "sampling-estimation": 58, "data-quality": 55,
      "statistical-analysis": 82, "data-visualization": 88, "statistical-computing": 76,
      "official-statistics": 68, "governance-ethics": 64,
    },
    focus: ["statistical-analysis", "sampling-estimation"],
  },
  {
    id: "statistical-investigator",
    title: "Statistical Investigator",
    blurb: "Field investigation and primary data collection",
    baseline: {
      "survey-methodology": 76, "sampling-estimation": 64, "data-quality": 48,
      "statistical-analysis": 71, "data-visualization": 58, "statistical-computing": 42,
      "official-statistics": 60, "governance-ethics": 66,
    },
    focus: ["survey-methodology", "data-quality"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "Turns processed data into evidence",
    baseline: {
      "survey-methodology": 55, "sampling-estimation": 62, "data-quality": 70,
      "statistical-analysis": 84, "data-visualization": 80, "statistical-computing": 86,
      "official-statistics": 58, "governance-ethics": 62,
    },
    focus: ["statistical-analysis", "statistical-computing"],
  },
  {
    id: "survey-officer",
    title: "Survey Officer",
    blurb: "Plans and supervises survey operations",
    baseline: {
      "survey-methodology": 84, "sampling-estimation": 72, "data-quality": 66,
      "statistical-analysis": 60, "data-visualization": 55, "statistical-computing": 48,
      "official-statistics": 70, "governance-ethics": 72,
    },
    focus: ["survey-methodology", "sampling-estimation"],
  },
  {
    id: "research-officer",
    title: "Research Officer",
    blurb: "Methodological research and study design",
    baseline: {
      "survey-methodology": 78, "sampling-estimation": 80, "data-quality": 68,
      "statistical-analysis": 88, "data-visualization": 66, "statistical-computing": 70,
      "official-statistics": 74, "governance-ethics": 70,
    },
    focus: ["sampling-estimation", "statistical-analysis"],
  },
  {
    id: "field-enumerator",
    title: "Field Enumerator",
    blurb: "Primary data collection in the field",
    baseline: {
      "survey-methodology": 70, "sampling-estimation": 46, "data-quality": 52,
      "statistical-analysis": 40, "data-visualization": 44, "statistical-computing": 38,
      "official-statistics": 52, "governance-ethics": 60,
    },
    focus: ["survey-methodology", "data-quality"],
  },
  {
    id: "trainer",
    title: "Trainer / Content Manager",
    blurb: "Builds capacity through learning resources",
    baseline: {
      "survey-methodology": 74, "sampling-estimation": 70, "data-quality": 72,
      "statistical-analysis": 76, "data-visualization": 78, "statistical-computing": 66,
      "official-statistics": 76, "governance-ethics": 74,
    },
    focus: ["official-statistics", "data-quality"],
  },
];

export const DEPARTMENTS = [
  "Survey & Data Operations",
  "Economic Statistics Division",
  "Social Statistics Division",
  "Field Operations Wing",
  "Data Processing & IT",
  "Policy & Coordination",
];

export const EXPERIENCE_BANDS = ["0–2 years", "3–5 years", "6–10 years", "10+ years"];

const DEFAULT_TARGET = 80;

/** Role-shaped baseline across every domain. */
export function baselineFor(roleId: string): CompetencyState[] {
  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];
  return DOMAINS.map((d) => ({
    id: d.id,
    score: role.baseline[d.id] ?? 50,
    target:
      role.focus.includes(d.id)
        ? DEFAULT_TARGET + 5
        : DEFAULT_TARGET,
  }));
}

// ---------------------------------------------------------------------------
// Gap analysis — explainable priority scoring
// ---------------------------------------------------------------------------

export interface GapContext {
  primaryDomain?: string;
  secondaryDomains?: string[];
}

export function analyseGaps(
  competencies: CompetencyState[],
  ctx: GapContext,
): GapItem[] {
  const secondary = new Set(ctx.secondaryDomains ?? []);
  return competencies
    .map((c) => {
      const meta = DOMAIN_MAP.get(c.id);
      const gap = c.target - c.score;
      const roleRelevance =
        ctx.primaryDomain === c.id ? 1 : secondary.has(c.id) ? 0.7 : 0.4;
      const importance = meta?.weight ?? 0.7;
      // Explainable weighted priority (0–100)
      const priorityScore = Math.round(
        Math.min(Math.max(gap, 0), 40) * 1.35 * 0.45 +
          roleRelevance * 100 * 0.25 +
          importance * 100 * 0.15 +
          (c.score < 50 ? 15 : 0),
      );
      const severity =
        gap >= 22 ? "Critical" : gap >= 14 ? "High" : gap >= 6 ? "Moderate" : gap > 0 ? "Minor" : "On track";
      return {
        id: c.id,
        name: meta?.name ?? c.id,
        current: c.score,
        target: c.target,
        gap,
        severity,
        priorityScore,
        roleRelevance,
        reasoning: buildReasoning(c, gap, roleRelevance, importance),
      } satisfies GapItem;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

function buildReasoning(
  c: CompetencyState,
  gap: number,
  relevance: number,
  importance: number,
): string {
  if (gap <= 0) {
    return `${c.score}% against a ${c.target}% target — this dimension is at or above requirement. Maintain with periodic refreshers.`;
  }
  const parts: string[] = [];
  if (gap >= 22)
    parts.push(`your proficiency of ${c.score}% sits well below the ${c.target}% standard, a ${gap}-point shortfall`);
  else parts.push(`you are ${gap} points under the ${c.target}% target (${c.score}% currently)`);
  if (relevance >= 0.9)
    parts.push("this is your primary working domain, so the gap directly constrains day-to-day output");
  else if (relevance >= 0.65)
    parts.push("it is a declared secondary domain of your role");
  if (importance >= 0.85)
    parts.push("the system-wide capability plan flags this area as high national importance");
  if (c.score < 50)
    parts.push("foundational fluency here is still forming, which amplifies downstream error risk");
  return `${parts.join("; ")}.`;
}

// ---------------------------------------------------------------------------
// Personalised learning path
// ---------------------------------------------------------------------------

export function buildLearningPath(gaps: GapItem[]): LearningModule[] {
  return gaps
    .filter((g) => g.gap >= 6)
    .slice(0, 4)
    .map((gap, i) => {
      const course = findBestCourse(gap.id);
      const gain = Math.min(16, Math.max(6, gap.gap - 4));
      return {
        order: i + 1,
        title: course?.title ?? `${gap.name} Intensive`,
        domainId: gap.id,
        domainName: gap.name,
        minutes: course?.durationMin ?? 90,
        level: course?.level ?? "Intermediate",
        provider: course ? `iGOT Karmayogi · ${course.provider}` : "StatGyan module",
        why: `Recommended because your profile shows a ${gap.gap}-point gap in ${gap.name.toLowerCase()} (${gap.current}% vs ${gap.target}% target). Closing it lifts readiness where it matters most for your role.`,
        expectedGain: gain,
        projectedAfter: Math.min(gap.target, gap.current + gain),
        courseId: course?.id,
      } satisfies LearningModule;
    });
}

// ---------------------------------------------------------------------------
// Document intelligence & MCQ generation
// ---------------------------------------------------------------------------

const LEXICON: Record<string, { topicTerms: string[]; concepts: string[] }> = {
  [DOMAINS[0].id]: {
    topicTerms: ["questionnaire", "interview", "respondent", "recall period", "mode effect", "pretest", "enumerat", "non-response", "follow-up"],
    concepts: ["Cognitive interviewing", "Recall decay", "Mode effects", "Context priming", "Field protocols"],
  },
  [DOMAINS[1].id]: {
    topicTerms: ["stratif", "cluster", "sample size", "frame", "weight", "standard error", "confidence", "estimat", "random", "margin of error", "design effect"],
    concepts: ["Strata homogeneity", "Intra-cluster correlation", "Survey weighting", "Confidence intervals", "Design effect"],
  },
  [DOMAINS[2].id]: {
    topicTerms: ["validation", "edit", "outlier", "duplicate", "metadata", "quality gate", "consistency check", "missing"],
    concepts: ["Range validation", "Consistency edits", "Outlier documentation", "Duplicate detection", "Quality gates"],
  },
  [DOMAINS[3].id]: {
    topicTerms: ["mean", "median", "regression", "hypothesis", "significan", "seasonal", "index", "inference", "distribution"],
    concepts: ["Robust central tendency", "p-value interpretation", "Seasonal adjustment", "Design-based inference"],
  },
  [DOMAINS[4].id]: {
    topicTerms: ["chart", "axis", "colour scale", "choropleth", "legend", "dashboard", "visual"],
    concepts: ["Encoding channels", "Perceptually uniform scales", "Small multiples", "Axis integrity"],
  },
  [DOMAINS[5].id]: {
    topicTerms: ["python", "sql", "script", "pandas", "join", "groupby", "vectoris", "vectoriz", "automation", "pipeline", "csv"],
    concepts: ["Vectorised processing", "Reproducible pipelines", "Join semantics", "Missing-data handling"],
  },
  [DOMAINS[6].id]: {
    topicTerms: ["sdg", "indicator", "classification", "nic", "nso", "mospi", "dissemination", "revision policy", "standard", "open data"],
    concepts: ["UN Fundamental Principles", "Standard classifications", "Revisions policy", "Open dissemination"],
  },
  [DOMAINS[7].id]: {
    topicTerms: ["confidential", "consent", "disclosure", "privacy", "anonym", "ethic", "stewardship", "microdata"],
    concepts: ["Statistical confidentiality", "Disclosure control", "Informed consent", "Formal privacy"],
  },
};

function detectDomains(lower: string): { id: string; hits: number }[] {
  return Object.entries(LEXICON)
    .map(([id, lex]) => ({ id, hits: lex.topicTerms.filter((t) => lower.includes(t)).length }))
    .sort((a, b) => b.hits - a.hits);
}

/** Evidence-based mapping confidence: term-hit share relative to the strongest domain. */
function domainConfidence(hits: number, maxHits: number): number {
  return Math.round((0.45 + 0.5 * (hits / Math.max(maxHits, 1))) * 100) / 100;
}

export function analyzeDocument(input: {
  fileName: string;
  fileType: string;
  text: string;
}): DocAnalysis {
  // Real extraction whenever we obtained usable text (TXT/CSV/MD/JSON natively,
  // PDF via pdf.js); only truly unparseable binaries fall back to filename-driven
  // analysis, which is honestly labelled "simulated extraction".
  const hasText = input.text.trim().length > 0;
  const source = hasText ? input.text : input.fileName.replace(/[_-]/g, " ");
  const lower = source.toLowerCase();
  const words = source.split(/\s+/).filter(Boolean).length;
  const detected = detectDomains(lower).filter((d) => d.hits > 0).slice(0, 4);
  const maxHits = detected[0]?.hits ?? 1;
  const domains = detected.map((d) => domainName(d.id));
  const domainConfidences = detected.map((d) => ({
    name: domainName(d.id),
    confidence: domainConfidence(d.hits, maxHits),
  }));

  const concepts = Array.from(
    new Set(
      detected.flatMap((d) =>
        LEXICON[d.id].concepts.filter((c) =>
          c.split(" ").some((w) => lower.includes(w.toLowerCase().slice(0, 6))),
        ),
      ),
    ),
  ).slice(0, 10);

  const headings = hasText
    ? Array.from(source.matchAll(/^CHAPTER[^\n]*|^[A-Z][A-Z \-&]{8,}$/gm)).map((m) => m[0].trim())
    : [];
  const topics = [...new Set([...domains, ...headings.slice(0, 3)])].slice(0, 6);

  const objectives = [
    `Explain the core principles of ${topics[0]?.toLowerCase() ?? "the subject"} presented in this material`,
    topics[1]
      ? `Apply the documented guidance on ${topics[1].toLowerCase()} in field or processing settings`
      : `Relate the material's procedures to your divisional workflow`,
    `Identify the common errors this material warns against and their remedies`,
  ];

  const difficulty: Difficulty = words > 900 || lower.includes("advanced") ? "Hard" : words > 300 ? "Medium" : "Easy";
  const questionOpportunities = Math.min(
    120,
    concepts.length * 4 + Math.round(words / 60) + detected.reduce((s, d) => s + d.hits, 0),
  );

  return {
    title: guessTitle(input.fileName, headings),
    wordCount: words,
    simulatedExtraction: !hasText,
    topics: topics.length ? topics : ["General statistical practice"],
    concepts: concepts.length ? concepts : ["Applied statistical procedure"],
    objectives,
    domains: domains.length ? domains : ["Official Statistics & Standards"],
    domainConfidences: domainConfidences.length
      ? domainConfidences
      : [{ name: "Official Statistics & Standards", confidence: 0.45 }],
    questionOpportunities,
    difficulty,
  };
}

function guessTitle(fileName: string, headings: string[]): string {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
  return base.length > 3 ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : headings[0] ?? "Untitled material";
}

// --- Blueprint-aware generation ---------------------------------------------
// BLUEPRINT → plan (per-domain quotas × difficulty × Bloom) → candidate pool
// (material-grounded first, curated bank only as labelled fallback) → seeded
// selection with session rotation → validation that reports what was honoured.

type Difficulty = "Easy" | "Medium" | "Hard";

interface ScenarioSeed {
  domain: string;
  difficulty: Difficulty;
  bloom: "Recall" | "Understanding" | "Application" | "Analysis";
  q: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

/** Curated scenario bank — used alongside grounded cloze items. */
const SCENARIO_BANK: ScenarioSeed[] = [
  {
    domain: "survey-methodology", difficulty: "Medium", bloom: "Application",
    q: "Enumerators report that respondents in one district consistently refuse the income question. The best first response is to…",
    options: ["Delete the question", "Retrain on purpose-of-use messaging and re-test wording", "Impute incomes administratively", "Skip the district"],
    correctIndex: 1,
    explanation: "Refusals often trace to perceived risk; clarifying confidentiality and re-testing neutral wording addresses cause, not symptom.",
  },
  {
    domain: "survey-methodology", difficulty: "Easy", bloom: "Recall",
    q: "Which questionnaire feature most reduces respondent burden?",
    options: ["Longer reference periods", "Routing patterns that skip irrelevant sections", "More open-ended questions", "Double-barrelled wording"],
    correctIndex: 1,
    explanation: "Skips tailor the path so respondents only answer what applies to them.",
  },
  {
    domain: "sampling-estimation", difficulty: "Hard", bloom: "Analysis",
    q: "An estimate must be published for each of 30 small districts, but only the national sample was drawn. The soundest approach is…",
    options: [
      "Publish national estimates repeated per district",
      "Use small-area estimation models borrowing strength across districts",
      "Halve the confidence intervals",
      "Collect a convenience sample locally",
    ],
    explanation: "Small-area estimation borrows cross-area information to produce defensible local estimates where direct samples are too thin.",
    correctIndex: 1,
  },
  {
    domain: "data-quality", difficulty: "Easy", bloom: "Recall",
    q: "During editing you find incomes recorded as 9999999 across many records. This most likely indicates…",
    options: ["Extreme wealth concentration", "A missing-value sentinel code entering raw data", "Currency conversion error", "Fraud"],
    correctIndex: 1,
    explanation: "Sentinel codes for 'not reported' commonly leak into numeric fields; they need explicit recoding before analysis.",
  },
  {
    domain: "data-quality", difficulty: "Medium", bloom: "Application",
    q: "Two rounds of a survey show a sudden 15-point jump in a metric with no real-world event. Your first diagnostic should be…",
    options: ["Announce the jump publicly", "Audit collection instruments and processing between rounds", "Average away the difference", "Blame respondents"],
    correctIndex: 1,
    explanation: "Unexplained discontinuities usually trace to instrument, mode or processing changes before they reflect reality.",
  },
  {
    domain: "statistical-analysis", difficulty: "Medium", bloom: "Analysis",
    q: "A district's average yield rises while its median falls. The likeliest story is…",
    options: ["Everyone prospered equally", "A few very large farms pulled the mean upward", "The median is wrong", "Data entry improved"],
    correctIndex: 1,
    explanation: "Mean–median divergence in opposite directions signals right-skew introduced by extreme values.",
  },
  {
    domain: "statistical-computing", difficulty: "Medium", bloom: "Understanding",
    q: "Your merge produces far more rows than either input. The classic culprit is…",
    options: ["Duplicate keys on one or both sides", "Too many columns", "Wrong file encoding", "Using groupby"],
    correctIndex: 0,
    explanation: "One-to-many key duplication explodes joins; validate key uniqueness before merging.",
  },
  {
    domain: "official-statistics", difficulty: "Hard", bloom: "Application",
    q: "A minister requests preliminary GDP figures two weeks earlier than scheduled. Under sound statistical practice you should…",
    options: [
      "Release immediately without review",
      "Offer the already-scheduled advance estimate and explain its accuracy trade-off",
      "Refuse and escalate politically",
      "Fabricate an estimate quietly",
    ],
    correctIndex: 1,
    explanation: "Impartial release practices balance timeliness with accuracy transparently — never ad-hoc acceleration outside policy.",
  },
];

// Deterministic identity: stable across sessions, unique per stem+source.
function stableId(...parts: string[]): string {
  return fnv1a(parts.join("¦")).toString(36);
}

function fnv1a(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32): controlled variation — reproducible, debuggable,
 *  never Math.random(). The seed derives from material + blueprint + generation
 *  number, so identical inputs reproduce identically while each new generation
 *  rotates deterministically. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PROCEDURAL = /\b(should|must|apply|ensure|when|before|after|procedure|step|practice|use)\b/i;
const CAUSAL = /\b(because|therefore|however|whereas|leads to|results in|due to|rather than|implies|indicates)\b/i;
const DEFINITIONAL = /\b(is|are|refers to|means|defined as)\b/i;

function naturalBloom(sentence: string, wc: number): Bloom {
  if (PROCEDURAL.test(sentence)) return "Application";
  if (CAUSAL.test(sentence)) return "Analysis";
  if (wc <= 18) return "Recall";
  return "Understanding";
}

function naturalDifficulty(wc: number): Difficulty {
  return wc <= 18 ? "Easy" : wc >= 32 ? "Hard" : "Medium";
}

/** Two stem framings per Bloom level so the same source sentence can yield
 *  differently-phrased items across generations (variant chosen by stable hash). */
const STEMS: Record<Bloom, [string, string]> = {
  Recall: ['Complete, exactly as the material states it — “', 'As written in the source, the missing term is — “'],
  Understanding: ['Per the material, the concept completing this statement is — “', 'Which term makes this statement correct according to the source? “'],
  Application: ['Applying the material’s guidance, the blank is filled by — “', 'Following the documented procedure, the missing element is — “'],
  Analysis: ['Reading the causal relationship described in the material, the gap is filled by — “', 'Per the source’s reasoning, this statement completes as — “'],
};

// --- Material segmentation ---------------------------------------------------
// Extracted text carries provenance markers written by the ingestion pipelines
// ([Page N] from pdf.js, [Slide N] from PPTX, [Section: …] from DOCX headings).
// Each segment keeps its own provenance so questions cite their true origin.

interface Segment {
  label: string; // human-readable provenance, e.g. "p. 4"
  body: string;
}

export function segmentMaterial(text: string): Segment[] {
  const markerRe = /\[(?:Page (\d+)|Slide (\d+)|Section: ([^\]]+))\]/g;
  const marks: { index: number; end: number; label: string }[] = [];
  for (const m of text.matchAll(markerRe)) {
    const label = m[3]
      ? `section “${m[3].trim()}”`
      : m[1]
        ? `p. ${m[1]}`
        : `slide ${m[2]}`;
    marks.push({ index: m.index, end: m.index + m[0].length, label });
  }
  if (marks.length === 0) {
    // Plain text (TXT/MD/CSV/JSON): paragraph blocks, document-level provenance.
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.split(/\s+/).length >= 10)
      .map((body) => ({ label: "document", body }));
  }
  const segments: Segment[] = [];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].end;
    const stop = i + 1 < marks.length ? marks[i + 1].index : text.length;
    const body = text.slice(start, stop).trim();
    if (body.split(/\s+/).length >= 8) segments.push({ label: marks[i].label, body });
  }
  const head = marks.length ? text.slice(0, marks[0].index).trim() : "";
  if (head.split(/\s+/).length >= 10) segments.unshift({ label: "document", body: head });
  return segments;
}

/** Build every valid material-grounded candidate. One candidate per
 *  (sentence × concept-occurrence); Bloom/difficulty are tagged from the
 *  sentence's own linguistic evidence so blueprint slots can match exactly. */
/** Distractor vocabulary: readable terminology from the answer's own domain
 *  (curated concepts + longer topic terms), sprinkled with concepts the
 *  document-intelligence pass extracted elsewhere in the material. Rotated
 *  deterministically per item so option sets vary question to question. */
function buildDistractors(
  domId: string,
  answer: string,
  materialConcepts: string[],
  rot: number,
): string[] {
  const lex = LEXICON[domId];
  const seen = new Set([answer.toLowerCase()]);
  const ordered: string[] = [];
  const own = [...lex.concepts, ...lex.topicTerms.filter((t) => t.length >= 5)];
  const start = rot % Math.max(own.length, 1);
  for (let i = 0; i < own.length; i++) ordered.push(own[(start + i) % own.length]!);
  if (materialConcepts.length) {
    ordered.splice(1, 0, materialConcepts[(rot >>> 2) % materialConcepts.length]!);
  }
  const picks: string[] = [];
  for (const raw of ordered) {
    const t = raw.charAt(0).toUpperCase() + raw.slice(1);
    if (seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    picks.push(t);
    if (picks.length === 3) break;
  }
  return picks;
}

function buildMaterialPool(material: MaterialRecordInput | null): GeneratedQuestion[] {
  if (!material?.text || material.simulatedExtraction) return [];
  const out: GeneratedQuestion[] = [];
  const materialConcepts = material.concepts ?? [];
  for (const seg of segmentMaterial(material.text)) {
    for (const raw of seg.body.split(/(?<=[.!?])\s+/)) {
      const sentence = raw.trim();
      if (!/[a-zA-Z]{3}/.test(sentence)) continue;
      const wc = sentence.split(/\s+/).length;
      if (wc < 8 || wc > 45) continue;
      const bloom = naturalBloom(sentence, wc);
      const difficulty = naturalDifficulty(wc);
      const generationType: GeneratedQuestion["generationType"] =
        bloom === "Application"
          ? "material-procedure"
          : bloom === "Analysis"
            ? "material-causal"
            : DEFINITIONAL.test(sentence)
              ? "material-definition"
              : "material-cloze";
      const rot = fnv1a(sentence);
      const lowerSentence = sentence.toLowerCase();
      // One candidate per matching domain per sentence. The masked anchor is
      // REAL source text — a verbatim concept when present, otherwise the
      // domain topic term the sentence actually uses (word-boundary safe).
      for (const [domId, lex] of Object.entries(LEXICON)) {
        let anchor: string | null = null;
        for (const concept of lex.concepts) {
          if (lowerSentence.includes(concept.toLowerCase())) {
            anchor = concept;
            break;
          }
        }
        if (!anchor) {
          const term = [...lex.topicTerms]
            .sort((a, b) => b.length - a.length)
            .find((t) => lowerSentence.includes(t));
          if (term) {
            const idx = lowerSentence.indexOf(term);
            let sIdx = idx;
            let eIdx = idx + term.length;
            while (sIdx > 0 && /[\w-]/.test(sentence[sIdx - 1]!)) sIdx--;
            while (eIdx < sentence.length && /[\w-]/.test(sentence[eIdx]!)) eIdx++;
            anchor = sentence.slice(sIdx, eIdx);
          }
        }
        if (!anchor || anchor.length < 3) continue;
        const cloze = sentence.replace(new RegExp(escapeRe(anchor), "i"), "______");
        if (cloze === sentence) continue;
        const picks = buildDistractors(domId, anchor, materialConcepts, rot);
        if (picks.length < 3) continue;
        const variant = rot % 2;
        const text = `${STEMS[bloom][variant]}${cloze}”`;
        const provenance = seg.label === "document" ? material.title : `${material.title} · ${seg.label}`;
        out.push({
          id: stableId("mat", text, provenance),
          text,
          options: [anchor, ...picks],
          correctIndex: 0,
          explanation: `The material states${seg.label === "document" ? "" : ` (${seg.label})`}: “${sentence}”`,
          sourceRef: `Uploaded material · ${provenance}`,
          domain: domId,
          difficulty,
          bloom,
          generationType,
          sourceSnippet: sentence.slice(0, 220),
        });
        break; // one candidate per lexicon domain per sentence
      }
      if (out.length > 400) break;
    }
    if (out.length > 400) break;
  }
  return out;
}

function scenarioCandidate(s: ScenarioSeed): GeneratedQuestion {
  return {
    id: stableId("scn", s.q),
    text: s.q,
    options: [...s.options],
    correctIndex: s.correctIndex,
    explanation: s.explanation,
    sourceRef: "Curated scenario bank · StatGyan",
    domain: s.domain,
    difficulty: s.difficulty,
    bloom: s.bloom,
    generationType: "scenario",
  };
}

export function generateAssessment(
  material: MaterialRecordInput | null,
  config: AssessmentConfig,
  options: GenerationOptions = { generationNumber: 1 },
): GenerationResult {
  // Seed derives from material identity + blueprint + generation counter, so
  // generation #1 ≠ generation #2 while identical inputs stay reproducible.
  const seed = fnv1a(
    [
      material?.title ?? "scenario-bank",
      material?.fileName ?? "",
      String(config.count),
      config.difficulty,
      config.bloom,
      config.domains.join("+"),
      String(options.generationNumber),
    ].join("|"),
  );
  const rng = makeRng(seed);
  const exclude = new Set(options.excludeIds ?? []);

  const materialPool = seededShuffle(buildMaterialPool(material), rng);
  const scenarioPool = SCENARIO_BANK.map(scenarioCandidate);

  // Blueprint domain scope: explicit selection > material coverage > full taxonomy.
  const materialDomains = material?.text
    ? detectDomains(material.text.toLowerCase()).filter((d) => d.hits > 0).map((d) => d.id)
    : [];
  const scope = config.domains.length
    ? config.domains
    : material && materialDomains.length
      ? materialDomains
      : Object.keys(LEXICON);

  const notes: string[] = [];
  const noteOnce = (set: Set<string>, key: string, msg: string) => {
    if (!set.has(key)) {
      set.add(key);
      notes.push(msg);
    }
  };
  const noted = new Set<string>();

  // Plan: difficulty/Bloom "Mixed" cycles through all levels; fixed values pin
  // every slot. Slots interleave domains so quotas distribute evenly.
  const diffPlan: Difficulty[] =
    config.difficulty === "Mixed" || config.difficulty === "Adaptive"
      ? ["Easy", "Medium", "Hard"]
      : [config.difficulty as Difficulty];
  const bloomPlan: Bloom[] =
    config.bloom === "Mixed"
      ? ["Recall", "Understanding", "Application", "Analysis"]
      : [config.bloom as Bloom];
  const slots = Array.from({ length: config.count }, (_, i) => ({
    domain: scope[i % scope.length],
    difficulty: diffPlan[i % diffPlan.length],
    bloom: bloomPlan[i % bloomPlan.length],
  }));

  const slotFits = (c: GeneratedQuestion, s: (typeof slots)[number]) =>
    c.domain === s.domain && diffPlan.includes(c.difficulty as Difficulty) && bloomPlan.includes(c.bloom);
  const levelFits = (c: GeneratedQuestion) =>
    diffPlan.includes(c.difficulty as Difficulty) && bloomPlan.includes(c.bloom);
  const fresh = (c: GeneratedQuestion) => c && !exclude.has(c.id);

  const picked: GeneratedQuestion[] = [];
  const used = new Set<string>();
  let materialDerived = 0;
  let scenarioFallback = 0;
  const domainShortfall = new Set<string>();

  for (const slot of slots) {
    if (picked.length >= config.count) break;
    // Priority ladder — material always outranks the bank when any fresh
    // candidate exists; deviations are disclosed in report notes, never silent.
    // 1) Material-grounded candidate matching the full slot contract…
    let c: GeneratedQuestion | undefined = materialPool.find(
      (x) => slotFits(x, slot) && !used.has(x.id) && fresh(x),
    );
    let source: "material" | "scenario" = "material";
    // 2) …then a curated scenario matching the same contract.
    if (!c) {
      c = scenarioPool.find((x) => slotFits(x, slot) && !used.has(x.id) && fresh(x));
      source = "scenario";
    }
    // 3) Any remaining material candidate — source dominance beats perfect
    //    level matching, but the deviation is reported.
    if (!c) {
      c = materialPool.find((x) => !used.has(x.id) && fresh(x));
      if (c) {
        source = "material";
        if (c.domain !== slot.domain) {
          noteOnce(noted, `dom-${slot.domain}`,
            `${domainName(slot.domain)} could not fill its full quota from this source — covered from neighbouring material content.`);
          domainShortfall.add(slot.domain);
        }
        if (!levelFits(c)) {
          noteOnce(noted, "mat-level",
            "The material could not fill every slot at the exact requested difficulty/level, so remaining grounded questions were preferred over generic bank items.");
        }
      }
    }
    // 4) Relaxed scenario (any domain/level).
    if (!c) {
      c = scenarioPool.find((x) => !used.has(x.id) && fresh(x));
      if (c) {
        source = "scenario";
        noteOnce(noted, "bank-relaxed",
          "Some slots were filled from the curated scenario bank because the uploaded material does not cover every requested domain at the requested levels.");
      }
    }
    // 5) Rotation: pool exhausted across generations — reuse previously seen
    //    candidates rather than fabricating unsupported questions.
    if (!c) {
      c = materialPool.find((x) => slotFits(x, slot) && !used.has(x.id))
        ?? scenarioPool.find((x) => slotFits(x, slot) && !used.has(x.id));
      if (c) {
        source = c.generationType === "scenario" ? "scenario" : "material";
        noteOnce(noted, "rotated",
          "The candidate pool was exhausted, so earlier candidates rotated back in — no filler questions were invented.");
      }
    }
    if (!c) break;
    used.add(c.id);
    picked.push(c);
    if (source === "material") materialDerived++;
    else scenarioFallback++;
  }

  // Randomized flag: shuffle question order and option order (remapping the
  // correct index), deterministically from the same seed.
  let finalQs = picked;
  if (config.randomized) {
    finalQs = seededShuffle(picked, rng).map((q) => {
      const order = seededShuffle(q.options.map((t, i) => ({ t, i })), rng);
      return {
        ...q,
        options: order.map((o) => o.t),
        correctIndex: order.findIndex((o) => o.i === q.correctIndex),
      };
    });
  }

  if (finalQs.length < config.count) {
    notes.push(
      `Only ${finalQs.length} high-confidence question${finalQs.length === 1 ? "" : "s"} could be built for this blueprint — none were fabricated to reach ${config.count}.`,
    );
  }

  // --- Real quality audit: checks reflect the delivered output, not wishes ---
  const stems = new Set(finalQs.map((q) => q.text.toLowerCase()));
  const dupes = finalQs.length - stems.size;
  const badOptions = finalQs.filter(
    (q) =>
      new Set(q.options).size !== q.options.length ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length,
  ).length;
  const offDomain = finalQs.filter((q) => !scope.includes(q.domain)).length;
  const difficultyHonoured =
    config.difficulty === "Mixed" || config.difficulty === "Adaptive" ||
    finalQs.every((q) => q.difficulty === config.difficulty);
  const bloomHonoured =
    config.bloom === "Mixed" || finalQs.every((q) => q.bloom === config.bloom);

  const checks = [
    {
      label: "Requested count",
      pass: finalQs.length === config.count,
      note: `${finalQs.length}/${config.count} delivered`,
    },
    {
      label: "Domain blueprint",
      pass: offDomain === 0 && domainShortfall.size === 0,
      note:
        offDomain === 0 && domainShortfall.size === 0
          ? `All ${finalQs.length} within requested domains`
          : `${offDomain} outside scope · ${domainShortfall.size} domain(s) under-filled`,
    },
    {
      label: "Difficulty respected",
      pass: difficultyHonoured,
      note: difficultyHonoured
        ? config.difficulty === "Mixed" || config.difficulty === "Adaptive"
          ? "Mixed distribution as planned"
          : `Every item is ${config.difficulty}`
        : `Some items deviate from ${config.difficulty}`,
    },
    {
      label: "Cognitive level respected",
      pass: bloomHonoured,
      note: bloomHonoured
        ? config.bloom === "Mixed"
          ? "Levels distributed as planned"
          : `Every item targets ${config.bloom}`
        : `Some items deviate from ${config.bloom}`,
    },
    {
      label: "No duplicate stems",
      pass: dupes === 0,
      note: dupes === 0 ? "All stems unique" : `${dupes} near-duplicates found`,
    },
    {
      label: "Option integrity",
      pass: badOptions === 0,
      note: badOptions === 0 ? "Unique options, exactly one answer each" : `${badOptions} item(s) with malformed options`,
    },
    {
      label: "Source provenance",
      pass: material ? materialDerived >= scenarioFallback : true,
      note: material
        ? `${materialDerived}/${finalQs.length} derived from the uploaded material${scenarioFallback ? ` · ${scenarioFallback} bank fallback` : ""}`
        : `${finalQs.length}/${finalQs.length} from the curated scenario bank (no material selected)`,
    },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  const tally = (get: (q: GeneratedQuestion) => string) => {
    const m = new Map<string, number>();
    for (const q of finalQs) m.set(get(q), (m.get(get(q)) ?? 0) + 1);
    return Array.from(m.entries()).map(([label, count]) => ({ label, count }));
  };

  const report: BlueprintReport = {
    requestedCount: config.count,
    deliveredCount: finalQs.length,
    domainDistribution: tally((q) => domainName(q.domain)),
    difficultyDistribution: tally((q) => q.difficulty),
    bloomDistribution: tally((q) => q.bloom),
    sources: { materialDerived, scenarioFallback },
    notes,
  };

  return {
    questions: finalQs,
    quality: { score, checks },
    report,
  };
}


