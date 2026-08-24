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
  LearnerContext,
  LearningModule,
  MaterialRecordInput,
  QuestionSlot,
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
  {
    domain: "data-visualization", difficulty: "Easy", bloom: "Recall",
    q: "Which encoding choice most risks misleading readers of a choropleth map?",
    options: ["Unclassed colour scales with extreme outliers", "A sequential perceptually uniform palette", "Labelled class breaks in the legend", "Normalising by area population"],
    correctIndex: 0,
    explanation: "Uncoloured raw scales let one extreme region dominate the palette, implying gradient patterns that do not exist.",
  },
  {
    domain: "data-visualization", difficulty: "Medium", bloom: "Application",
    q: "A dashboard must compare 14 indicators across 5 states without overwhelming users. The soundest design is…",
    options: ["One dense chart with all 70 series", "Small multiples with shared scales and a consistent colour key", "A different chart type per indicator", "Rotating animations per state"],
    correctIndex: 1,
    explanation: "Small multiples preserve comparability through shared axes and keys while keeping each panel readable.",
  },
  {
    domain: "data-governance", difficulty: "Medium", bloom: "Application",
    q: "A researcher requests microdata that includes village identifiers alongside household incomes. Under disclosure-control practice you should…",
    options: [
      "Release as-is since it is already collected",
      "Assess re-identification risk and apply perturbation, suppression or access controls before any release",
      "Remove only names and phone numbers",
      "Refuse all microdata requests permanently",
    ],
    correctIndex: 1,
    explanation: "Indirect identifiers can re-identify households; formal risk assessment and statistical disclosure control precede any release.",
  },
  {
    domain: "data-governance", difficulty: "Hard", bloom: "Analysis",
    q: "Public tables were produced from a file where one district contributes 80% of records for a rare category. The most likely statistical consequence is…",
    options: ["No consequence; totals remain correct", "Disclosure risk because small counts can be attributed back to contributors", "Faster publication schedules", "Improved precision for that district"],
    correctIndex: 1,
    explanation: "Dominance in rare cells makes contributor attribution feasible — exactly the risk dominance rules and suppression address.",
  },
  {
    domain: "statistical-analysis", difficulty: "Hard", bloom: "Understanding",
    q: "A time series shows every December spike across ten years. Before interpreting December levels as economic growth you should…",
    options: ["Publish December values alone", "Apply seasonal adjustment so year-on-year comparisons are like-for-like", "Delete Decembers from the data", "Average all months into one figure"],
    correctIndex: 1,
    explanation: "Seasonal adjustment removes recurring calendar effects so underlying movement is comparable across periods.",
  },
  {
    domain: "statistical-computing", difficulty: "Hard", bloom: "Analysis",
    q: "A pipeline produces slightly different estimates on each rerun with unchanged inputs. The first defect to suspect is…",
    options: ["Non-deterministic ordering — e.g. iterating an unordered set before aggregation", "Too many rows", "Incorrect CSV quoting", "A slow disk"],
    correctIndex: 0,
    explanation: "Unstable iteration order over unordered collections is the classic cause of run-to-run drift; enforce deterministic sorting.",
  },
  {
    domain: "survey-methodology", difficulty: "Medium", bloom: "Understanding",
    q: "Why does switching data-collection mode mid-round threaten a survey's estimates?",
    options: ["Modes cost different amounts", "Mode effects change responses, so mixing modes can bias trend comparisons", "Interviewers prefer one mode", "It does not affect estimates at all"],
    correctIndex: 1,
    explanation: "Mode effects shift measurement error structures; unmanaged switches break comparability across rounds.",
  },
  {
    domain: "official-statistics", difficulty: "Easy", bloom: "Recall",
    q: "Which principle requires that official statistics be released on a pre-announced schedule available to all users?",
    options: ["Equal and ready access to official statistics", "Cost recovery for dissemination", "Respondent consent", "Microdata linkage"],
    correctIndex: 0,
    explanation: "Pre-announced, impartial release schedules are core to equal access under the UN Fundamental Principles.",
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

// --- Document knowledge extraction -------------------------------------------
// Deterministic, local parsing of extracted text into typed learning signals.
// Every question the engine produces traces back to one of these structures —
// nothing is invented beyond the source.

type KnowledgeKind =
  | "definition"
  | "procedure"
  | "causal"
  | "contrast"
  | "numerical"
  | "rule"
  | "example";

interface SentenceKnowledge {
  segKey: string;
  segLabel: string;
  sentence: string;
  kind: KnowledgeKind;
  domains: string[];
  subject?: string;
  predicate?: string;
  cause?: string;
  effect?: string;
  value?: string;
}

const RE_DEF = /\b(is|are)\s+(?:defined\s+as\b|referred\s+to\s+as\b)?|\brefers\s+to\b|\bmeans\b/i;
const RE_CAUSAL = /\b(because|therefore|leads to|results in|due to|can inflate|may bias|distort|undermine)\b/i;
const RE_CONTRAST = /\b(whereas|unlike|in contrast|compared to|rather than)\b/i;
const RE_EXAMPLE = /\b(for example|such as|e\.g\.)\b/i;
const RE_RULE = /\b(must|required|not allowed|may not|is required)\b/i;
const RE_PROCEDURAL = /\b(should|must|apply|ensure|before|after|first|next|then|validate|review|document)\b/i;
const RE_NUM = /\b\d+(?:[.,]\d+)?\s?(?:%|per cent|percent)?\b/;

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const trimClause = (s: string) => s.replace(/\s+/g, " ").replace(/[.,;:]$/, "").trim();

function splitAround(sentence: string, re: RegExp): { left: string; right: string } | null {
  const m = re.exec(sentence);
  if (!m || m.index === undefined) return null;
  return { left: trimClause(sentence.slice(0, m.index)), right: trimClause(sentence.slice(m.index + m[0].length)) };
}

function extractKnowledge(segments: Segment[]): SentenceKnowledge[] {
  const out: SentenceKnowledge[] = [];
  segments.forEach((seg, si) => {
    const segKey = `seg${si}`;
    for (const raw of seg.body.split(/(?<=[.!?])\s+/)) {
      const sentence = trimClause(raw);
      const wc = sentence.split(/\s+/).length;
      if (wc < 8 || wc > 60 || !/[a-zA-Z]{3}/.test(sentence)) continue;
      const lower = sentence.toLowerCase();
      const domains = Object.entries(LEXICON)
        .filter(([, lex]) =>
          lex.topicTerms.some((t) => lower.includes(t)) ||
          lex.concepts.some((c) => lower.includes(c.toLowerCase())),
        )
        .map(([id]) => id)
        .slice(0, 2);
      const base = { segKey, segLabel: seg.label, sentence, domains };

      const defSplit = RE_DEF.exec(sentence);
      if (defSplit && defSplit.index > 6) {
        out.push({
          ...base,
          kind: "definition",
          subject: trimClause(sentence.slice(0, defSplit.index)),
          predicate: trimClause(sentence.slice(defSplit.index + defSplit[0].length)),
        });
        continue;
      }
      const causalSplit = splitAround(sentence, RE_CAUSAL);
      if (causalSplit && causalSplit.left.length > 10 && causalSplit.right.length > 10) {
        out.push({ ...base, kind: "causal", cause: causalSplit.left, effect: cap(causalSplit.right) });
        continue;
      }
      if (RE_CONTRAST.test(sentence)) {
        out.push({ ...base, kind: "contrast", subject: trimClause(splitAround(sentence, RE_CONTRAST)?.left ?? "") });
        continue;
      }
      const exSplit = splitAround(sentence, RE_EXAMPLE);
      if (exSplit && exSplit.right.length > 8) {
        out.push({ ...base, kind: "example", subject: exSplit.left, predicate: trimClause(exSplit.right) });
        continue;
      }
      if (RE_RULE.test(sentence)) out.push({ ...base, kind: "rule" });
      else if (RE_PROCEDURAL.test(sentence)) out.push({ ...base, kind: "procedure" });
      const num = RE_NUM.exec(sentence);
      if (num) out.push({ ...base, kind: "numerical", value: num[0].trim() });
    }
  });
  return out;
}

// --- Near-duplicate protection -------------------------------------------------

const STOPWORDS = new Set(
  "the a an of to in on for and or is are be been by with as that this it its from at which what who whom whose how why per according material states source following based should must".split(" "),
);

/** Normalized word-bag fingerprint: catches same-question-different-punctuation
 *  while keeping genuinely different masks of one sentence distinguishable. */
export function fingerprint(text: string): string {
  const normalized = text
    .replace(/_{3,}/g, " blanktoken ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .sort()
    .join("·");
  return normalized;
}

// --- Blueprint matrix ----------------------------------------------------------
// Largest-remainder allocation: percentages become integer quotas that always
// sum exactly to the requested count, with rounding handed to the largest
// fractional remainders. No negative quotas, no lost questions.

function largestRemainder(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + Math.max(b, 0), 0);
  if (total <= 0 || sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (Math.max(w, 0) / sum) * total);
  const base = raw.map(Math.floor);
  let remaining = total - base.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; k < order.length && remaining > 0; k++, remaining--) {
    base[order[k].i]! += 1;
  }
  return base;
}

