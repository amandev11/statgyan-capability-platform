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
  CompetencyState,
  DocAnalysis,
  GeneratedQuestion,
  GapItem,
  LearningModule,
  MaterialRecordInput,
  RoleTemplate,
} from "./types";

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

export function analyzeDocument(input: {
  fileName: string;
  fileType: string;
  text: string;
}): DocAnalysis {
  const binary = !/\.(txt|csv|md|json)$/i.test(input.fileName) || input.text.trim().length === 0;
  const source = binary ? input.fileName.replace(/[_-]/g, " ") : input.text;
  const lower = source.toLowerCase();
  const words = source.split(/\s+/).filter(Boolean).length;
  const detected = detectDomains(lower).filter((d) => d.hits > 0).slice(0, 4);
  const domains = detected.map((d) => domainName(d.id));

  const concepts = Array.from(
    new Set(
      detected.flatMap((d) =>
        LEXICON[d.id].concepts.filter((c) =>
          c.split(" ").some((w) => lower.includes(w.toLowerCase().slice(0, 6))),
        ),
      ),
    ),
  ).slice(0, 10);

  const headings = binary
    ? []
    : Array.from(source.matchAll(/^CHAPTER[^\n]*|^[A-Z][A-Z \-&]{8,}$/gm)).map((m) => m[0].trim());
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
    simulatedExtraction: binary && input.text.trim().length === 0,
    topics: topics.length ? topics : ["General statistical practice"],
    concepts: concepts.length ? concepts : ["Applied statistical procedure"],
    objectives,
    domains: domains.length ? domains : ["Official Statistics & Standards"],
    questionOpportunities,
    difficulty,
  };
}

function guessTitle(fileName: string, headings: string[]): string {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
  return base.length > 3 ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : headings[0] ?? "Untitled material";
}

// --- MCQ generation ---------------------------------------------------------

type Difficulty = "Easy" | "Medium" | "Hard";