const ALL_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const ALL_BLOOMS: Bloom[] = ["Recall", "Understanding", "Application", "Analysis"];

/** Evidence-driven Adaptive difficulty: larger measured competency gaps skew a
 *  progression toward accessible levels; strong profiles are pushed harder.
 *  Without learner evidence it falls back to balanced Mixed — never random. */
function adaptiveDifficultyWeights(learner?: LearnerContext): number[] {
  const gap = learner?.averageGap;
  if (gap === undefined || gap === null) return [1, 1, 1];
  if (gap >= 20) return [3, 2, 0.5];
  if (gap >= 10) return [1.5, 2.5, 1];
  return [0.5, 2, 2.5];
}

/** Build the full slot matrix: domain quotas × difficulty quotas × Bloom quotas.
 *  Marginals are allocated GLOBALLY first (so Mixed always yields, say, a
 *  fair share of Hard items regardless of how many domains are selected), then
 *  merged greedily per slot — always exhausting the largest remaining budget.
 *  Works for any count; every marginal sums exactly to config.count. */
export function buildBlueprintMatrix(
  config: AssessmentConfig,
  scope: string[],
  learner?: LearnerContext,
): QuestionSlot[] {
  if (scope.length === 0 || config.count <= 0) return [];
  const diffPlan: Difficulty[] =
    config.difficulty === "Mixed" || config.difficulty === "Adaptive"
      ? ALL_DIFFICULTIES
      : [config.difficulty as Difficulty];
  const bloomPlan: Bloom[] = config.bloom === "Mixed" ? ALL_BLOOMS : [config.bloom as Bloom];
  const diffWeights =
    config.difficulty === "Adaptive" && diffPlan.length > 1
      ? adaptiveDifficultyWeights(learner)
      : diffPlan.map(() => 1);

  // Global marginals — exact integer budgets per dimension.
  const domainBudgets = largestRemainder(config.count, scope.map(() => 1));
  const diffBudgets = largestRemainder(config.count, diffWeights);
  const bloomBudgets = largestRemainder(config.count, bloomPlan.map(() => 1));

  // Expand domains by quota, interleaved so multi-domain blueprints alternate.
  const domainSequence: string[] = [];
  let more = true;
  while (more) {
    more = false;
    scope.forEach((domain, i) => {
      if ((domainBudgets[i] ?? 0) > 0) {
        domainBudgets[i]! -= 1;
        domainSequence.push(domain);
        more = true;
      }
    });
  }

  const argmax = (budgets: number[]) =>
    budgets.reduce((best, v, i) => (v > budgets[best]! ? i : best), 0);

  const slots: QuestionSlot[] = [];
  for (const domain of domainSequence) {
    const dIdx = argmax(diffBudgets);
    const bIdx = argmax(bloomBudgets);
    diffBudgets[dIdx]! -= 1;
    bloomBudgets[bIdx]! -= 1;
    slots.push({
      slotId: `${domain}-${diffPlan[dIdx]}-${bloomPlan[bIdx]}-${slots.length}`,
      domain,
      difficulty: diffPlan[dIdx]!,
      bloom: bloomPlan[bIdx]!,
    });
  }
  return slots;
}

// --- Question builders ---------------------------------------------------------
// Each builder converts one piece of extracted knowledge into a fully grounded
// candidate. Answers and distractors come from the source document itself
// wherever possible; domain vocabulary is only a plausibility backfill.

interface BuilderContext {
  materialTitle: string;
  materialConcepts: string[];
  /** All knowledge items in the document — used for cross-sentence distractors. */
  all: SentenceKnowledge[];
}

function makeCandidate(
  ctx: BuilderContext,
  k: SentenceKnowledge,
  domId: string,
  args: {
    generationType: GeneratedQuestion["generationType"];
    text: string;
    answer: string;
    distractors: string[];
    bloom: Bloom;
    difficulty: Difficulty;
    explanation?: string;
  },
): GeneratedQuestion | null {
  const { text, answer, distractors } = args;
  const opts = [answer, ...distractors.filter((d) => d && d.toLowerCase() !== answer.toLowerCase())].slice(0, 4);
  if (opts.length < 4 || new Set(opts.map((o) => o.toLowerCase())).size !== 4) return null;
  const provenance = k.segLabel === "document" ? ctx.materialTitle : `${ctx.materialTitle} · ${k.segLabel}`;
  return {
    id: stableId("mat", text, provenance),
    text,
    options: opts,
    correctIndex: 0,
    explanation:
      args.explanation ??
      `The material states${k.segLabel === "document" ? "" : ` (${k.segLabel})`}: “${k.sentence}”`,
    sourceRef: `Uploaded material · ${provenance}`,
    domain: domId,
    difficulty: args.difficulty,
    bloom: args.bloom,
    generationType: args.generationType,
    sourceSnippet: k.sentence.slice(0, 220),
    sourceSegmentId: k.segKey,
  };
}