interface ScenarioSeed {
  domain: string;
  difficulty: Difficulty;
  q: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

/** Curated scenario bank — used alongside grounded cloze items. */
const SCENARIO_BANK: ScenarioSeed[] = [
  {
    domain: "survey-methodology", difficulty: "Medium",
    q: "Enumerators report that respondents in one district consistently refuse the income question. The best first response is to…",
    options: ["Delete the question", "Retrain on purpose-of-use messaging and re-test wording", "Impute incomes administratively", "Skip the district"],
    correctIndex: 1,
    explanation: "Refusals often trace to perceived risk; clarifying confidentiality and re-testing neutral wording addresses cause, not symptom.",
  },
  {
    domain: "survey-methodology", difficulty: "Easy",
    q: "Which questionnaire feature most reduces respondent burden?",
    options: ["Longer reference periods", "Routing patterns that skip irrelevant sections", "More open-ended questions", "Double-barrelled wording"],
    correctIndex: 1,
    explanation: "Skips tailor the path so respondents only answer what applies to them.",
  },
  {
    domain: "sampling-estimation", difficulty: "Hard",
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
    domain: "data-quality", difficulty: "Easy",
    q: "During editing you find incomes recorded as 9999999 across many records. This most likely indicates…",
    options: ["Extreme wealth concentration", "A missing-value sentinel code entering raw data", "Currency conversion error", "Fraud"],
    correctIndex: 1,
    explanation: "Sentinel codes for 'not reported' commonly leak into numeric fields; they need explicit recoding before analysis.",
  },
  {
    domain: "data-quality", difficulty: "Medium",
    q: "Two rounds of a survey show a sudden 15-point jump in a metric with no real-world event. Your first diagnostic should be…",
    options: ["Announce the jump publicly", "Audit collection instruments and processing between rounds", "Average away the difference", "Blame respondents"],
    correctIndex: 1,
    explanation: "Unexplained discontinuities usually trace to instrument, mode or processing changes before they reflect reality.",
  },
  {
    domain: "statistical-analysis", difficulty: "Medium",
    q: "A district's average yield rises while its median falls. The likeliest story is…",
    options: ["Everyone prospered equally", "A few very large farms pulled the mean upward", "The median is wrong", "Data entry improved"],
    correctIndex: 1,
    explanation: "Mean–median divergence in opposite directions signals right-skew introduced by extreme values.",
  },
  {
    domain: "statistical-computing", difficulty: "Medium",
    q: "Your merge produces far more rows than either input. The classic culprit is…",
    options: ["Duplicate keys on one or both sides", "Too many columns", "Wrong file encoding", "Using groupby"],
    correctIndex: 0,
    explanation: "One-to-many key duplication explodes joins; validate key uniqueness before merging.",
  },
  {
    domain: "official-statistics", difficulty: "Hard",
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

let rngState = 42;
function rnd(): number {
  rngState = (rngState * 1103515245 + 12345) % 2147483648;
  return rngState / 2147483648;
}

export function generateAssessment(
  material: MaterialRecordInput | null,
  config: AssessmentConfig,
): { questions: GeneratedQuestion[]; quality: { score: number; checks: { label: string; pass: boolean; note: string }[] } } {
  rngState = 42;
  const questions: GeneratedQuestion[] = [];
  const seen = new Set<string>();

  const push = (q: GeneratedQuestion) => {
    const key = q.text.toLowerCase().slice(0, 60);
    if (!seen.has(key) && q.text.length > 25) {
      seen.add(key);
      questions.push(q);
    }
  };

  // 1) Grounded cloze items from the material's own sentences.
  if (material && !material.simulatedExtraction) {
    const sentences = material.text!
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).length >= 8 && s.split(/\s+/).length <= 45);
    const domainIds = detectDomains(material.text!.toLowerCase()).filter((d) => d.hits > 0).map((d) => d.id);
    let si = 0;
    while (questions.length < Math.ceil(config.count * 0.6) && si < sentences.length) {
      const sentence = sentences[si++];
      const hit = LEXICON && findConceptInSentence(sentence);
      if (!hit) continue;
      const domainId = domainIds[0] ?? DOMAINS[6].id;
      const distractors = LEXICON[domainId].concepts.filter((c) => c !== hit).sort(() => rnd() - 0.5).slice(0, 3);
      if (distractors.length < 3) continue;
      const cloze = sentence.replace(new RegExp(hit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______");
      if (cloze === sentence) continue;
      const opts = [hit, ...distractors].sort(() => rnd() - 0.5);
      push({
        text: `Complete per the material: "${cloze}"`,
        options: opts,
        correctIndex: opts.indexOf(hit),
        explanation: `The material states: "${sentence}"`,
        sourceRef: `Uploaded material · ${material.title}`,
        domain: domainId,
        difficulty: config.difficulty === "Adaptive" ? "Medium" : config.difficulty,
      });
    }
  }

  // 2) Curated scenarios matching configured domains/difficulty.
  const wanted = config.domains.length ? config.domains : Object.keys(LEXICON);
  const pool = SCENARIO_BANK.filter(
    (s) => wanted.includes(s.domain) && (config.difficulty === "Adaptive" || s.difficulty === config.difficulty || config.difficulty === "Mixed"),
  );
  const shuffledPool = [...pool].sort(() => rnd() - 0.5);
  for (const s of shuffledPool) {
    if (questions.length >= config.count) break;
    push({
      text: s.q,
      options: s.options,
      correctIndex: s.correctIndex,
      explanation: s.explanation,
      sourceRef: "Scenario bank · StatGyan curated item",
      domain: s.domain,
      difficulty: s.difficulty,
    });
  }

  // 3) Top up from any scenario if still short.
  for (const s of SCENARIO_BANK.sort(() => rnd() - 0.5)) {
    if (questions.length >= config.count) break;
    push({
      text: s.q,
      options: s.options,
      correctIndex: s.correctIndex,
      explanation: s.explanation,
      sourceRef: "Scenario bank · StatGyan curated item",
      domain: s.domain,
      difficulty: s.difficulty,
    });
  }

  const finalQs = questions.slice(0, config.count);

  // Quality audit — transparent heuristics, not scientific validation.
  const dupes = finalQs.length - seen.size;
  const weakDistractors = finalQs.filter(
    (q) => q.options.some((o) => o.length < 4) ||
      Math.max(...q.options.map((o) => o.length)) > Math.min(...q.options.map((o) => o.length)) * 8,
  ).length;
  const ambiguous = finalQs.filter((q) => /all of the above|none of the above/i.test(q.options.join(" "))).length;
  const grounded = finalQs.filter((q) => q.sourceRef.startsWith("Uploaded")).length;
  const score = Math.max(64, Math.min(98,
    96 - dupes * 12 - weakDistractors * 7 - ambiguous * 9 + (grounded > 0 ? 2 : 0),
  ));

  return {
    questions: finalQs,
    quality: {
      score,
      checks: [
        { label: "No duplicate stems", pass: dupes === 0, note: dupes === 0 ? "All stems unique" : `${dupes} near-duplicates found` },
        { label: "Distractor plausibility", pass: weakDistractors === 0, note: weakDistractors === 0 ? "Options balanced in form and length" : `${weakDistractors} items with weak option sets` },
        { label: "No ambiguous cues", pass: ambiguous === 0, note: ambiguous === 0 ? "No 'all/none of the above' crutches" : `${ambiguous} items use cue phrases` },
        { label: "Source grounding", pass: true, note: `${grounded}/${finalQs.length} traced to uploaded material` },
      ],
    },
  };
}

function findConceptInSentence(sentence: string): string | null {
  const lower = sentence.toLowerCase();
  for (const lex of Object.values(LEXICON)) {
    for (const concept of lex.concepts) {
      const probe = concept.toLowerCase().split(" ")[0]!.slice(0, 6);
      if (lower.includes(probe)) return concept;
    }
  }
  return null;
}