/** Sentences usable as plausible-but-incorrect statement options: real source
 *  sentences from elsewhere in the document that do NOT mention the anchor —
  * so they can never be defensible answers to this stem. */
function statementDistractors(
  ctx: BuilderContext,
  k: SentenceKnowledge,
  excludeAnchor: string,
): string[] {
  const anchorProbe = (excludeAnchor ?? "").toLowerCase().split(/\s+/)[0] ?? "";
  const out: string[] = [];
  for (const other of ctx.all) {
    if (other.segKey === k.segKey && other.sentence === k.sentence) continue;
    if (anchorProbe && other.sentence.toLowerCase().includes(anchorProbe)) continue;
    const t = cap(trimClause(other.sentence));
    if (!out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= 3) break;
  }
  return out;
}

function buildCandidatesFor(k: SentenceKnowledge, ctx: BuilderContext, domId: string): GeneratedQuestion[] {
  const out: GeneratedQuestion[] = [];
  const rot = fnv1a(k.sentence + domId);
  const wc = k.sentence.split(/\s+/).length;

  if (k.kind === "definition" && k.subject && k.predicate) {
    const answer = cap(k.predicate);
    // Prefer predicates from OTHER definitions in the same document as
    // distractors — plausible, domain-relevant, clearly not this definition.
    const others = ctx.all
      .filter((o) => o.kind === "definition" && o.sentence !== k.sentence && o.predicate)
      .map((o) => cap(o.predicate!));
    const backfill = buildDistractors(domId, answer, ctx.materialConcepts, rot);
    const c = makeCandidate(ctx, k, domId, {
      generationType: "material-definition",
      text: `According to the material, ${lowerFirst(k.subject)} is best described as…`,
      answer,
      distractors: [...others, ...backfill],
      bloom: "Understanding",
      difficulty: k.predicate.split(/\s+/).length > 14 ? "Medium" : "Easy",
    });
    if (c) out.push(c);
  }

  if (k.kind === "causal" && k.cause && k.effect) {
    const hard = wc >= 24;
    const effectDistractors = ctx.all
      .filter((o) => o.kind === "causal" && o.effect && o.sentence !== k.sentence)
      .map((o) => o.effect!);
    const causeDistractors = ctx.all
      .filter((o) => o.kind === "causal" && o.cause && o.sentence !== k.sentence)
      .map((o) => trimClause(o.cause!));
    const consequence = makeCandidate(ctx, k, domId, {
      generationType: "material-causal",
      text: `According to the material, what is a likely consequence of ${lowerFirst(trimClause(k.cause))}?`,
      answer: k.effect,
      distractors: [...effectDistractors, ...buildDistractors(domId, k.effect, ctx.materialConcepts, rot)],
      bloom: "Analysis",
      difficulty: hard ? "Hard" : "Medium",
    });
    if (consequence) out.push(consequence);
    // Reverse-direction diagnostic — genuinely higher-order: given the outcome,
    // identify the underlying condition the material names.
    if (hard) {
      const diag = makeCandidate(ctx, k, domId, {
        generationType: "material-analysis",
        text: `A review team observes the following outcome: “${lowerFirst(k.effect)}”. Drawing only on the material, which underlying condition does this most likely reflect?`,
        answer: cap(trimClause(k.cause)),
        distractors: [...causeDistractors, ...buildDistractors(domId, k.cause, ctx.materialConcepts, rot + 7)],
        bloom: "Analysis",
        difficulty: "Hard",
      });
      if (diag) out.push(diag);
    }
  }

  if ((k.kind === "procedure" || k.kind === "rule") && wc >= 10) {
    const guidance = cap(k.sentence);
    const wrongs = statementDistractors(ctx, k, firstContentWord(k.sentence));
    if (wrongs.length >= 3) {
      const anchorTopic = firstContentPhrase(k.sentence, domId);
      const application = k.kind === "rule" || RE_PROCEDURAL.test(k.sentence);
      const c = makeCandidate(ctx, k, domId, {
        generationType: application ? "material-application" : "material-procedure",
        text:
          rot % 2 === 0
            ? `A statistical officer encounters a situation involving ${anchorTopic}. Based on the documented guidance, which statement matches what the material requires?`
            : `Which requirement does the material state regarding ${anchorTopic}?`,
        answer: guidance,
        distractors: wrongs,
        bloom: "Application",
        difficulty: wc >= 25 ? "Hard" : "Medium",
      });
      if (c) out.push(c);
      // Rule-application variant framed as a compliance check.
      if (k.kind === "rule") {
        const rule = makeCandidate(ctx, k, domId, {
          generationType: "material-rule",
          text: `During a quality review, which of the following practices is required by the material's rules on ${anchorTopic}?`,
          answer: guidance,
          distractors: [...wrongs].reverse(),
          bloom: "Application",
          difficulty: "Medium",
        });
        if (rule) out.push(rule);
      }
    }
  }

  if (k.kind === "contrast") {
    const wrongs = statementDistractors(ctx, k, firstContentWord(k.sentence)).filter(
      (s) => !/whereas|unlike|in contrast|rather than/i.test(s),
    );
    if (wrongs.length >= 3) {
      const c = makeCandidate(ctx, k, domId, {
        generationType: "material-comparison",
        text: "Which statement correctly captures a distinction drawn in the material?",
        answer: cap(k.sentence),
        distractors: wrongs,
        bloom: wc >= 22 ? "Analysis" : "Understanding",
        difficulty: wc >= 22 ? "Hard" : "Medium",
      });
      if (c) out.push(c);
    }
  }

  if (k.kind === "example" && k.subject && k.predicate) {
    const exampleDistractors = ctx.all
      .filter((o) => o.kind === "example" && o.predicate && o.sentence !== k.sentence)
      .map((o) => cap(o.predicate!));
    const c = makeCandidate(ctx, k, domId, {
      generationType: "material-example",
      text: `The material illustrates its guidance with examples. Which of the following matches the example given for ${lowerFirst(trimClause(k.subject))}?`,
      answer: cap(k.predicate),
      distractors: [...exampleDistractors, ...buildDistractors(domId, k.predicate, ctx.materialConcepts, rot)],
      bloom: "Application",
      difficulty: "Medium",
    });
    if (c) out.push(c);
  }

  if (k.kind === "numerical" && k.value) {
    const perturbed = numericPerturbations(k.value);
    if (perturbed.length >= 3) {
      const masked = k.sentence.replace(new RegExp(escapeRe(k.value), "i"), "______");
      const c = makeCandidate(ctx, k, domId, {
        generationType: "material-numerical",
        text: `Complete the figure exactly as the material states it — “${masked}”`,
        answer: k.value,
        distractors: perturbed,
        bloom: "Recall",
        difficulty: "Easy",
      });
      if (c) out.push(c);
    }
  }

  return out;
}

/** Human-readable labels for the question-type distribution report. */
const TYPE_LABELS: Record<GeneratedQuestion["generationType"], string> = {
  "material-definition": "Definition",
  "material-cloze": "Concept cloze",
  "material-procedure": "Procedure",
  "material-rule": "Rule application",
  "material-causal": "Cause/effect",
  "material-comparison": "Comparison",
  "material-application": "Application scenario",
  "material-analysis": "Diagnostic analysis",
  "material-example": "Example-based",
  "material-numerical": "Numerical",
  scenario: "Curated scenario",
};

function firstContentWord(sentence: string): string {
  const words = sentence.split(/\s+/).filter((w) => !STOPWORDS.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  return words[0]?.replace(/[^\w-]/g, "") ?? "";
}

function firstContentPhrase(sentence: string, domId: string): string {
  const lower = sentence.toLowerCase();
  const lex = LEXICON[domId];
  const term = [...lex.topicTerms].sort((a, b) => b.length - a.length).find((t) => lower.includes(t));
  return term ?? lowerFirst(firstContentWord(sentence) || "this area");
}

/** Format-preserving numeric perturbations — plausible but provably different
 *  from the value stated in the source. Only used as WRONG options; the source
 *  number is always the single correct answer. */
function numericPerturbations(value: string): string[] {
  const m = /^(.*?)(\d+(?:[.,]\d+)?)(.*)$/.exec(value);
  if (!m) return [];
  const [, pre, numStr, post] = m;
  const n = parseFloat(numStr.replace(",", "."));
  if (!Number.isFinite(n)) return [];
  const decimals = numStr.includes(".") ? numStr.split(".")[1]!.length : 0;
  const fmt = (x: number) => `${pre}${x.toFixed(decimals)}${post}`;
  const candidates = [n * 2, n / 2, n + Math.max(1, Math.round(n * 0.25)), Math.max(0, n - Math.max(1, Math.round(n * 0.15)))];
  const seen = new Set([numStr]);
  const out: string[] = [];
  for (const c of candidates) {
    const s = fmt(c);
    if (!seen.has(s.replace(".", ",")) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
    if (out.length === 3) break;
  }
  return out;
}

// --- Candidate pool -------------------------------------------------------------
// One document → many question opportunities. The pool is built ONCE per
// material (WeakMap cache) and must substantially exceed the requested count
// so blueprint selection and regeneration have genuine alternatives.

const POOL_CAP = 600;
const poolCache = new WeakMap<MaterialRecordInput, GeneratedQuestion[]>();

/** Anchor-aware cloze variants: mask each meaningful term in turn so one
 *  sentence yields multiple valid questions across generations. */
function clozeVariants(
  k: SentenceKnowledge,
  ctx: BuilderContext,
  domId: string,
  maxVariants: number,
): GeneratedQuestion[] {
  const out: GeneratedQuestion[] = [];
  const sentence = k.sentence;
  const wc = sentence.split(/\s+/).length;
  const rot = fnv1a(sentence + "cloze");
  const lowerSentence = sentence.toLowerCase();
  const lex = LEXICON[domId];
  const anchors: string[] = [];
  for (const concept of lex.concepts) {
    if (lowerSentence.includes(concept.toLowerCase())) anchors.push(concept);
  }
  for (const term of [...lex.topicTerms].sort((a, b) => b.length - a.length)) {
    if (anchors.length >= maxVariants) break;
    if (!lowerSentence.includes(term)) continue;
    const idx = lowerSentence.indexOf(term);
    let sIdx = idx;
    let eIdx = idx + term.length;
    while (sIdx > 0 && /[\w-]/.test(sentence[sIdx - 1]!)) sIdx--;
    while (eIdx < sentence.length && /[\w-]/.test(sentence[eIdx]!)) eIdx++;
    const phrase = sentence.slice(sIdx, eIdx);
    if (phrase.length >= 3 && !anchors.some((a) => a.toLowerCase() === phrase.toLowerCase())) anchors.push(phrase);
  }
  const bloom = naturalBloom(sentence, wc);
  const difficulty = naturalDifficulty(wc);
  for (let v = 0; v < Math.min(maxVariants, anchors.length); v++) {
    const anchor = anchors[v]!;
    const cloze = sentence.replace(new RegExp(escapeRe(anchor), "i"), "______");
    if (cloze === sentence) continue;
    const picks = buildDistractors(domId, anchor, ctx.materialConcepts, rot + v * 11);
    if (picks.length < 3) continue;
    const variant = (rot + v) % 2;
    const text = `${STEMS[bloom][variant]}${cloze}”`;
    const provenance = k.segLabel === "document" ? ctx.materialTitle : `${ctx.materialTitle} · ${k.segLabel}`;
    out.push({
      id: stableId("mat", text, provenance),
      text,
      options: [anchor, ...picks],
      correctIndex: 0,
      explanation: `The material states${k.segLabel === "document" ? "" : ` (${k.segLabel})`}: “${sentence}”`,
      sourceRef: `Uploaded material · ${provenance}`,
      domain: domId,
      difficulty,
      bloom,
      generationType: "material-cloze",
      sourceSnippet: sentence.slice(0, 220),
      sourceSegmentId: k.segKey,
    });
  }
  return out;
}

function buildMaterialPool(material: MaterialRecordInput | null): GeneratedQuestion[] {
  if (!material?.text || material.simulatedExtraction) return [];
  const cached = poolCache.get(material);
  if (cached) return cached;

  const segments = segmentMaterial(material.text);
  const knowledge = extractKnowledge(segments);
  const ctx: BuilderContext = {
    materialTitle: material.title,
    materialConcepts: material.concepts ?? [],
    all: knowledge,
  };

  const out: GeneratedQuestion[] = [];
  const seenStructural = new Set<string>();
  const seenFingerprint = new Set<string>();

  const accept = (c: GeneratedQuestion): boolean => {
    if (out.length >= POOL_CAP) return false;
    // Near-duplicate protection: reject identical word-bags and identical
    // (type × segment × concept) structures even when punctuation differs.
    const fp = fingerprint(`${c.text} ${c.options[c.correctIndex] ?? ""}`);
    const structural = `${c.generationType}:${c.sourceSegmentId}:${fingerprint(c.options[c.correctIndex] ?? "").slice(0, 60)}`;
    if (seenFingerprint.has(fp) || seenStructural.has(structural)) return false;
    seenFingerprint.add(fp);
    seenStructural.add(structural);
    out.push(c);
    return true;
  };

  for (const k of knowledge) {
    for (const domId of k.domains.length ? k.domains : [detectDomains(k.sentence.toLowerCase())[0]?.id ?? DOMAINS[6].id]) {
      for (const c of buildCandidatesFor(k, ctx, domId)) accept(c);
      for (const c of clozeVariants(k, ctx, domId, 2)) accept(c);
      if (out.length >= POOL_CAP) break;
    }
    if (out.length >= POOL_CAP) break;
  }

  poolCache.set(material, out);
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
      options.learnerContext?.averageGap !== undefined ? String(Math.round(options.learnerContext.averageGap)) : "",
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

  // Blueprint matrix — largest-remainder allocation over domain × difficulty ×
  // Bloom. Adaptive mode derives its difficulty weights from live competency
  // evidence when available.
  const diffPlan: Difficulty[] =
    config.difficulty === "Mixed" || config.difficulty === "Adaptive"
      ? ["Easy", "Medium", "Hard"]
      : [config.difficulty as Difficulty];
  const bloomPlan: Bloom[] =
    config.bloom === "Mixed"
      ? ["Recall", "Understanding", "Application", "Analysis"]
      : [config.bloom as Bloom];
  const slots = buildBlueprintMatrix(config, scope, options.learnerContext);

  const slotFits = (c: GeneratedQuestion, s: (typeof slots)[number]) =>
    c.domain === s.domain && diffPlan.includes(c.difficulty as Difficulty) && bloomPlan.includes(c.bloom);
  // Fixed blueprint dimensions are NEVER relaxed — a request for "Easy" or
  // "Application" must not silently receive Medium/Hard items. Only genuinely
  // mixed plans allow cross-level filling.
  const levelStrict = (c: GeneratedQuestion) =>
    (diffPlan.length === 1 ? c.difficulty === config.difficulty : true) &&
    (bloomPlan.length === 1 ? c.bloom === config.bloom : true);
  const fresh = (c: GeneratedQuestion) => c && !exclude.has(c.id);

  // Part 30 transparency: name any explicitly selected domain the material
  // cannot support at all.
  if (material && config.domains.length) {
    for (const dom of config.domains) {
      if (!materialPool.some((x) => x.domain === dom)) {
        noteOnce(noted, `absent-${dom}`,
          `${domainName(dom)} is not represented in the uploaded material — its slots draw from the curated scenario bank.`);
      }
    }
  }

  const picked: GeneratedQuestion[] = [];
  const used = new Set<string>();
  let materialDerived = 0;
  let scenarioFallback = 0;
  let exactMatches = 0;
  const domainShortfall = new Set<string>();
  const segUsage = new Map<string, number>();
  const typeUsage = new Map<string, number>();

  /** Ranked pick (Part 27): blueprint fit first, then source-segment diversity,
   *  question-type diversity, novelty vs this session's history, plus a small
   *  seeded jitter so generations rotate without becoming unpredictable. */
  const pickBest = (candidates: GeneratedQuestion[]): GeneratedQuestion | undefined => {
    if (candidates.length === 0) return undefined;
    let best: GeneratedQuestion | undefined;
    let bestScore = -Infinity;
    for (const c of candidates) {
      const segPenalty = 12 * (segUsage.get(c.sourceSegmentId ?? c.sourceRef) ?? 0);
      const typePenalty = 10 * (typeUsage.get(c.generationType) ?? 0);
      const novelty = 8 * Math.min(2, (c.sourceSnippet?.length ?? 0) > 80 ? 1 : 0);
      const score =
        50 - segPenalty - typePenalty + novelty + rng() * 6;
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  };

  for (const slot of slots) {
    if (picked.length >= config.count) break;
    // Priority ladder — material always outranks the bank when any fresh
    // candidate exists; deviations are disclosed in report notes, never silent.
    // 1) Material-grounded candidates matching the full slot contract, ranked…
    const exactMaterial = materialPool.filter(
      (x) => slotFits(x, slot) && !used.has(x.id) && fresh(x),
    );
    let c: GeneratedQuestion | undefined = pickBest(exactMaterial);
    let source: "material" | "scenario" = "material";
    if (c) exactMatches++;
    // 2) …then curated scenarios matching the same contract, ranked.
    if (!c) {
      c = pickBest(scenarioPool.filter((x) => slotFits(x, slot) && !used.has(x.id) && fresh(x)));
      source = "scenario";
      if (c) exactMatches++;
    }
    // 2) …then a curated scenario matching the same contract.
    if (!c) {
      c = scenarioPool.find((x) => slotFits(x, slot) && !used.has(x.id) && fresh(x));
      source = "scenario";
    }
    // 3) Any remaining material candidate that still honours FIXED blueprint
    //    dimensions — source dominance beats domain purity in mixed plans.
    if (!c) {
      c = pickBest(materialPool.filter((x) => levelStrict(x) && !used.has(x.id) && fresh(x)));
      if (c) {
        source = "material";
        if (c.domain !== slot.domain) {
          noteOnce(noted, `dom-${slot.domain}`,
            `${domainName(slot.domain)} could not fill its full quota from this source — covered from neighbouring material content.`);
          domainShortfall.add(slot.domain);
        }
      }
    }
    // 4) Relaxed scenario — still honouring fixed dimensions.
    if (!c) {
      c = pickBest(scenarioPool.filter((x) => levelStrict(x) && !used.has(x.id) && fresh(x)));
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
    const segKey = c.sourceSegmentId ?? c.sourceRef;
    segUsage.set(segKey, (segUsage.get(segKey) ?? 0) + 1);
    typeUsage.set(c.generationType, (typeUsage.get(c.generationType) ?? 0) + 1);
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

  // Near-duplicate protection on the delivered set — normalized word-bag
  // fingerprints catch same-question-different-punctuation survivors.
  const deliveredFps = new Set<string>();
  finalQs = finalQs.filter((q) => {
    const fp = fingerprint(`${q.text} ${q.options[q.correctIndex] ?? ""}`);
    if (deliveredFps.has(fp)) return false;
    deliveredFps.add(fp);
    return true;
  });

  if (finalQs.length < config.count) {
    notes.push(
      `Only ${finalQs.length} high-confidence question${finalQs.length === 1 ? "" : "s"} could be built for this blueprint — none were fabricated to reach ${config.count}.`,
    );
  }

  const segmentsUsed = new Set(finalQs.map((q) => q.sourceSegmentId ?? q.sourceRef)).size;
  const distinctTypes = new Set(finalQs.map((q) => q.generationType)).size;

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
    {
      label: "Source diversity",
      pass: segmentsUsed >= Math.min(3, finalQs.length),
      note: `${segmentsUsed} distinct source segment${segmentsUsed === 1 ? "" : "s"} represented`,
    },
    {
      label: "Question-type variety",
      pass: distinctTypes >= Math.min(3, finalQs.length),
      note:
        distinctTypes >= Math.min(3, finalQs.length)
          ? `${distinctTypes} generation strategies in play`
          : "Limited by what the source supports — no fabricated variety",
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
    adherencePct: Math.round((exactMatches / Math.max(slots.length, 1)) * 100),
    domainDistribution: tally((q) => domainName(q.domain)),
    difficultyDistribution: tally((q) => q.difficulty),
    bloomDistribution: tally((q) => q.bloom),
    questionTypes: tally((q) => TYPE_LABELS[q.generationType] ?? q.generationType),
    sources: { materialDerived, scenarioFallback },
    candidatePoolSize: materialPool.length + scenarioPool.length,
    sourceSegmentsUsed: segmentsUsed,
    notes,
  };

  return {
    questions: finalQs,
    quality: { score, checks },
    report,
  };
}


